package com.proptech.repository;

import com.proptech.entity.Payment;
import com.proptech.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    List<Payment> findByUser(User user);

    Page<Payment> findByPaymentType(Payment.PaymentType paymentType, Pageable pageable);

    Page<Payment> findByStatus(Payment.PaymentStatus status, Pageable pageable);

    Page<Payment> findByCreatedAtBetween(LocalDateTime start, LocalDateTime end, Pageable pageable);

    List<Payment> findByReferenceId(String referenceId);
}