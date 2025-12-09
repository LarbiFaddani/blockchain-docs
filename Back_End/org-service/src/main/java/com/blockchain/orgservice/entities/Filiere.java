package com.blockchain.orgservice.entities;

import com.blockchain.orgservice.enums.StatutAccreditation;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity(name = "filieres")
public class Filiere {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long Id;

    @Column(nullable = false)
    private String nom;

    private String nomResponsableFiliere;

    private String code;

    private String description;

    private String accreditation;

    private StatutAccreditation statutAccreditation;

    private LocalDate dateDebutAccreditation;

    private LocalDate dateFinAccreditation;


    @ManyToOne
    @JoinColumn(name = "ecole_id", nullable = false)
    private Ecole ecole;

    @OneToMany(mappedBy = "filiere", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Etudiant> students = new ArrayList<>();

}
