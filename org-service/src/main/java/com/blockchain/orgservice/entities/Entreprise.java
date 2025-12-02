package com.blockchain.orgservice.entities;


import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import lombok.*;


@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@DiscriminatorValue("ENTREPRISE")
public class Entreprise extends Organisation {

    private String registreCommerce;
    private String secteurActivite;
}