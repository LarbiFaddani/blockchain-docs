package com.blockchain.orgservice.dto;

import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.Data;

@Data
public class RegisterOrganisationResponse {

    private Long orgId;
    private String type;
    private String name;

    private Long adminUserId;
    private String adminEmail;
}
