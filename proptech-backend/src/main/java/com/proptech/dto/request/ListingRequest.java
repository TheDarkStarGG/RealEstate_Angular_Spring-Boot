package com.proptech.dto.request;

import java.math.BigDecimal;
import java.util.Set;

import com.proptech.entity.Listing.PropertyType;
import com.proptech.entity.Listing.ListingType;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

@Data
public class ListingRequest {
    @NotBlank
    private String title;

    private String description;

    @NotBlank
    private String address;

    private String city;

    private String state;

    private String zipCode;

    @NotNull
    @Positive
    private BigDecimal price;

    private Integer bedrooms;

    private Integer bathrooms;

    private Double area;

    @NotNull
    private PropertyType propertyType;

    @NotNull
    private ListingType listingType;

    private Set<String> images;

    private boolean active = true;
}