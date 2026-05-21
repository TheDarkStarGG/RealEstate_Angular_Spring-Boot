package com.proptech.exception;

import jakarta.validation.constraints.NotNull;

public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String client, String message, @NotNull Long clientId) {
        super(message);
    }
}
