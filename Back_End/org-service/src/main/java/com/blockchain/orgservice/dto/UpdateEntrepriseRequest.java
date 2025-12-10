package com.blockchain.orgservice.dto;

import lombok.Data;

@Data
public class UpdateEntrepriseRequest {
    private String name;
    private String address;
    private String city;
    private String emailContact;
    private String ice;
    private String secteurActivite;
    private String statutJuridique;
}
