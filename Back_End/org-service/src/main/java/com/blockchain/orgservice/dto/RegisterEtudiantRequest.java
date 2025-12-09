package com.blockchain.orgservice.dto;

import com.blockchain.orgservice.entities.Filiere;
import com.blockchain.orgservice.enums.RoleType;
import com.blockchain.orgservice.enums.TypeEcole;
import jakarta.persistence.Column;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.Data;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
@Data
public class RegisterEtudiantRequest {
    private Long ecoleId;
    private Long filiereId;

    private String firstName;
    private String lastName;
    private String cin;
    private LocalDate birthDate;
    private String genre;
    private String  phoneNumber ;
    private String personalEmail;
    private String level;
}
