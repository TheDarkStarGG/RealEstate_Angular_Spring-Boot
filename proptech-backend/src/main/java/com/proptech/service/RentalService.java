package com.proptech.service;

import java.time.LocalDate;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.proptech.dto.request.RentalRequest;
import com.proptech.dto.response.PagedResponse;
import com.proptech.entity.Listing;
import com.proptech.entity.Rental;
import com.proptech.entity.User;
import com.proptech.entity.Listing.ListingType;
import com.proptech.entity.Rental.RentalStatus;
import com.proptech.repository.ListingRepository;
import com.proptech.repository.RentalRepository;
import com.proptech.repository.UserRepository;

@Service
public class RentalService {
    @Autowired
    private RentalRepository rentalRepository;

    @Autowired
    private ListingRepository listingRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserService userService;

    @Transactional
    public Rental createRental(RentalRequest rentalRequest, Long realtorId) {
        User realtor = userRepository.findById(realtorId)
                .orElseThrow(() -> new RuntimeException("Error: Realtor not found with id " + realtorId));

        if (!userService.isRealtor(realtor) && !userService.isAdmin(realtor)) {
            throw new RuntimeException("Error: User is not authorized to create rentals");
        }

        Listing listing = listingRepository.findById(rentalRequest.getListingId())
                .orElseThrow(() -> new RuntimeException("Error: Listing not found with id " + rentalRequest.getListingId()));

        if (listing.getListingType() != ListingType.RENT) {
            throw new RuntimeException("Error: Listing is not available for rent");
        }

        if (!listing.isActive()) {
            throw new RuntimeException("Error: Listing is not active");
        }

        User tenant = userRepository.findById(rentalRequest.getTenantId())
                .orElseThrow(() -> new RuntimeException("Error: Tenant not found with id " + rentalRequest.getTenantId()));

        Rental rental = new Rental();
        rental.setListing(listing);
        rental.setTenant(tenant);
        rental.setRealtor(realtor);
        rental.setMonthlyRate(rentalRequest.getMonthlyRate());
        rental.setSecurityDeposit(rentalRequest.getSecurityDeposit());
        rental.setCommission(rentalRequest.getCommission());
        rental.setStartDate(rentalRequest.getStartDate());
        rental.setEndDate(rentalRequest.getEndDate());
        rental.setStatus(RentalStatus.PENDING);
        rental.setNotes(rentalRequest.getNotes());

        // Deactivate the listing once it's rented
        listing.setActive(false);
        listingRepository.save(listing);

        return rentalRepository.save(rental);
    }

    @Transactional
    public Rental updateRental(Long rentalId, RentalRequest rentalRequest, Long userId) {
        Rental rental = rentalRepository.findById(rentalId)
                .orElseThrow(() -> new RuntimeException("Error: Rental not found with id " + rentalId));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Error: User not found with id " + userId));

        // Only the rental's realtor or an admin can update the rental
        if (!rental.getRealtor().getId().equals(userId) && !userService.isAdmin(user)) {
            throw new RuntimeException("Error: User is not authorized to update this rental");
        }

        // If updating to a different listing
        if (!rental.getListing().getId().equals(rentalRequest.getListingId())) {
            Listing newListing = listingRepository.findById(rentalRequest.getListingId())
                    .orElseThrow(() -> new RuntimeException("Error: Listing not found with id " + rentalRequest.getListingId()));

            if (newListing.getListingType() != ListingType.RENT) {
                throw new RuntimeException("Error: Listing is not available for rent");
            }

            if (!newListing.isActive()) {
                throw new RuntimeException("Error: Listing is not active");
            }

            // Make the old listing active again
            Listing oldListing = rental.getListing();
            oldListing.setActive(true);
            listingRepository.save(oldListing);

            // Set and deactivate the new listing
            rental.setListing(newListing);
            newListing.setActive(false);
            listingRepository.save(newListing);
        }

        // If updating to a different tenant
        if (!rental.getTenant().getId().equals(rentalRequest.getTenantId())) {
            User tenant = userRepository.findById(rentalRequest.getTenantId())
                    .orElseThrow(() -> new RuntimeException("Error: Tenant not found with id " + rentalRequest.getTenantId()));
            rental.setTenant(tenant);
        }

        rental.setMonthlyRate(rentalRequest.getMonthlyRate());
        rental.setSecurityDeposit(rentalRequest.getSecurityDeposit());
        rental.setCommission(rentalRequest.getCommission());
        rental.setStartDate(rentalRequest.getStartDate());
        rental.setEndDate(rentalRequest.getEndDate());

        if (rentalRequest.getStatus() != null) {
            rental.setStatus(rentalRequest.getStatus());
        }

        if (rentalRequest.getNotes() != null) {
            rental.setNotes(rentalRequest.getNotes());
        }

        return rentalRepository.save(rental);
    }

