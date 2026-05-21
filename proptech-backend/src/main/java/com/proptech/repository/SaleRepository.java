package com.proptech.repository;

import com.proptech.entity.Listing;
import com.proptech.entity.Sale;
import com.proptech.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface SaleRepository extends JpaRepository<Sale, Long> {
    List<Sale> findByBuyer(User buyer);

    List<Sale> findByRealtor(User realtor);

    List<Sale> findByListing(Listing listing);

    Page<Sale> findByStatus(Sale.SaleStatus status, Pageable pageable);

    Page<Sale> findByRealtorAndStatus(User realtor, Sale.SaleStatus status, Pageable pageable);

    Page<Sale> findByCreatedAtBetween(LocalDateTime start, LocalDateTime end, Pageable pageable);
}
