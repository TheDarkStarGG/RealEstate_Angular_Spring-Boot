package com.proptech.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Set;

import com.proptech.entity.Listing;
import com.proptech.entity.Listing.PropertyType;
import com.proptech.entity.Listing.ListingType;

import lombok.Data;

@Data
public class ListingResponse {
    private Long id;
    private String title;
    private String description;
    private String address;
    private String city;
    private String state;
    private String zipCode;
    private BigDecimal price;
    private Integer bedrooms;
    private Integer bathrooms;
    private Double area;
    private PropertyType propertyType;
    private ListingType listingType;
    private Set<String> images;
    private UserSummaryResponse realtor;
    private boolean active;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static ListingResponse fromEntity(Listing listing) {
        ListingResponse response = new ListingResponse();
        response.setId(listing.getId());
        response.setTitle(listing.getTitle());
        response.setDescription(listing.getDescription());
        response.setAddress(listing.getAddress());
        response.setCity(listing.getCity());
        response.setState(listing.getState());
        response.setZipCode(listing.getZipCode());
        response.setPrice(listing.getPrice());
        response.setBedrooms(listing.getBedrooms());
        response.setBathrooms(listing.getBathrooms());
        response.setArea(listing.getArea());
        response.setPropertyType(listing.getPropertyType());
        response.setListingType(listing.getListingType());
        response.setImages(listing.getImages());
        response.setRealtor(UserSummaryResponse.fromUser(listing.getRealtor()));
        response.setActive(listing.isActive());
        response.setCreatedAt(listing.getCreatedAt());
        response.setUpdatedAt(listing.getUpdatedAt());
        return response;
    }
}