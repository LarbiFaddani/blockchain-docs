package com.blockchain.orgservice.repositories;

import com.blockchain.orgservice.entities.Filiere;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FiliereRepository extends JpaRepository<Filiere,Long> {
    List<Filiere> findByEcoleId(Long ecoleId);

}
