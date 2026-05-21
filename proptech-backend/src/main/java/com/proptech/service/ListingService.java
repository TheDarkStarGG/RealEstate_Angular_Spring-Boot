package com.proptech.service;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.proptech.dto.request.ListingRequest;
import com.proptech.dto.response.ListingResponse;
import com.proptech.dto.response.PagedResponse;
import com.proptech.entity.Listing;
import com.proptech.entity.User;
import com.proptech.entity.Listing.ListingType;
import com.proptech.entity.Listing.PropertyType;
import com.proptech.repository.ListingRepository;
import com.proptech.repository.UserRepository;

@Service
public class ListingService {
    @Autowired
    private ListingRepository listingRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserService userService;

    public ListingResponse createListing(ListingRequest listingRequest, Long realtorId) {
        User realtor = userRepository.findById(realtorId)
                .orElseThrow(() -> new RuntimeException("Error: Realtor not found with id " + realtorId));

        if (!userService.isRealtor(realtor) && !userService.isAdmin(realtor)) {
            throw new RuntimeException("Error: User is not authorized to create listings");
        }

        Listing listing = new Listing();
        listing.setTitle(listingRequest.getTitle());
        listing.setDescription(listingRequest.getDescription());
        listing.setAddress(listingRequest.getAddress());
        listing.setCity(listingRequest.getCity());
        listing.setState(listingRequest.getState());
        listing.setZipCode(listingRequest.getZipCode());
        listing.setPrice(listingRequest.getPrice());
        listing.setBedrooms(listingRequest.getBedrooms());
        listing.setBathrooms(listingRequest.getBathrooms());
        listing.setArea(listingRequest.getArea());
        listing.setPropertyType(listingRequest.getPropertyType());
        listing.setListingType(listingRequest.getListingType());
        listing.setImages(listingRequest.getImages());
        listing.setRealtor(realtor);
        listing.setActive(listingRequest.isActive());

        Listing savedListing = listingRepository.save(listing);
        return ListingResponse.fromEntity(savedListing);
    }

    public ListingResponse getListingById(Long listingId) {
        Listing listing = listingRepository.findById(listingId)
                .orElseThrow(() -> new RuntimeException("Error: Listing not found with id " + listingId));

        return ListingResponse.fromEntity(listing);
    }

    public PagedResponse<ListingResponse> getAllListings(Pageable pageable) {
        Page<Listing> listings = listingRepository.findAll(pageable);

        List<ListingResponse> content = listings.getContent().stream()
                .map(ListingResponse::fromEntity)
                .collect(Collectors.toList());

        return new PagedResponse<>(
                content,
                listings.getNumber(),
                listings.getSize(),
                listings.getTotalElements(),
                listings.getTotalPages(),
                listings.isLast(),
                listings.isFirst()
        );
    }

    public PagedResponse<ListingResponse> getActiveListings(Pageable pageable) {
        Page<Listing> listings = listingRepository.findByActive(true, pageable);

        List<ListingResponse> content = listings.getContent().stream()
                .map(ListingResponse::fromEntity)
                .collect(Collectors.toList());

        return new PagedResponse<>(
                content,
                listings.getNumber(),
                listings.getSize(),
                listings.getTotalElements(),
                listings.getTotalPages(),
                listings.isLast(),
                listings.isFirst()
        );
    }
    public PagedResponse<ListingResponse> searchListingsByRealtor(
            Long realtorId,
            PropertyType propertyType,
            ListingType listingType,
            String city,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            Pageable pageable) {

        User realtor = userRepository.findById(realtorId)
                .orElseThrow(() -> new RuntimeException("Error: Realtor not found with id " + realtorId));

        // You may need to create a custom repository method for this
        Page<Listing> listings = listingRepository.findByRealtorAndFilters(
                realtor, propertyType, listingType, city, minPrice, maxPrice, pageable);

        List<ListingResponse> content = listings.getContent().stream()
                .map(ListingResponse::fromEntity)
                .collect(Collectors.toList());

        return new PagedResponse<>(
                content,
                listings.getNumber(),
                listings.getSize(),
                listings.getTotalElements(),
                listings.getTotalPages(),
                listings.isLast(),
                listings.isFirst()
        );
    }
    public PagedResponse<ListingResponse> getActiveListingsByRealtor(Long realtorId, Pageable pageable) {
        User realtor = userRepository.findById(realtorId)
                .orElseThrow(() -> new RuntimeException("Error: Realtor not found with id " + realtorId));
        Page<Listing> listings = listingRepository.findByRealtorAndActive(realtor, true, pageable);

        List<ListingResponse> content = listings.getContent().stream()
                .map(ListingResponse::fromEntity)
                .collect(Collectors.toList());

        return new PagedResponse<>(
                content,
                listings.getNumber(),
                listings.getSize(),
                listings.getTotalElements(),
                listings.getTotalPages(),
                listings.isLast(),
                listings.isFirst()
        );
    }
    public PagedResponse<ListingResponse> getListingsByRealtor(Long realtorId, Pageable pageable) {
        User realtor = userRepository.findById(realtorId)
                .orElseThrow(() -> new RuntimeException("Error: Realtor not found with id " + realtorId));

        Page<Listing> listings = listingRepository.findByRealtor(realtor, pageable);

        List<ListingResponse> content = listings.getContent().stream()
                .map(ListingResponse::fromEntity)
                .collect(Collectors.toList());

        return new PagedResponse<>(
                content,
                listings.getNumber(),
                listings.getSize(),
                listings.getTotalElements(),
                listings.getTotalPages(),
                listings.isLast(),
                listings.isFirst()
        );
    }

