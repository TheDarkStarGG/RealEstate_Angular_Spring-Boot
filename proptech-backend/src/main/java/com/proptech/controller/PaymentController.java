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

import com.proptech.dto.request.PaymentRequest;
import com.proptech.dto.response.ApiResponse;
import com.proptech.dto.response.PagedResponse;
import com.proptech.entity.Payment;
import com.proptech.entity.Payment.PaymentStatus;
import com.proptech.entity.Payment.PaymentType;
import com.proptech.security.UserDetailsImpl;
import com.proptech.service.PaymentService;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {
    @Autowired
    private PaymentService paymentService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<PagedResponse<Payment>>> getAllPayments(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {

        Sort.Direction direction = sortDir.equalsIgnoreCase("asc") ? Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));

        PagedResponse<Payment> payments = paymentService.getAllPayments(pageable);
        return ResponseEntity.ok(ApiResponse.success("All payments retrieved successfully", payments));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Payment>> createPayment(@Valid @RequestBody PaymentRequest paymentRequest) {
        Payment createdPayment = paymentService.createPayment(paymentRequest);
        return ResponseEntity.ok(ApiResponse.success("Payment created successfully", createdPayment));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('REALTOR') or (hasRole('USER') and @paymentService.getPaymentById(#id).getUser().getId() == authentication.principal.id)")
    public ResponseEntity<ApiResponse<Payment>> getPaymentById(@PathVariable("id") Long id) {
        Payment payment = paymentService.getPaymentById(id);
        return ResponseEntity.ok(ApiResponse.success("Payment retrieved successfully", payment));
    }

    @GetMapping("/by-user/{userId}")
    @PreAuthorize("hasRole('ADMIN') or (hasRole('USER') and #userId == authentication.principal.id)")
    public ResponseEntity<ApiResponse<List<Payment>>> getPaymentsByUser(@PathVariable("userId") Long userId) {
        List<Payment> payments = paymentService.getPaymentsByUser(userId);
        return ResponseEntity.ok(ApiResponse.success("User payments retrieved successfully", payments));
    }

    @GetMapping("/by-type/{paymentType}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<PagedResponse<Payment>>> getPaymentsByType(
            @PathVariable("paymentType") PaymentType paymentType,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {

        Sort.Direction direction = sortDir.equalsIgnoreCase("asc") ? Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));

        PagedResponse<Payment> payments = paymentService.getPaymentsByType(paymentType, pageable);
        return ResponseEntity.ok(ApiResponse.success("Payments by type retrieved successfully", payments));
    }
// Add these methods to your PaymentController class

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deletePayment(@PathVariable("id") Long id) {
        paymentService.deletePayment(id);
        return ResponseEntity.ok(ApiResponse.success("Payment deleted successfully", null));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Payment>> updatePayment(
            @PathVariable("id") Long id,
            @Valid @RequestBody PaymentRequest paymentRequest) {
        Payment updatedPayment = paymentService.updatePayment(id, paymentRequest);
        return ResponseEntity.ok(ApiResponse.success("Payment updated successfully", updatedPayment));
    }
    @GetMapping("/by-status/{status}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<PagedResponse<Payment>>> getPaymentsByStatus(
            @PathVariable("status") PaymentStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {

        Sort.Direction direction = sortDir.equalsIgnoreCase("asc") ? Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));

        PagedResponse<Payment> payments = paymentService.getPaymentsByStatus(status, pageable);
        return ResponseEntity.ok(ApiResponse.success("Payments by status retrieved successfully", payments));
    }

    @GetMapping("/by-date-range")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<PagedResponse<Payment>>> getPaymentsByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {

        Sort.Direction direction = sortDir.equalsIgnoreCase("asc") ? Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));

        PagedResponse<Payment> payments = paymentService.getPaymentsByDateRange(startDate, endDate, pageable);
        return ResponseEntity.ok(ApiResponse.success("Payments by date range retrieved successfully", payments));
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Payment>> updatePaymentStatus(
            @PathVariable("id") Long id,
            @RequestParam PaymentStatus status,
            @RequestParam(required = false) String transactionId,
            @RequestParam(required = false) String notes,
            @AuthenticationPrincipal UserDetailsImpl currentUser) {

        Payment updatedPayment = paymentService.updatePaymentStatus(id, status, transactionId, notes, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Payment status updated successfully", updatedPayment));
    }

    @GetMapping("/by-reference/{referenceId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<Payment>>> getPaymentsByReferenceId(@PathVariable("referenceId") String referenceId) {
        List<Payment> payments = paymentService.getPaymentsByReferenceId(referenceId);
        return ResponseEntity.ok(ApiResponse.success("Payments by reference ID retrieved successfully", payments));
    }
}