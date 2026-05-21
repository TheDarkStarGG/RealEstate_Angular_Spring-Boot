package com.proptech.controller;

import jakarta.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import com.proptech.dto.request.RentalRequest;
import com.proptech.dto.response.ApiResponse;
import com.proptech.dto.response.PagedResponse;
import com.proptech.entity.Rental;
import com.proptech.entity.Rental.RentalStatus;
import com.proptech.security.UserDetailsImpl;
import com.proptech.service.RentalService;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/rentals")
public class RentalController {
    @Autowired
    private RentalService rentalService;

    @PostMapping
    @PreAuthorize("hasRole('REALTOR') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Rental>> createRental(
            @Valid @RequestBody RentalRequest rentalRequest,
            @AuthenticationPrincipal UserDetailsImpl currentUser) {

        Rental createdRental = rentalService.createRental(rentalRequest, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Rental created successfully", createdRental));
    }
    @GetMapping("/my-rentals")
    @PreAuthorize("hasRole('REALTOR')")
    public ResponseEntity<ApiResponse<List<Rental>>> getMyRentals(
            @AuthenticationPrincipal UserDetailsImpl currentUser) {

        List<Rental> rentals = rentalService.getRentalsByRealtor(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("My rentals retrieved successfully", rentals));
    }
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('USER') or hasRole('REALTOR') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Rental>> getRentalById(@PathVariable("id") Long id) {
        Rental rental = rentalService.getRentalById(id);
        return ResponseEntity.ok(ApiResponse.success("Rental retrieved successfully", rental));
    }

    @GetMapping("/by-tenant/{tenantId}")
    @PreAuthorize("hasRole('ADMIN') or (hasRole('USER') and #tenantId == authentication.principal.id)")
    public ResponseEntity<ApiResponse<List<Rental>>> getRentalsByTenant(@PathVariable("tenantId") Long tenantId) {
        List<Rental> rentals = rentalService.getRentalsByTenant(tenantId);
        return ResponseEntity.ok(ApiResponse.success("Tenant rentals retrieved successfully", rentals));
    }

    @GetMapping("/by-realtor/{realtorId}")
    @PreAuthorize("hasRole('ADMIN') or (hasRole('REALTOR') and #realtorId == authentication.principal.id)")
    public ResponseEntity<ApiResponse<List<Rental>>> getRentalsByRealtor(@PathVariable("realtorId") Long realtorId) {
        List<Rental> rentals = rentalService.getRentalsByRealtor(realtorId);
        return ResponseEntity.ok(ApiResponse.success("Realtor rentals retrieved successfully", rentals));
    }

    @GetMapping("/by-status/{status}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<PagedResponse<Rental>>> getRentalsByStatus(
            @PathVariable("status") RentalStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {

        Sort.Direction direction = sortDir.equalsIgnoreCase("asc") ? Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));

        PagedResponse<Rental> rentals = rentalService.getRentalsByStatus(status, pageable);
        return ResponseEntity.ok(ApiResponse.success("Rentals by status retrieved successfully", rentals));
    }

    @GetMapping("/my-rentals/by-status/{status}")
    @PreAuthorize("hasRole('REALTOR')")
    public ResponseEntity<ApiResponse<PagedResponse<Rental>>> getMyRentalsByStatus(
            @PathVariable("status") RentalStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            @AuthenticationPrincipal UserDetailsImpl currentUser) {

        Sort.Direction direction = sortDir.equalsIgnoreCase("asc") ? Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));

        PagedResponse<Rental> rentals = rentalService.getRentalsByRealtorAndStatus(currentUser.getId(), status, pageable);
        return ResponseEntity.ok(ApiResponse.success("My rentals by status retrieved successfully", rentals));
    }

    @GetMapping("/active")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<PagedResponse<Rental>>> getActiveRentals(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "startDate") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {

        Sort.Direction direction = sortDir.equalsIgnoreCase("asc") ? Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));

        PagedResponse<Rental> rentals = rentalService.getActiveRentals(pageable);
        return ResponseEntity.ok(ApiResponse.success("Active rentals retrieved successfully", rentals));
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('REALTOR') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Rental>> updateRentalStatus(
            @PathVariable("id") Long id,
            @RequestParam RentalStatus status,
            @RequestParam(required = false) String notes,
            @AuthenticationPrincipal UserDetailsImpl currentUser) {

        Rental updatedRental = rentalService.updateRentalStatus(id, status, notes, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Rental status updated successfully", updatedRental));
    }
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('REALTOR') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Rental>> updateRental(
            @PathVariable("id") Long id,
            @Valid @RequestBody RentalRequest rentalRequest,
            @AuthenticationPrincipal UserDetailsImpl currentUser) {
        Rental updatedRental = rentalService.updateRental(id, rentalRequest, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Rental updated successfully", updatedRental));
    }
    @PutMapping("/{id}/extend")
    @PreAuthorize("hasRole('REALTOR') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Rental>> extendRental(
            @PathVariable("id") Long id,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate newEndDate,
            @AuthenticationPrincipal UserDetailsImpl currentUser) {

        Rental extendedRental = rentalService.extendRental(id, newEndDate, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Rental extended successfully", extendedRental));
    }
}