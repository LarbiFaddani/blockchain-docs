package com.blockchain.orgservice.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class StudentResponse {
    private Long id;
    private String firstName;
    private String lastName;
    private String cin;
    private String personalEmail;
    private String level;
    private Long ecoleId;
    private Long filiereId;

    private String generatedPassword;
}