    public Rental getRentalById(Long rentalId) {
        return rentalRepository.findById(rentalId)
                .orElseThrow(() -> new RuntimeException("Error: Rental not found with id " + rentalId));
    }

    public List<Rental> getRentalsByTenant(Long tenantId) {
        User tenant = userRepository.findById(tenantId)
                .orElseThrow(() -> new RuntimeException("Error: Tenant not found with id " + tenantId));

        return rentalRepository.findByTenant(tenant);
    }

    public List<Rental> getRentalsByRealtor(Long realtorId) {
        User realtor = userRepository.findById(realtorId)
                .orElseThrow(() -> new RuntimeException("Error: Realtor not found with id " + realtorId));

        return rentalRepository.findByRealtor(realtor);
    }

    public PagedResponse<Rental> getRentalsByStatus(RentalStatus status, Pageable pageable) {
        Page<Rental> rentals = rentalRepository.findByStatus(status, pageable);

        return new PagedResponse<>(
                rentals.getContent(),
                rentals.getNumber(),
                rentals.getSize(),
                rentals.getTotalElements(),
                rentals.getTotalPages(),
                rentals.isLast(),
                rentals.isFirst()
        );
    }

    public PagedResponse<Rental> getRentalsByRealtorAndStatus(Long realtorId, RentalStatus status, Pageable pageable) {
        User realtor = userRepository.findById(realtorId)
                .orElseThrow(() -> new RuntimeException("Error: Realtor not found with id " + realtorId));

        Page<Rental> rentals = rentalRepository.findByRealtorAndStatus(realtor, status, pageable);

        return new PagedResponse<>(
                rentals.getContent(),
                rentals.getNumber(),
                rentals.getSize(),
                rentals.getTotalElements(),
                rentals.getTotalPages(),
                rentals.isLast(),
                rentals.isFirst()
        );
    }

    public PagedResponse<Rental> getActiveRentals(Pageable pageable) {
        Page<Rental> rentals = rentalRepository.findByEndDateAfter(LocalDate.now(), pageable);

        return new PagedResponse<>(
                rentals.getContent(),
                rentals.getNumber(),
                rentals.getSize(),
                rentals.getTotalElements(),
                rentals.getTotalPages(),
                rentals.isLast(),
                rentals.isFirst()
        );
    }

    @Transactional
    public Rental updateRentalStatus(Long rentalId, RentalStatus status, String notes, Long userId) {
        Rental rental = rentalRepository.findById(rentalId)
                .orElseThrow(() -> new RuntimeException("Error: Rental not found with id " + rentalId));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Error: User not found with id " + userId));

        // Only the rental's realtor or an admin can update the rental
        if (!rental.getRealtor().getId().equals(userId) && !userService.isAdmin(user)) {
            throw new RuntimeException("Error: User is not authorized to update this rental");
        }

        rental.setStatus(status);

        if (notes != null && !notes.isEmpty()) {
            rental.setNotes(notes);
        }

        if (status == RentalStatus.COMPLETED) {
            // If the rental is completed, make the listing active again
            Listing listing = rental.getListing();
            listing.setActive(true);
            listingRepository.save(listing);
        }

        return rentalRepository.save(rental);
    }

    @Transactional
    public Rental extendRental(Long rentalId, LocalDate newEndDate, Long userId) {
        Rental rental = rentalRepository.findById(rentalId)
                .orElseThrow(() -> new RuntimeException("Error: Rental not found with id " + rentalId));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Error: User not found with id " + userId));

        // Only the rental's realtor or an admin can extend the rental
        if (!rental.getRealtor().getId().equals(userId) && !userService.isAdmin(user)) {
            throw new RuntimeException("Error: User is not authorized to extend this rental");
        }

        if (newEndDate.isBefore(rental.getEndDate())) {
            throw new RuntimeException("Error: New end date cannot be before the current end date");
        }

        rental.setEndDate(newEndDate);
        return rentalRepository.save(rental);
    }
}