package com.blockchain.orgservice.dto;

import lombok.Data;

@Data
public class StudentCreatedEvent {
    private String studentFirstName;
    private String studentLastName;
    private String personalEmail;
    private String institutionalEmail;
    private String generatedPassword;

    private String ecoleName;
    private String ecoleAddress;
}
