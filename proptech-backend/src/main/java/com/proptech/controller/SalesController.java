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

import com.proptech.dto.request.SaleRequest;
import com.proptech.dto.response.ApiResponse;
import com.proptech.dto.response.PagedResponse;
import com.proptech.entity.Sale;
import com.proptech.entity.Sale.SaleStatus;
import com.proptech.security.UserDetailsImpl;
import com.proptech.service.SalesService;

import java.util.List;

@RestController
@RequestMapping("/api/sales")
public class SalesController {
    @Autowired
    private SalesService salesService;

    @PostMapping
    @PreAuthorize("hasRole('REALTOR') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Sale>> createSale(
            @Valid @RequestBody SaleRequest saleRequest,
            @AuthenticationPrincipal UserDetailsImpl currentUser) {
        try {
            System.out.println("User ID: " + currentUser.getId());
            System.out.println("User Roles: " + currentUser.getAuthorities());
            System.out.println("Sale Request: " + saleRequest);

            Sale createdSale = salesService.createSale(saleRequest, currentUser.getId());
            return ResponseEntity.ok(ApiResponse.success("Sale created successfully", createdSale));
        } catch (Exception e) {
            System.err.println("Error in createSale: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('REALTOR') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Sale>> updateSale(
            @PathVariable("id") Long id,
            @Valid @RequestBody SaleRequest saleRequest,
            @AuthenticationPrincipal UserDetailsImpl currentUser) {
        Sale updatedSale = salesService.updateSale(id, saleRequest, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Sale updated successfully", updatedSale));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('USER') or hasRole('REALTOR') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Sale>> getSaleById(@PathVariable("id") Long id) {
        Sale sale = salesService.getSaleById(id);
        return ResponseEntity.ok(ApiResponse.success("Sale retrieved successfully", sale));
    }

    @GetMapping("/by-buyer/{buyerId}")
    @PreAuthorize("hasRole('ADMIN') or (hasRole('USER') and #buyerId == authentication.principal.id)")
    public ResponseEntity<ApiResponse<List<Sale>>> getSalesByBuyer(@PathVariable("buyerId") Long buyerId) {
        List<Sale> sales = salesService.getSalesByBuyer(buyerId);
        return ResponseEntity.ok(ApiResponse.success("Buyer sales retrieved successfully", sales));
    }

    @GetMapping("/by-realtor/{realtorId}")
    @PreAuthorize("hasRole('ADMIN') or (hasRole('REALTOR') and #realtorId == authentication.principal.id)")
    public ResponseEntity<ApiResponse<List<Sale>>> getSalesByRealtor(@PathVariable("realtorId") Long realtorId) {
        List<Sale> sales = salesService.getSalesByRealtor(realtorId);
        return ResponseEntity.ok(ApiResponse.success("Realtor sales retrieved successfully", sales));
    }
    @GetMapping("/my-sales")
    @PreAuthorize("hasRole('REALTOR')")
    public ResponseEntity<ApiResponse<List<Sale>>> getMySales(
            @AuthenticationPrincipal UserDetailsImpl currentUser) {
        List<Sale> sales = salesService.getSalesByRealtor(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("My sales retrieved successfully", sales));
    }

    @GetMapping("/by-status/{status}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<PagedResponse<Sale>>> getSalesByStatus(
            @PathVariable("status") SaleStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {

        Sort.Direction direction = sortDir.equalsIgnoreCase("asc") ? Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));

        PagedResponse<Sale> sales = salesService.getSalesByStatus(status, pageable);
        return ResponseEntity.ok(ApiResponse.success("Sales by status retrieved successfully", sales));
    }

    @GetMapping("/my-sales/by-status/{status}")
    @PreAuthorize("hasRole('REALTOR')")
    public ResponseEntity<ApiResponse<PagedResponse<Sale>>> getMySalesByStatus(
            @PathVariable("status") SaleStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            @AuthenticationPrincipal UserDetailsImpl currentUser) {

        Sort.Direction direction = sortDir.equalsIgnoreCase("asc") ? Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));

        PagedResponse<Sale> sales = salesService.getSalesByRealtorAndStatus(currentUser.getId(), status, pageable);
        return ResponseEntity.ok(ApiResponse.success("My sales by status retrieved successfully", sales));
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('REALTOR') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Sale>> updateSaleStatus(
            @PathVariable("id") Long id,
            @RequestParam SaleStatus status,
            @RequestParam(required = false) String notes,
            @AuthenticationPrincipal UserDetailsImpl currentUser) {

        Sale updatedSale = salesService.updateSaleStatus(id, status, notes, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Sale status updated successfully", updatedSale));
    }
}