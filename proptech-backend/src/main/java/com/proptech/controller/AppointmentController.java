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

import com.proptech.dto.request.AppointmentRequest;
import com.proptech.dto.response.ApiResponse;
import com.proptech.dto.response.AppointmentResponse;
import com.proptech.dto.response.PagedResponse;
import com.proptech.entity.Appointment.AppointmentStatus;
import com.proptech.security.UserDetailsImpl;
import com.proptech.service.AppointmentService;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/appointments")
public class AppointmentController {
    @Autowired
    private AppointmentService appointmentService;

    @PostMapping
    @PreAuthorize("hasRole('USER') or hasRole('REALTOR') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<AppointmentResponse>> createAppointment(
            @Valid @RequestBody AppointmentRequest appointmentRequest,
            @AuthenticationPrincipal UserDetailsImpl currentUser) {

        AppointmentResponse createdAppointment = appointmentService.createAppointment(
                appointmentRequest, currentUser.getId());

        return ResponseEntity.ok(ApiResponse.success("Appointment created successfully", createdAppointment));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('USER') or hasRole('REALTOR') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<AppointmentResponse>> getAppointmentById(@PathVariable("id") Long id) {
        AppointmentResponse appointment = appointmentService.getAppointmentById(id);
        return ResponseEntity.ok(ApiResponse.success("Appointment retrieved successfully", appointment));
    }

    @GetMapping("/by-client/{clientId}")
    @PreAuthorize("hasRole('ADMIN') or (hasRole('USER') and #clientId == authentication.principal.id)")
    public ResponseEntity<ApiResponse<List<AppointmentResponse>>> getAppointmentsByClient(
            @PathVariable("clientId") Long clientId) {

        List<AppointmentResponse> appointments = appointmentService.getAppointmentsByClient(clientId);
        return ResponseEntity.ok(ApiResponse.success("Client appointments retrieved successfully", appointments));
    }

    @GetMapping("/by-realtor/{realtorId}")
    @PreAuthorize("hasRole('ADMIN') or (hasRole('REALTOR') and #realtorId == authentication.principal.id)")
    public ResponseEntity<ApiResponse<List<AppointmentResponse>>> getAppointmentsByRealtor(
            @PathVariable("realtorId") Long realtorId) {

        List<AppointmentResponse> appointments = appointmentService.getAppointmentsByRealtor(realtorId);
        return ResponseEntity.ok(ApiResponse.success("Realtor appointments retrieved successfully", appointments));
    }

    @GetMapping("/by-status/{status}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<PagedResponse<AppointmentResponse>>> getAppointmentsByStatus(
            @PathVariable("status") AppointmentStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "appointmentDateTime") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {

        Sort.Direction direction = sortDir.equalsIgnoreCase("asc") ? Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));

        PagedResponse<AppointmentResponse> appointments = appointmentService.getAppointmentsByStatus(status, pageable);
        return ResponseEntity.ok(
                ApiResponse.success("Appointments by status retrieved successfully", appointments));
    }

    @GetMapping("/my-appointments/by-status/{status}")
    @PreAuthorize("hasRole('REALTOR')")
    public ResponseEntity<ApiResponse<PagedResponse<AppointmentResponse>>> getMyAppointmentsByStatus(
            @PathVariable("status") AppointmentStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "appointmentDateTime") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir,
            @AuthenticationPrincipal UserDetailsImpl currentUser) {

        Sort.Direction direction = sortDir.equalsIgnoreCase("asc") ? Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));

        PagedResponse<AppointmentResponse> appointments = appointmentService
                .getAppointmentsByRealtorAndStatus(currentUser.getId(), status, pageable);

        return ResponseEntity.ok(
                ApiResponse.success("My appointments by status retrieved successfully", appointments));
    }

    @GetMapping("/my-client-appointments/by-status/{status}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<ApiResponse<PagedResponse<AppointmentResponse>>> getMyClientAppointmentsByStatus(
            @PathVariable("status") AppointmentStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "appointmentDateTime") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir,
            @AuthenticationPrincipal UserDetailsImpl currentUser) {

        Sort.Direction direction = sortDir.equalsIgnoreCase("asc") ? Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));

        PagedResponse<AppointmentResponse> appointments = appointmentService
                .getAppointmentsByClientAndStatus(currentUser.getId(), status, pageable);

        return ResponseEntity.ok(
                ApiResponse.success("My client appointments by status retrieved successfully", appointments));
    }

    @GetMapping("/by-date-range")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<AppointmentResponse>>> getAppointmentsByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDateTime,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDateTime) {

        List<AppointmentResponse> appointments = appointmentService
                .getAppointmentsByDateRange(startDateTime, endDateTime);

        return ResponseEntity.ok(
                ApiResponse.success("Appointments by date range retrieved successfully", appointments));
    }

    @GetMapping("/my-appointments/by-date-range")
    @PreAuthorize("hasRole('REALTOR')")
    public ResponseEntity<ApiResponse<List<AppointmentResponse>>> getMyAppointmentsByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDateTime,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDateTime,
            @AuthenticationPrincipal UserDetailsImpl currentUser) {

        List<AppointmentResponse> appointments = appointmentService
                .getRealtorAppointmentsByDateRange(currentUser.getId(), startDateTime, endDateTime);

        return ResponseEntity.ok(
                ApiResponse.success("My appointments by date range retrieved successfully", appointments));
    }
    @GetMapping("/my-appointments")
    @PreAuthorize("hasRole('REALTOR')")
    public ResponseEntity<ApiResponse<List<AppointmentResponse>>> getMyAppointments(
            @AuthenticationPrincipal UserDetailsImpl currentUser) {

        List<AppointmentResponse> appointments = appointmentService.getAppointmentsByRealtor(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("My appointments retrieved successfully", appointments));
    }
    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('REALTOR') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<AppointmentResponse>> updateAppointmentStatus(
            @PathVariable("id") Long id,
            @RequestParam AppointmentStatus status,
            @RequestParam(required = false) String notes,
            @AuthenticationPrincipal UserDetailsImpl currentUser) {

        AppointmentResponse updatedAppointment = appointmentService
                .updateAppointmentStatus(id, status, notes, currentUser.getId());

        return ResponseEntity.ok(
                ApiResponse.success("Appointment status updated successfully", updatedAppointment));
    }

    @PutMapping("/{id}/reschedule")
    @PreAuthorize("hasRole('USER') or hasRole('REALTOR') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<AppointmentResponse>> rescheduleAppointment(
            @PathVariable("id") Long id,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime newDateTime,
            @RequestParam(required = false) Integer newDuration,
            @AuthenticationPrincipal UserDetailsImpl currentUser) {

        AppointmentResponse rescheduledAppointment = appointmentService
                .rescheduleAppointment(id, newDateTime, newDuration, currentUser.getId());

        return ResponseEntity.ok(
                ApiResponse.success("Appointment rescheduled successfully", rescheduledAppointment));
    }
}