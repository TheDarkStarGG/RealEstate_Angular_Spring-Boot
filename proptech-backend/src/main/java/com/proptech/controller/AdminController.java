package com.proptech.controller;

import com.proptech.dto.response.AppointmentResponse;
import com.proptech.dto.response.PagedResponse;
import com.proptech.service.AppointmentService;
import jakarta.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.proptech.dto.request.SignupRequest;
import com.proptech.dto.response.ApiResponse;
import com.proptech.dto.response.UserSummaryResponse;
import com.proptech.entity.Listing;
import com.proptech.entity.Payment;
import com.proptech.entity.Rental;
import com.proptech.entity.Sale;
import com.proptech.entity.User;
import com.proptech.repository.ListingRepository;
import com.proptech.repository.PaymentRepository;
import com.proptech.repository.RentalRepository;
import com.proptech.repository.SaleRepository;
import com.proptech.service.UserService;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {
    @Autowired
    private UserService userService;

    @Autowired
    private ListingRepository listingRepository;
    @Autowired
    private AppointmentService appointmentService;
    @Autowired
    private SaleRepository saleRepository;

    @Autowired
    private RentalRepository rentalRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    @PostMapping("/realtors")
    public ResponseEntity<ApiResponse<User>> createRealtor(@Valid @RequestBody SignupRequest signupRequest) {
        User createdRealtor = userService.createRealtor(signupRequest);
        return ResponseEntity.ok(ApiResponse.success("Realtor created successfully", createdRealtor));
    }

    @PostMapping("/admins")
    public ResponseEntity<ApiResponse<User>> createAdmin(@Valid @RequestBody SignupRequest signupRequest) {
        User createdAdmin = userService.createAdminUser(signupRequest);
        return ResponseEntity.ok(ApiResponse.success("Admin created successfully", createdAdmin));
    }

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<Page<User>>> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {

        Sort.Direction direction = sortDir.equalsIgnoreCase("asc") ? Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));

        Page<User> users = userService.getAllUsers(pageable);
        return ResponseEntity.ok(ApiResponse.success("All users retrieved successfully", users));
    }

    @GetMapping("/realtors")
    public ResponseEntity<ApiResponse<Page<User>>> getAllRealtors(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {

        Sort.Direction direction = sortDir.equalsIgnoreCase("asc") ? Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));

        Page<User> realtors = userService.getAllRealtors(pageable);
        return ResponseEntity.ok(ApiResponse.success("All realtors retrieved successfully", realtors));
    }

    @GetMapping("/realtors/summary")
    public ResponseEntity<ApiResponse<List<UserSummaryResponse>>> getAllRealtorsSummary() {
        List<UserSummaryResponse> realtors = userService.getAllRealtors();
        return ResponseEntity.ok(ApiResponse.success("All realtors summary retrieved successfully", realtors));
    }

    @GetMapping("/users/{id}")
    public ResponseEntity<ApiResponse<User>> getUserById(@PathVariable("id") Long id) {
        User user = userService.getUserById(id);
        return ResponseEntity.ok(ApiResponse.success("User retrieved successfully", user));
    }

    @PutMapping("/users/{id}")
    public ResponseEntity<ApiResponse<User>> updateUser(
            @PathVariable("id") Long id,
            @Valid @RequestBody SignupRequest updateRequest) {

        User updatedUser = userService.updateUser(id, updateRequest);
        return ResponseEntity.ok(ApiResponse.success("User updated successfully", updatedUser));
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable("id") Long id) {
        userService.deleteUser(id);
        return ResponseEntity.ok(ApiResponse.success("User deleted successfully"));
    }

    @GetMapping("/dashboard/stats")
    public ResponseEntity<ApiResponse<Object>> getDashboardStats() {
        // This could be expanded with more complex analytics as needed
        long totalUsers = userService.getAllUsers(Pageable.unpaged()).getTotalElements();
        long totalRealtors = userService.getAllRealtors(Pageable.unpaged()).getTotalElements();
        long totalListings = listingRepository.count();
        long totalSales = saleRepository.count();
        long totalRentals = rentalRepository.count();
        long totalPayments = paymentRepository.count();

        // Create a simple stats object
        var stats = new Object() {
            public final long users = totalUsers;
            public final long realtors = totalRealtors;
            public final long listings = totalListings;
            public final long sales = totalSales;
            public final long rentals = totalRentals;
            public final long payments = totalPayments;
        };

        return ResponseEntity.ok(ApiResponse.success("Dashboard stats retrieved successfully", stats));
    }

    @GetMapping("/listings")
    public ResponseEntity<ApiResponse<Page<Listing>>> getAllListings(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {

        Sort.Direction direction = sortDir.equalsIgnoreCase("asc") ? Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));

        Page<Listing> listings = listingRepository.findAll(pageable);
        return ResponseEntity.ok(ApiResponse.success("All listings retrieved successfully", listings));
    }

    @GetMapping("/sales")
    public ResponseEntity<ApiResponse<Page<Sale>>> getAllSales(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {

        Sort.Direction direction = sortDir.equalsIgnoreCase("asc") ? Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));

        Page<Sale> sales = saleRepository.findAll(pageable);
        return ResponseEntity.ok(ApiResponse.success("All sales retrieved successfully", sales));
    }

    @GetMapping("/rentals")
    public ResponseEntity<ApiResponse<Page<Rental>>> getAllRentals(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {

        Sort.Direction direction = sortDir.equalsIgnoreCase("asc") ? Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));

        Page<Rental> rentals = rentalRepository.findAll(pageable);
        return ResponseEntity.ok(ApiResponse.success("All rentals retrieved successfully", rentals));
    }

    @GetMapping("/payments")
    public ResponseEntity<ApiResponse<Page<Payment>>> getAllPayments(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {

        Sort.Direction direction = sortDir.equalsIgnoreCase("asc") ? Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));

        Page<Payment> payments = paymentRepository.findAll(pageable);
        return ResponseEntity.ok(ApiResponse.success("All payments retrieved successfully", payments));
    }


    @GetMapping("/appointments")
    public ResponseEntity<ApiResponse<PagedResponse<AppointmentResponse>>> getAllAppointments(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "appointmentDateTime") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {

        Sort.Direction direction = sortDir.equalsIgnoreCase("asc") ? Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));

        PagedResponse<AppointmentResponse> appointments = appointmentService.getAllAppointments(pageable);
        return ResponseEntity.ok(ApiResponse.success("All appointments retrieved successfully", appointments));
    }
}