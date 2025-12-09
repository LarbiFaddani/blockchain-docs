package com.blockchain.orgservice.entities;

import com.blockchain.orgservice.enums.TypeEcole;
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
@Entity
@DiscriminatorValue("ECOLE")
public class Ecole extends Organisation {
    @Column(unique = true)
    private String numeroAutorisation;
    private TypeEcole typeEcole;
    private LocalDate anneeCreation;
    private Integer nombreEtudiants;

    @OneToMany(mappedBy = "ecole", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Filiere> filieres = new ArrayList<>();


}
