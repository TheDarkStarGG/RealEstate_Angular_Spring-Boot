package com.proptech.dto.response;

import com.proptech.entity.User;

import lombok.Data;

@Data
public class UserSummaryResponse {
    private Long id;
    private String username;
    private String fullName;
    private String email;
    private String phoneNumber;

    public static UserSummaryResponse fromUser(User user) {
        UserSummaryResponse response = new UserSummaryResponse();
        response.setId(user.getId());
        response.setUsername(user.getUsername());
        response.setFullName(user.getFullName());
        response.setEmail(user.getEmail());
        response.setPhoneNumber(user.getPhoneNumber());
        return response;
    }
}