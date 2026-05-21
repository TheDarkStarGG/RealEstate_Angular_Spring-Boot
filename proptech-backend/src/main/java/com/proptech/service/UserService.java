package com.proptech.service;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import com.proptech.dto.request.PasswordChangeRequest;
import com.proptech.dto.request.ProfileUpdateRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.proptech.dto.request.SignupRequest;
import com.proptech.dto.response.UserSummaryResponse;
import com.proptech.entity.Role;
import com.proptech.entity.User;
import com.proptech.entity.Role.ERole;
import com.proptech.repository.RoleRepository;
import com.proptech.repository.UserRepository;

@Service
public class UserService {
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public User createRealtor(SignupRequest signupRequest) {
        User user = new User();
        user.setUsername(signupRequest.getUsername());
        user.setEmail(signupRequest.getEmail());
        user.setPassword(passwordEncoder.encode(signupRequest.getPassword()));
        user.setFullName(signupRequest.getFullName());
        user.setPhoneNumber(signupRequest.getPhoneNumber());

        Set<Role> roles = new HashSet<>();
        Role realtorRole = roleRepository.findByName(ERole.ROLE_REALTOR)
                .orElseThrow(() -> new RuntimeException("Error: Realtor Role is not found."));
        roles.add(realtorRole);

        user.setRoles(roles);
        return userRepository.save(user);
    }

    public User createAdminUser(SignupRequest signupRequest) {
        User user = new User();
        user.setUsername(signupRequest.getUsername());
        user.setEmail(signupRequest.getEmail());
        user.setPassword(passwordEncoder.encode(signupRequest.getPassword()));
        user.setFullName(signupRequest.getFullName());
        user.setPhoneNumber(signupRequest.getPhoneNumber());

        Set<Role> roles = new HashSet<>();
        Role adminRole = roleRepository.findByName(ERole.ROLE_ADMIN)
                .orElseThrow(() -> new RuntimeException("Error: Admin Role is not found."));
        roles.add(adminRole);

        user.setRoles(roles);
        return userRepository.save(user);
    }

    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Error: User not found with id " + id));
    }

    public User getCurrentUser(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Error: User not found."));
    }

    public Page<User> getAllUsers(Pageable pageable) {
        return userRepository.findAll(pageable);
    }

    public List<UserSummaryResponse> getAllRealtors() {
        Set<Role> roles = new HashSet<>();
        Role realtorRole = roleRepository.findByName(ERole.ROLE_REALTOR)
                .orElseThrow(() -> new RuntimeException("Error: Realtor Role is not found."));
        roles.add(realtorRole);

        return userRepository.findByRolesIn(roles).stream()
                .map(UserSummaryResponse::fromUser)
                .collect(Collectors.toList());
    }

    public Page<User> getAllRealtors(Pageable pageable) {
        Set<Role> roles = new HashSet<>();
        Role realtorRole = roleRepository.findByName(ERole.ROLE_REALTOR)
                .orElseThrow(() -> new RuntimeException("Error: Realtor Role is not found."));
        roles.add(realtorRole);

        return userRepository.findByRolesIn(roles, pageable);
    }

    public User updateUser(Long userId, SignupRequest updateRequest) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Error: User not found with id " + userId));

        user.setFullName(updateRequest.getFullName());
        user.setPhoneNumber(updateRequest.getPhoneNumber());

        // Only update password if provided
        if (updateRequest.getPassword() != null && !updateRequest.getPassword().isEmpty()) {
            user.setPassword(passwordEncoder.encode(updateRequest.getPassword()));
        }

        return userRepository.save(user);
    }

    public void deleteUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Error: User not found with id " + userId));

        userRepository.delete(user);
    }

    public boolean hasRole(User user, ERole roleName) {
        return user.getRoles().stream()
                .anyMatch(role -> role.getName() == roleName);
    }
    public List<User> searchUsers(String query) {
        return userRepository.searchUsers(query);
    }

    // If you need pagination support, add this method as well
    public Page<User> searchUsers(String query, Pageable pageable) {
        return userRepository.searchUsers(query, pageable);
    }
    public User updateProfile(Long userId, ProfileUpdateRequest updateRequest) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Error: User not found with id " + userId));

        if (updateRequest.getFullName() != null) {
            user.setFullName(updateRequest.getFullName());
        }

        if (updateRequest.getEmail() != null) {
            // Check if email is already in use by another user
            if (userRepository.existsByEmail(updateRequest.getEmail()) &&
                    !user.getEmail().equals(updateRequest.getEmail())) {
                throw new RuntimeException("Error: Email is already in use!");
            }
            user.setEmail(updateRequest.getEmail());
        }

        if (updateRequest.getPhoneNumber() != null) {
            user.setPhoneNumber(updateRequest.getPhoneNumber());
        }

        return userRepository.save(user);
    }

    /**
     * Change user password
     */
    public void changePassword(Long userId, PasswordChangeRequest passwordRequest) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Error: User not found with id " + userId));

        // Verify current password
        if (!passwordEncoder.matches(passwordRequest.getCurrentPassword(), user.getPassword())) {
            throw new RuntimeException("Error: Current password is incorrect");
        }

        // Update with new password
        user.setPassword(passwordEncoder.encode(passwordRequest.getNewPassword()));
        userRepository.save(user);
    }

    public boolean isRealtor(User user) {
        return hasRole(user, ERole.ROLE_REALTOR);
    }

    public boolean isAdmin(User user) {
        return hasRole(user, ERole.ROLE_ADMIN);
    }
}