package com.blockchain.docsservice.dtos;

import com.blockchain.docsservice.entities.Document;
import lombok.Data;

@Data
public class DocumentResponse {

    private Long id;
    private Long orgId;
    private Long userId;
    private String docType;
    private String filePath;
    private String hash;
    private String blockchainTx;
    private String createdAt;

    // ✅ champs ajoutés pour l’aspect métier
    private boolean alreadyExists;
    private String message;

    public static DocumentResponse from(Document doc) {
        DocumentResponse res = new DocumentResponse();
        res.setId(doc.getId());
        res.setOrgId(doc.getOrgId());
        res.setUserId(doc.getUserId());
        res.setDocType(doc.getDocType());
        res.setFilePath(doc.getFilePath());
        res.setHash(doc.getHash());
        res.setBlockchainTx(doc.getBlockchainTx());
        res.setCreatedAt(doc.getCreatedAt() != null ? doc.getCreatedAt().toString() : null);
        return res;
    }
}
