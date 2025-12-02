package com.blockchain.orgservice.entities;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@DiscriminatorValue("ECOLE")
public class Ecole extends Organisation {
    private String ministereTutelle;
    private Integer nombreEtudiants;
}
