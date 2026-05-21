package com.proptech.controller;

import jakarta.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.proptech.dto.request.LoginRequest;
import com.proptech.dto.request.SignupRequest;
import com.proptech.dto.response.ApiResponse;
import com.proptech.dto.response.JwtResponse;
import com.proptech.dto.response.MessageResponse;
import com.proptech.entity.User;
import com.proptech.service.AuthService;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/auth")
public class AuthController {
    @Autowired
    private AuthService authService;

    @PostMapping("/signin")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        JwtResponse jwtResponse = authService.authenticateUser(loginRequest);
        return ResponseEntity.ok(ApiResponse.success("User signed in successfully", jwtResponse));
    }

    @PostMapping("/signup")
    public ResponseEntity<?> registerUser(@Valid @RequestBody SignupRequest signupRequest) {
        if (authService.existsByUsername(signupRequest.getUsername())) {
            return ResponseEntity
                    .badRequest()
                    .body(ApiResponse.error("Error: Username is already taken!"));
        }

        if (authService.existsByEmail(signupRequest.getEmail())) {
            return ResponseEntity
                    .badRequest()
                    .body(ApiResponse.error("Error: Email is already in use!"));
        }

        User user = authService.registerUser(signupRequest);

        return ResponseEntity.ok(ApiResponse.success("User registered successfully!", user));
    }
}