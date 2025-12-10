package com.blockchain.orgservice.dto;

import com.blockchain.orgservice.enums.TypeEcole;
import lombok.Data;

@Data
public class UpdateEcoleRequest {
    private String name;
    private String address;
    private String city;
    private String emailContact;
    private String numeroAutorisation;
    private TypeEcole typeEcole;
    private Integer anneeCreation;
    private Integer nombreEtudiants;
}
