package com.proptech.dto.request;

import java.math.BigDecimal;
import java.time.LocalDate;

import com.proptech.entity.Rental;
import com.proptech.entity.Sale;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

@Data
public class RentalRequest {
    @NotNull
    private Long listingId;

    @NotNull
    private Long tenantId;

    @NotNull
    @Positive
    private BigDecimal monthlyRate;

    @NotNull
    @Positive
    private BigDecimal securityDeposit;

    @NotNull
    @Positive
    private BigDecimal commission;

    @NotNull
    private LocalDate startDate;

    @NotNull
    @Future
    private LocalDate endDate;

    private String notes;
    private Rental.RentalStatus status;

}
