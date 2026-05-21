package com.proptech.dto.request;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.proptech.entity.Sale.SaleStatus;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

@Data
public class SaleRequest {
    @NotNull
    private Long listingId;

    @NotNull
    private Long buyerId;

    @NotNull
    @Positive
    private BigDecimal salePrice;

    @NotNull
    @Positive
    private BigDecimal commission;

    private String notes;

    private LocalDateTime closingDate;

    private SaleStatus status;
}