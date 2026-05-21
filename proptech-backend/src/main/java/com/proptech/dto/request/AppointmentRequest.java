package com.proptech.dto.request;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class AppointmentRequest {
    @NotNull
    private Long listingId;

    @NotNull
    private Long clientId;

    @NotNull
    @Future
    private LocalDateTime appointmentDateTime;

    @NotNull
    @Positive
    private Integer durationMinutes;

    private String notes;
}