package com.proptech.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ProfileUpdateRequest {
    @Size(min = 3, max = 100)
    private String fullName;

    @Size(max = 100)
    @Email
    private String email;

    private String phoneNumber;
}