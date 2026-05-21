package com.proptech.dto.request;

import java.math.BigDecimal;

import com.proptech.entity.Payment.PaymentType;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

@Data
public class PaymentRequest {
    @NotNull
    private PaymentType paymentType;

    @NotBlank
    private String referenceId;

    @NotNull
    private Long userId;

    @NotNull
    @Positive
    private BigDecimal amount;

    @NotNull
    @Positive
    private BigDecimal commission;

    @NotBlank
    private String paymentMethod;

    private String transactionId;

    private String notes;
}