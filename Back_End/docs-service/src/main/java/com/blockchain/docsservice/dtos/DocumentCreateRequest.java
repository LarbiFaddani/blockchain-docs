package com.blockchain.docsservice.dtos;

import lombok.Data;

@Data
public class DocumentCreateRequest {
    private Long orgId;
    private Long userId;
    private String docType;
    private byte[] fileContent; // contenu du document (PDF) en bytes

}
