package com.blockchain.orgservice.repositories;

import com.blockchain.orgservice.entities.Ecole;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface EcoleRepository extends JpaRepository<Ecole,Long> {
    Optional<Ecole> findByAdminUserId(Long adminUserId);

}
