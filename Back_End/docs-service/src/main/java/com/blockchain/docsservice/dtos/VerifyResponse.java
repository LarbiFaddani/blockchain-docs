package com.blockchain.docsservice.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class VerifyResponse {
    private boolean valid;
    private String message;
    private Long orgId;
    private Long userId;
    private String docType;

    // téléchargement sécurisé
    private String downloadUrl;
}
