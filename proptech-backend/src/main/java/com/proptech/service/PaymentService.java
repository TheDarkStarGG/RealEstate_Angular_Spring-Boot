package com.proptech.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.proptech.dto.request.PaymentRequest;
import com.proptech.dto.response.PagedResponse;
import com.proptech.entity.Payment;
import com.proptech.entity.User;
import com.proptech.entity.Payment.PaymentStatus;
import com.proptech.entity.Payment.PaymentType;
import com.proptech.repository.PaymentRepository;
import com.proptech.repository.UserRepository;

@Service
public class PaymentService {
    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserService userService;

    public PagedResponse<Payment> getAllPayments(Pageable pageable) {
        Page<Payment> payments = paymentRepository.findAll(pageable);

        return new PagedResponse<>(
                payments.getContent(),
                payments.getNumber(),
                payments.getSize(),
                payments.getTotalElements(),
                payments.getTotalPages(),
                payments.isLast(),
                payments.isFirst()
        );
    }

    public Payment createPayment(PaymentRequest paymentRequest) {
        User user = userRepository.findById(paymentRequest.getUserId())
                .orElseThrow(() -> new RuntimeException("Error: User not found with id " + paymentRequest.getUserId()));

        Payment payment = new Payment();
        payment.setPaymentType(paymentRequest.getPaymentType());
        payment.setReferenceId(paymentRequest.getReferenceId());
        payment.setUser(user);
        payment.setAmount(paymentRequest.getAmount());
        payment.setCommission(paymentRequest.getCommission());
        payment.setStatus(PaymentStatus.PENDING);
        payment.setPaymentMethod(paymentRequest.getPaymentMethod());
        payment.setTransactionId(paymentRequest.getTransactionId());
        payment.setNotes(paymentRequest.getNotes());

        return paymentRepository.save(payment);
    }

    public Payment getPaymentById(Long paymentId) {
        return paymentRepository.findById(paymentId)
                .orElseThrow(() -> new RuntimeException("Error: Payment not found with id " + paymentId));
    }

    public List<Payment> getPaymentsByUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Error: User not found with id " + userId));

        return paymentRepository.findByUser(user);
    }

    public PagedResponse<Payment> getPaymentsByType(PaymentType paymentType, Pageable pageable) {
        Page<Payment> payments = paymentRepository.findByPaymentType(paymentType, pageable);

        return new PagedResponse<>(
                payments.getContent(),
                payments.getNumber(),
                payments.getSize(),
                payments.getTotalElements(),
                payments.getTotalPages(),
                payments.isLast(),
                payments.isFirst()
        );
    }

    public PagedResponse<Payment> getPaymentsByStatus(PaymentStatus status, Pageable pageable) {
        Page<Payment> payments = paymentRepository.findByStatus(status, pageable);

        return new PagedResponse<>(
                payments.getContent(),
                payments.getNumber(),
                payments.getSize(),
                payments.getTotalElements(),
                payments.getTotalPages(),
                payments.isLast(),
                payments.isFirst()
        );
    }

    public PagedResponse<Payment> getPaymentsByDateRange(LocalDateTime startDate, LocalDateTime endDate, Pageable pageable) {
        Page<Payment> payments = paymentRepository.findByCreatedAtBetween(startDate, endDate, pageable);

        return new PagedResponse<>(
                payments.getContent(),
                payments.getNumber(),
                payments.getSize(),
                payments.getTotalElements(),
                payments.getTotalPages(),
                payments.isLast(),
                payments.isFirst()
        );
    }

    public Payment updatePaymentStatus(Long paymentId, PaymentStatus status, String transactionId, String notes, Long userId) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new RuntimeException("Error: Payment not found with id " + paymentId));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Error: User not found with id " + userId));

        // Only an admin can update payment status
        if (!userService.isAdmin(user)) {
            throw new RuntimeException("Error: User is not authorized to update payment status");
        }

        payment.setStatus(status);

        if (transactionId != null && !transactionId.isEmpty()) {
            payment.setTransactionId(transactionId);
        }

        if (notes != null && !notes.isEmpty()) {
            payment.setNotes(notes);
        }

        return paymentRepository.save(payment);
    }

    public List<Payment> getPaymentsByReferenceId(String referenceId) {
        return paymentRepository.findByReferenceId(referenceId);
    }
    // Add these methods to your PaymentService class

    /**
     * Delete a payment
     */
    public void deletePayment(Long id) {
        Payment payment = getPaymentById(id);
        // You might want to add additional checks here
        // e.g., only allow deletion if payment status is PENDING
        paymentRepository.delete(payment);
    }

    /**
     * Update a payment
     */
    public Payment updatePayment(Long id, PaymentRequest paymentRequest) {
        Payment payment = getPaymentById(id);

        // Update payment fields
        payment.setPaymentType(paymentRequest.getPaymentType());
        payment.setReferenceId(paymentRequest.getReferenceId());
        payment.setAmount(paymentRequest.getAmount());
        payment.setCommission(paymentRequest.getCommission());
        payment.setPaymentMethod(paymentRequest.getPaymentMethod());

        if (paymentRequest.getTransactionId() != null) {
            payment.setTransactionId(paymentRequest.getTransactionId());
        }

        if (paymentRequest.getNotes() != null) {
            payment.setNotes(paymentRequest.getNotes());
        }

        // Save and return the updated payment
        return paymentRepository.save(payment);
    }
}