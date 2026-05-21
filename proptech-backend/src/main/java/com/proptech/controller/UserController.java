package com.proptech.controller;

import jakarta.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import com.proptech.dto.request.ProfileUpdateRequest;
import com.proptech.dto.request.PasswordChangeRequest;
import com.proptech.dto.response.ApiResponse;
import com.proptech.dto.response.UserSummaryResponse;
import com.proptech.entity.User;
import com.proptech.security.UserDetailsImpl;
import com.proptech.service.UserService;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {
    @Autowired
    private UserService userService;

    /**
     * Get current user profile
     */
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<User>> getCurrentUser(@AuthenticationPrincipal UserDetailsImpl currentUser) {
        User user = userService.getUserById(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Current user retrieved successfully", user));
    }

    /**
     * Update current user profile
     */
    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<User>> updateProfile(
            @Valid @RequestBody ProfileUpdateRequest updateRequest,
            @AuthenticationPrincipal UserDetailsImpl currentUser) {

        User updatedUser = userService.updateProfile(currentUser.getId(), updateRequest);
        return ResponseEntity.ok(ApiResponse.success("Profile updated successfully", updatedUser));
    }

    /**
     * Change password
     */
    @PostMapping("/change-password")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            @Valid @RequestBody PasswordChangeRequest passwordRequest,
            @AuthenticationPrincipal UserDetailsImpl currentUser) {

        userService.changePassword(currentUser.getId(), passwordRequest);
        return ResponseEntity.ok(ApiResponse.success("Password changed successfully"));
    }

    /**
     * Get user by ID (only basic info for public profiles)
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<UserSummaryResponse>> getUserById(@PathVariable("id") Long id) {
        User user = userService.getUserById(id);
        UserSummaryResponse userSummary = UserSummaryResponse.fromUser(user);
        return ResponseEntity.ok(ApiResponse.success("User retrieved successfully", userSummary));
    }

    /**
     * Get all users with pagination (admin only)
     */
    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
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

    /**
     * Search users by query string (admin only)
     */
    @GetMapping("/search")
    @PreAuthorize("hasRole('ADMIN') or hasRole('REALTOR')")
    public ResponseEntity<ApiResponse<List<User>>> searchUsers(@RequestParam String query) {
        List<User> users = userService.searchUsers(query);
        return ResponseEntity.ok(ApiResponse.success("Users search completed successfully", users));
    }

    /**
     * Get all realtors (summary view for public access)
     */
    @GetMapping("/realtors")
    public ResponseEntity<ApiResponse<List<UserSummaryResponse>>> getAllRealtors() {
        List<UserSummaryResponse> realtors = userService.getAllRealtors();
        return ResponseEntity.ok(ApiResponse.success("All realtors retrieved successfully", realtors));
    }
}