package com.proptech.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import com.proptech.entity.Role;
import com.proptech.exception.ResourceNotFoundException;
import com.proptech.exception.UnauthorizedException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.proptech.dto.request.SaleRequest;
import com.proptech.dto.response.ApiResponse;
import com.proptech.dto.response.PagedResponse;
import com.proptech.entity.Listing;
import com.proptech.entity.Sale;
import com.proptech.entity.User;
import com.proptech.entity.Listing.ListingType;
import com.proptech.entity.Sale.SaleStatus;
import com.proptech.repository.ListingRepository;
import com.proptech.repository.SaleRepository;
import com.proptech.repository.UserRepository;

@Service
public class SalesService {
    @Autowired
    private SaleRepository saleRepository;

    @Autowired
    private ListingRepository listingRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserService userService;

    @Transactional
    public Sale createSale(SaleRequest saleRequest, Long realtorId) {
        User realtor = userRepository.findById(realtorId)
                .orElseThrow(() -> new RuntimeException("Error: Realtor not found with id " + realtorId));

        if (!userService.isRealtor(realtor) && !userService.isAdmin(realtor)) {
            throw new RuntimeException("Error: User is not authorized to create sales");
        }

        Listing listing = listingRepository.findById(saleRequest.getListingId())
                .orElseThrow(() -> new RuntimeException("Error: Listing not found with id " + saleRequest.getListingId()));

        if (listing.getListingType() != ListingType.SALE) {
            throw new RuntimeException("Error: Listing is not available for sale");
        }

        if (!listing.isActive()) {
            throw new RuntimeException("Error: Listing is not active");
        }

        User buyer = userRepository.findById(saleRequest.getBuyerId())
                .orElseThrow(() -> new RuntimeException("Error: Buyer not found with id " + saleRequest.getBuyerId()));

        Sale sale = new Sale();
        sale.setListing(listing);
        sale.setBuyer(buyer);
        sale.setRealtor(realtor);
        sale.setSalePrice(saleRequest.getSalePrice());
        sale.setCommission(saleRequest.getCommission());
        sale.setStatus(SaleStatus.PENDING);
        sale.setNotes(saleRequest.getNotes());
        sale.setClosingDate(saleRequest.getClosingDate());

        // Deactivate the listing once it's sold
        listing.setActive(false);
        listingRepository.save(listing);

        return saleRepository.save(sale);
    }

    public Sale getSaleById(Long saleId) {
        return saleRepository.findById(saleId)
                .orElseThrow(() -> new RuntimeException("Error: Sale not found with id " + saleId));
    }

    public List<Sale> getSalesByBuyer(Long buyerId) {
        User buyer = userRepository.findById(buyerId)
                .orElseThrow(() -> new RuntimeException("Error: Buyer not found with id " + buyerId));

        return saleRepository.findByBuyer(buyer);
    }

    public List<Sale> getSalesByRealtor(Long realtorId) {
        User realtor = userRepository.findById(realtorId)
                .orElseThrow(() -> new RuntimeException("Error: Realtor not found with id " + realtorId));

        return saleRepository.findByRealtor(realtor);
    }

    public PagedResponse<Sale> getSalesByStatus(SaleStatus status, Pageable pageable) {
        Page<Sale> sales = saleRepository.findByStatus(status, pageable);

        return new PagedResponse<>(
                sales.getContent(),
                sales.getNumber(),
                sales.getSize(),
                sales.getTotalElements(),
                sales.getTotalPages(),
                sales.isLast(),
                sales.isFirst()
        );
    }

    public PagedResponse<Sale> getSalesByRealtorAndStatus(Long realtorId, SaleStatus status, Pageable pageable) {
        User realtor = userRepository.findById(realtorId)
                .orElseThrow(() -> new RuntimeException("Error: Realtor not found with id " + realtorId));

        Page<Sale> sales = saleRepository.findByRealtorAndStatus(realtor, status, pageable);

        return new PagedResponse<>(
                sales.getContent(),
                sales.getNumber(),
                sales.getSize(),
                sales.getTotalElements(),
                sales.getTotalPages(),
                sales.isLast(),
                sales.isFirst()
        );
    }

    @Transactional
    public Sale updateSaleStatus(Long saleId, SaleStatus status, String notes, Long userId) {
        Sale sale = saleRepository.findById(saleId)
                .orElseThrow(() -> new RuntimeException("Error: Sale not found with id " + saleId));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Error: User not found with id " + userId));

        // Only the sale's realtor or an admin can update the sale
        if (!sale.getRealtor().getId().equals(userId) && !userService.isAdmin(user)) {
            throw new RuntimeException("Error: User is not authorized to update this sale");
        }

        sale.setStatus(status);

        if (notes != null && !notes.isEmpty()) {
            sale.setNotes(notes);
        }

        if (status == SaleStatus.COMPLETED) {
            sale.setClosingDate(LocalDateTime.now());
        }

        return saleRepository.save(sale);
    }
    /**
     * Updates an existing sale with all fields
     *
     * @param id         ID of the sale to update
     * @param request    Updated sale information
     * @param userId     ID of the user performing the update
     * @return The updated sale entity
     */
    public Sale updateSale(Long id, SaleRequest request, Long userId) {
        // Fetch the existing sale
        Sale sale = getSaleById(id);

        // Check authorization (either admin or the realtor who created the sale)
        User currentUser = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        boolean isAdmin = currentUser.getRoles().stream()
                .anyMatch(role -> role.getName().equals(Role.ERole.ROLE_ADMIN));

        if (!isAdmin && !sale.getRealtor().getId().equals(userId)) {
            throw new UnauthorizedException("You don't have permission to update this sale");
        }

        // Fetch related entities
        Listing listing = listingRepository.findById(request.getListingId())
                .orElseThrow(() -> new ResourceNotFoundException("Listing", "id", request.getListingId()));

        User buyer = userRepository.findById(request.getBuyerId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", request.getBuyerId()));

        // Update sale fields
        sale.setListing(listing);
        sale.setBuyer(buyer);
        sale.setSalePrice(request.getSalePrice());
        sale.setCommission(request.getCommission());
        sale.setNotes(request.getNotes());

        // Only update closing date if provided
        if (request.getClosingDate() != null) {
            sale.setClosingDate(request.getClosingDate());
        }

        // Update status if provided
        if (request.getStatus() != null) {
            sale.setStatus(request.getStatus());
        }

        // Save and return updated sale
        return saleRepository.save(sale);
    }
}
