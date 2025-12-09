package com.blockchain.orgservice.entities;


import jakarta.persistence.Column;
import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import lombok.*;


@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@DiscriminatorValue("ENTREPRISE")
public class Entreprise extends Organisation {

    @Column(unique = true)
    private String ice;
    private String secteurActivite;
    private String statutJuridique;

}