package com.blockchain.orgservice.repositories;

import com.blockchain.orgservice.entities.Ecole;
import com.blockchain.orgservice.entities.Etudiant;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface EtudiantRepository extends JpaRepository<Etudiant,Long> {
    Optional<Etudiant> findByCin(String cin);
    List<Etudiant> findByEcole_Id(Long ecoleId);

    List<Etudiant> findByFirstNameIgnoreCaseAndLastNameIgnoreCaseAndEcole(
            String firstName,
            String lastName,
            Ecole ecole
    );

            Optional<Etudiant> findByUserId(Long userId);
        List<Etudiant> findByFirstNameIgnoreCase(String firstName);

        List<Etudiant> findByLastNameIgnoreCase(String lastName);

        List<Etudiant> findByFirstNameIgnoreCaseAndLastNameIgnoreCase(String firstName, String lastName);
    }


