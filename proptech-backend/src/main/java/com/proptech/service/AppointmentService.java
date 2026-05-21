package com.proptech.service;

import com.proptech.dto.request.AppointmentRequest;
import com.proptech.dto.response.AppointmentResponse;
import com.proptech.dto.response.PagedResponse;
import com.proptech.entity.Appointment;
import com.proptech.entity.Listing;
import com.proptech.entity.User;
import com.proptech.entity.Appointment.AppointmentStatus;
import com.proptech.exception.ResourceNotFoundException;
import com.proptech.exception.UnauthorizedException;
import com.proptech.repository.AppointmentRepository;
import com.proptech.repository.ListingRepository;
import com.proptech.repository.UserRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AppointmentService {
    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ListingRepository listingRepository;

    public AppointmentResponse createAppointment(AppointmentRequest appointmentRequest, Long currentUserId) {
        // Get the client (either the current user or an admin/realtor creating for a client)
        User client = userRepository.findById(appointmentRequest.getClientId())
                .orElseThrow(() -> new ResourceNotFoundException("Client", "id", appointmentRequest.getClientId()));

        // Get the listing
        Listing listing = listingRepository.findById(appointmentRequest.getListingId())
                .orElseThrow(() -> new ResourceNotFoundException("Listing", "id", appointmentRequest.getListingId()));

        // Get the realtor from the listing
        User realtor = listing.getRealtor();

        // Create the appointment
        Appointment appointment = new Appointment();
        appointment.setListing(listing);
        appointment.setClient(client);
        appointment.setRealtor(realtor);
        appointment.setAppointmentDateTime(appointmentRequest.getAppointmentDateTime());
        appointment.setDurationMinutes(appointmentRequest.getDurationMinutes());
        appointment.setNotes(appointmentRequest.getNotes());

        // Set initial status
        appointment.setStatus(AppointmentStatus.REQUESTED);

        // Save the appointment
        Appointment savedAppointment = appointmentRepository.save(appointment);

        return AppointmentResponse.fromEntity(savedAppointment);
    }

    public AppointmentResponse getAppointmentById(Long id) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment", "id", id));

        return AppointmentResponse.fromEntity(appointment);
    }

    public List<AppointmentResponse> getAppointmentsByClient(Long clientId) {
        List<Appointment> appointments = appointmentRepository.findByClientId(clientId);

        return appointments.stream()
                .map(AppointmentResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public List<AppointmentResponse> getAppointmentsByRealtor(Long realtorId) {
        List<Appointment> appointments = appointmentRepository.findByRealtorId(realtorId);

        return appointments.stream()
                .map(AppointmentResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public PagedResponse<AppointmentResponse> getAppointmentsByStatus(AppointmentStatus status, Pageable pageable) {
        Page<Appointment> appointments = appointmentRepository.findByStatus(status, pageable);

        List<AppointmentResponse> content = appointments.getContent().stream()
                .map(AppointmentResponse::fromEntity)
                .collect(Collectors.toList());

        return new PagedResponse<>(
                content,
                appointments.getNumber(),
                appointments.getSize(),
                appointments.getTotalElements(),
                appointments.getTotalPages(),
                appointments.isLast(),
                appointments.isFirst()
        );
    }

    public PagedResponse<AppointmentResponse> getAppointmentsByRealtorAndStatus(
            Long realtorId, AppointmentStatus status, Pageable pageable) {

        Page<Appointment> appointments = appointmentRepository.findByRealtorIdAndStatus(realtorId, status, pageable);

        List<AppointmentResponse> content = appointments.getContent().stream()
                .map(AppointmentResponse::fromEntity)
                .collect(Collectors.toList());

        return new PagedResponse<>(
                content,
                appointments.getNumber(),
                appointments.getSize(),
                appointments.getTotalElements(),
                appointments.getTotalPages(),
                appointments.isLast(),
                appointments.isFirst()
        );
    }

    public PagedResponse<AppointmentResponse> getAppointmentsByClientAndStatus(
            Long clientId, AppointmentStatus status, Pageable pageable) {

        Page<Appointment> appointments = appointmentRepository.findByClientIdAndStatus(clientId, status, pageable);

        List<AppointmentResponse> content = appointments.getContent().stream()
                .map(AppointmentResponse::fromEntity)
                .collect(Collectors.toList());

        return new PagedResponse<>(
                content,
                appointments.getNumber(),
                appointments.getSize(),
                appointments.getTotalElements(),
                appointments.getTotalPages(),
                appointments.isLast(),
                appointments.isFirst()
        );
    }

    public List<AppointmentResponse> getAppointmentsByDateRange(LocalDateTime start, LocalDateTime end) {
        List<Appointment> appointments = appointmentRepository.findByAppointmentDateTimeBetween(start, end);

        return appointments.stream()
                .map(AppointmentResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public List<AppointmentResponse> getRealtorAppointmentsByDateRange(
            Long realtorId, LocalDateTime start, LocalDateTime end) {

        List<Appointment> appointments = appointmentRepository.findByRealtorIdAndAppointmentDateTimeBetween(
                realtorId, start, end);

        return appointments.stream()
                .map(AppointmentResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public AppointmentResponse updateAppointmentStatus(
            Long id, AppointmentStatus status, String notes, Long currentUserId) {

        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment", "id", id));

        // Check if the current user is the realtor or an admin (handled by PreAuthorize)

        // Update the appointment
        appointment.setStatus(status);
        if (notes != null && !notes.trim().isEmpty()) {
            appointment.setNotes(notes);
        }

        Appointment updatedAppointment = appointmentRepository.save(appointment);

        return AppointmentResponse.fromEntity(updatedAppointment);
    }

    public AppointmentResponse rescheduleAppointment(
            Long id, LocalDateTime newDateTime, Integer newDuration, Long currentUserId) {

        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment", "id", id));

        // Check if the current user is the client, realtor, or an admin (handled by PreAuthorize)

        // Update the appointment
        appointment.setAppointmentDateTime(newDateTime);
        if (newDuration != null && newDuration > 0) {
            appointment.setDurationMinutes(newDuration);
        }

        Appointment rescheduledAppointment = appointmentRepository.save(appointment);

        return AppointmentResponse.fromEntity(rescheduledAppointment);
    }
    public PagedResponse<AppointmentResponse> getAllAppointments(Pageable pageable) {
        Page<Appointment> appointments = appointmentRepository.findAll(pageable);

        List<AppointmentResponse> content = appointments.getContent().stream()
                .map(AppointmentResponse::fromEntity)
                .collect(Collectors.toList());

        return new PagedResponse<>(
                content,
                appointments.getNumber(),
                appointments.getSize(),
                appointments.getTotalElements(),
                appointments.getTotalPages(),
                appointments.isLast(),
                appointments.isFirst()
        );
    }
}