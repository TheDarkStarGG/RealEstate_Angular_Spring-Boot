package com.proptech.repository;

import com.proptech.entity.Listing;
import com.proptech.entity.Rental;
import com.proptech.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface RentalRepository extends JpaRepository<Rental, Long> {
    List<Rental> findByTenant(User tenant);

    List<Rental> findByRealtor(User realtor);

    List<Rental> findByListing(Listing listing);

    Page<Rental> findByStatus(Rental.RentalStatus status, Pageable pageable);

    Page<Rental> findByRealtorAndStatus(User realtor, Rental.RentalStatus status, Pageable pageable);

    Page<Rental> findByEndDateAfter(LocalDate date, Pageable pageable);

    Page<Rental> findByStartDateBefore(LocalDate date, Pageable pageable);
}