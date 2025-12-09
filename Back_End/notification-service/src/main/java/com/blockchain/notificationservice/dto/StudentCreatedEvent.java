package com.blockchain.notificationservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class StudentCreatedEvent {
    private String studentFirstName;
    private String studentLastName;
    private String personalEmail;
    private String institutionalEmail;
    private String generatedPassword;

    private String ecoleName;
    private String ecoleAddress;
}
