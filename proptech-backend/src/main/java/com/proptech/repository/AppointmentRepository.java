package com.proptech.repository;

import com.proptech.entity.Appointment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    List<Appointment> findByClientId(Long clientId);

    List<Appointment> findByRealtorId(Long realtorId);

    List<Appointment> findByListingId(Long listingId);

    Page<Appointment> findByStatus(Appointment.AppointmentStatus status, Pageable pageable);

    Page<Appointment> findByRealtorIdAndStatus(Long realtorId, Appointment.AppointmentStatus status, Pageable pageable);

    Page<Appointment> findByClientIdAndStatus(Long clientId, Appointment.AppointmentStatus status, Pageable pageable);

    List<Appointment> findByAppointmentDateTimeBetween(LocalDateTime start, LocalDateTime end);

    List<Appointment> findByRealtorIdAndAppointmentDateTimeBetween(Long realtorId, LocalDateTime start, LocalDateTime end);
}