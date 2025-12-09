package com.blockchain.orgservice.dto;

import com.blockchain.orgservice.entities.Filiere;
import com.blockchain.orgservice.enums.TypeEcole;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import com.blockchain.orgservice.enums.RoleType;
import com.blockchain.orgservice.enums.orgType;

import lombok.Data;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Data
public class RegisterOrganisationRequest {



    private String name;
    private String address;
    private String city;
    private String emailContact;
    private orgType orgType;
    // Champs spécifiques pour école
    private String numeroAutorisation;
    private TypeEcole typeEcole;
    private LocalDate anneeCreation;
    private Integer nombreEtudiants;

    // Champs spécifiques pour entreprise
    private String ice;
    private String secteurActivite;
    private String statutJuridique;

    // Admin user
    private String adminEmail;
    private String adminPassword;
    private RoleType adminRole;    // "ADMIN_ECOLE" ou "ADMIN_ENTREPRISE"
}
