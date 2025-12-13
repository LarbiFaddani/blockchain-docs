package com.blockchain.orgservice.dto;

import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudentResponse {
    private Long id;

    private Long userId;

    private String firstName;
    private String lastName;
    private String cin;

    private LocalDate birthDate;
    private String genre;
    private String phoneNumber;

    private String level;
    private String personalEmail;

    private String studentCode;

    private Long ecoleId;
    private Long filiereId;
    private String generatedPassword;
    private Boolean enabled;

}
