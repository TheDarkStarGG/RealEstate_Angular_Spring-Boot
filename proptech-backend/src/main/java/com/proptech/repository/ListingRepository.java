package com.proptech.repository;

import com.proptech.entity.Listing;
import com.proptech.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface ListingRepository extends JpaRepository<Listing, Long> {
    Page<Listing> findByActive(boolean active, Pageable pageable);

    Page<Listing> findByRealtorAndActive(User realtor, boolean active, Pageable pageable);
    Page<Listing> findByRealtor(User realtor, Pageable pageable);
    // In ListingRepository.java
    @Query("SELECT l FROM Listing l WHERE l.realtor = :realtor " +
            "AND (:propertyType IS NULL OR l.propertyType = :propertyType) " +
            "AND (:listingType IS NULL OR l.listingType = :listingType) " +
            "AND (:city IS NULL OR l.city LIKE %:city%) " +
            "AND (:minPrice IS NULL OR l.price >= :minPrice) " +
            "AND (:maxPrice IS NULL OR l.price <= :maxPrice)")
    Page<Listing> findByRealtorAndFilters(
            @Param("realtor") User realtor,
            @Param("propertyType") Listing.PropertyType propertyType,
            @Param("listingType") Listing.ListingType listingType,
            @Param("city") String city,
            @Param("minPrice") BigDecimal minPrice,
            @Param("maxPrice") BigDecimal maxPrice,
            Pageable pageable);
    Page<Listing> findByPropertyTypeAndListingTypeAndActive(
            Listing.PropertyType propertyType,
            Listing.ListingType listingType,
            boolean active,
            Pageable pageable
    );

    @Query("SELECT l FROM Listing l WHERE l.active = :active AND l.city = :city")
    Page<Listing> findByCityAndActive(
            @Param("city") String city,
            @Param("active") boolean active,
            Pageable pageable
    );

    @Query("SELECT l FROM Listing l WHERE l.active = :active AND l.price BETWEEN :minPrice AND :maxPrice")
    Page<Listing> findByPriceRangeAndActive(
            @Param("minPrice") BigDecimal minPrice,
            @Param("maxPrice") BigDecimal maxPrice,
            @Param("active") boolean active,
            Pageable pageable
    );

    List<Listing> findByRealtor(User realtor);
}