    public PagedResponse<ListingResponse> searchListings(
            PropertyType propertyType,
            ListingType listingType,
            String city,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            Pageable pageable) {

        Page<Listing> listings;

        if (propertyType != null && listingType != null) {
            listings = listingRepository.findByPropertyTypeAndListingTypeAndActive(
                    propertyType, listingType, true, pageable);
        } else if (city != null && !city.isEmpty()) {
            listings = listingRepository.findByCityAndActive(city, true, pageable);
        } else if (minPrice != null && maxPrice != null) {
            listings = listingRepository.findByPriceRangeAndActive(minPrice, maxPrice, true, pageable);
        } else {
            listings = listingRepository.findByActive(true, pageable);
        }

        List<ListingResponse> content = listings.getContent().stream()
                .map(ListingResponse::fromEntity)
                .collect(Collectors.toList());

        return new PagedResponse<>(
                content,
                listings.getNumber(),
                listings.getSize(),
                listings.getTotalElements(),
                listings.getTotalPages(),
                listings.isLast(),
                listings.isFirst()
        );
    }

    public ListingResponse updateListing(Long listingId, ListingRequest listingRequest, Long userId) {
        Listing listing = listingRepository.findById(listingId)
                .orElseThrow(() -> new RuntimeException("Error: Listing not found with id " + listingId));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Error: User not found with id " + userId));

        // Only the listing's realtor or an admin can update the listing
        if (!listing.getRealtor().getId().equals(userId) && !userService.isAdmin(user)) {
            throw new RuntimeException("Error: User is not authorized to update this listing");
        }

        listing.setTitle(listingRequest.getTitle());
        listing.setDescription(listingRequest.getDescription());
        listing.setAddress(listingRequest.getAddress());
        listing.setCity(listingRequest.getCity());
        listing.setState(listingRequest.getState());
        listing.setZipCode(listingRequest.getZipCode());
        listing.setPrice(listingRequest.getPrice());
        listing.setBedrooms(listingRequest.getBedrooms());
        listing.setBathrooms(listingRequest.getBathrooms());
        listing.setArea(listingRequest.getArea());
        listing.setPropertyType(listingRequest.getPropertyType());
        listing.setListingType(listingRequest.getListingType());
        listing.setImages(listingRequest.getImages());
        listing.setActive(listingRequest.isActive());

        Listing updatedListing = listingRepository.save(listing);
        return ListingResponse.fromEntity(updatedListing);
    }

    public void deleteListing(Long listingId, Long userId) {
        Listing listing = listingRepository.findById(listingId)
                .orElseThrow(() -> new RuntimeException("Error: Listing not found with id " + listingId));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Error: User not found with id " + userId));

        // Only the listing's realtor or an admin can delete the listing
        if (!listing.getRealtor().getId().equals(userId) && !userService.isAdmin(user)) {
            throw new RuntimeException("Error: User is not authorized to delete this listing");
        }

        listingRepository.delete(listing);
    }
}