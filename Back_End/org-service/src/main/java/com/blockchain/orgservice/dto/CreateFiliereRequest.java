package com.blockchain.orgservice.dto;

import com.blockchain.orgservice.enums.StatutAccreditation;
import lombok.Data;

import java.time.LocalDate;

@Data
public class CreateFiliereRequest {
    private Long ecoleId;
    private String nom;
    private String nomResponsableFiliere;
    private String code;
    private String description;
    private String accreditation;
    private StatutAccreditation statutAccreditation;
    private LocalDate dateDebutAccreditation;
    private LocalDate dateFinAccreditation;
}
