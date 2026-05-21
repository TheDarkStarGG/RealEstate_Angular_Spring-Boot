package com.proptech.controller;

import jakarta.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import com.proptech.dto.request.ListingRequest;
import com.proptech.dto.response.ApiResponse;
import com.proptech.dto.response.ListingResponse;
import com.proptech.dto.response.PagedResponse;
import com.proptech.entity.Listing.ListingType;
import com.proptech.entity.Listing.PropertyType;
import com.proptech.security.UserDetailsImpl;
import com.proptech.service.ListingService;

import java.math.BigDecimal;

@RestController
@RequestMapping("/api/listings")
public class ListingController {
    @Autowired
    private ListingService listingService;

    @PostMapping
    @PreAuthorize("hasRole('REALTOR') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ListingResponse>> createListing(
            @Valid @RequestBody ListingRequest listingRequest,
            @AuthenticationPrincipal UserDetailsImpl currentUser) {

        ListingResponse createdListing = listingService.createListing(listingRequest, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Listing created successfully", createdListing));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ListingResponse>> getListingById(@PathVariable("id") Long id) {
        ListingResponse listing = listingService.getListingById(id);
        return ResponseEntity.ok(ApiResponse.success("Listing retrieved successfully", listing));
    }

    @GetMapping("/public")
    public ResponseEntity<ApiResponse<PagedResponse<ListingResponse>>> getAllActiveListings(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {

        Sort.Direction direction = sortDir.equalsIgnoreCase("asc") ? Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));

        PagedResponse<ListingResponse> listings = listingService.getActiveListings(pageable);
        return ResponseEntity.ok(ApiResponse.success("Active listings retrieved successfully", listings));
    }

    @GetMapping("/realtor/{realtorId}")
    public ResponseEntity<ApiResponse<PagedResponse<ListingResponse>>> getActiveListingsByRealtor(
            @PathVariable("realtorId") Long realtorId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {

        Sort.Direction direction = sortDir.equalsIgnoreCase("asc") ? Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));

        // Use the new method to get only active listings
        PagedResponse<ListingResponse> listings = listingService.getActiveListingsByRealtor(realtorId, pageable);
        return ResponseEntity.ok(ApiResponse.success("Active realtor listings retrieved successfully", listings));
    }
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<PagedResponse<ListingResponse>>> searchListings(
            @RequestParam(required = false) PropertyType propertyType,
            @RequestParam(required = false) ListingType listingType,
            @RequestParam(required = false) String city,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {

        Sort.Direction direction = sortDir.equalsIgnoreCase("asc") ? Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));

        PagedResponse<ListingResponse> listings = listingService.searchListings(
                propertyType, listingType, city, minPrice, maxPrice, pageable);

        return ResponseEntity.ok(ApiResponse.success("Listings search completed successfully", listings));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('REALTOR') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ListingResponse>> updateListing(
            @PathVariable("id") Long id,
            @Valid @RequestBody ListingRequest listingRequest,
            @AuthenticationPrincipal UserDetailsImpl currentUser) {

        ListingResponse updatedListing = listingService.updateListing(id, listingRequest, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Listing updated successfully", updatedListing));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('REALTOR') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteListing(
            @PathVariable("id") Long id,
            @AuthenticationPrincipal UserDetailsImpl currentUser) {

        listingService.deleteListing(id, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Listing deleted successfully"));
    }

    @GetMapping("/my-listings")
    @PreAuthorize("hasRole('REALTOR') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<PagedResponse<ListingResponse>>> getMyListings(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            @AuthenticationPrincipal UserDetailsImpl currentUser) {

        Sort.Direction direction = sortDir.equalsIgnoreCase("asc") ? Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));

        PagedResponse<ListingResponse> listings = listingService.getListingsByRealtor(currentUser.getId(), pageable);
        return ResponseEntity.ok(ApiResponse.success("My listings retrieved successfully", listings));
    }
    @GetMapping("/my-listings/search")
    @PreAuthorize("hasRole('REALTOR') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<PagedResponse<ListingResponse>>> searchMyListings(
            @RequestParam(required = false) PropertyType propertyType,
            @RequestParam(required = false) ListingType listingType,
            @RequestParam(required = false) String city,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            @AuthenticationPrincipal UserDetailsImpl currentUser) {

        Sort.Direction direction = sortDir.equalsIgnoreCase("asc") ? Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));

        // Create this method in your service
        PagedResponse<ListingResponse> listings = listingService.searchListingsByRealtor(
                currentUser.getId(), propertyType, listingType, city, minPrice, maxPrice, pageable);

        return ResponseEntity.ok(ApiResponse.success("Realtor listings search completed", listings));
    }
}