package com.blockchain.orgservice.dto;

import lombok.*;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class EntrepriseAdminDto {
    private Long id;
    private String name;
    private String address;
    private String city;
    private String emailContact;

    private Long adminUserId;
    private String ice;
    private String secteurActivite;
    private String statutJuridique;
}
