package com.blockchain.orgservice.dto;

import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import com.blockchain.orgservice.enums.RoleType;
import com.blockchain.orgservice.enums.orgType;

import lombok.Data;

@Data
public class RegisterOrganisationRequest {



    private String name;
    private String address;
    private String city;
    private String emailContact;
    private orgType orgType;
    // Champs spécifiques pour école
    private String ministereTutelle;
    private Integer nombreEtudiants;

    // Champs spécifiques pour entreprise
    private String registreCommerce;
    private String secteurActivite;

    // Admin user
    private String adminEmail;
    private String adminPassword;
    private RoleType adminRole;    // "ADMIN_ECOLE" ou "ADMIN_ENTREPRISE"
}
