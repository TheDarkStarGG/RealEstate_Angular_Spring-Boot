package com.proptech.dto.response;

import com.proptech.entity.Appointment;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class AppointmentResponse {
    private Long id;
    private ListingResponse listing;
    private UserSummaryResponse client;
    private UserSummaryResponse realtor;
    private LocalDateTime appointmentDateTime;
    private Integer durationMinutes;
    private String status;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static AppointmentResponse fromEntity(Appointment appointment) {
        AppointmentResponse response = new AppointmentResponse();
        response.setId(appointment.getId());
        response.setListing(ListingResponse.fromEntity(appointment.getListing()));
        response.setClient(UserSummaryResponse.fromUser(appointment.getClient()));
        response.setRealtor(UserSummaryResponse.fromUser(appointment.getRealtor()));
        response.setAppointmentDateTime(appointment.getAppointmentDateTime());
        response.setDurationMinutes(appointment.getDurationMinutes());
        response.setStatus(appointment.getStatus().name());
        response.setNotes(appointment.getNotes());
        response.setCreatedAt(appointment.getCreatedAt());
        response.setUpdatedAt(appointment.getUpdatedAt());
        return response;
    }
}