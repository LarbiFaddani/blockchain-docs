package com.blockchain.docsservice.entities;

import jakarta.persistence.*;
import lombok.Data;

import java.time.Instant;

@Data
@Entity
@Table(name = "documents")
public class Document {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long orgId;        // organisation émettrice
    private Long userId;       // patient / étudiant
    private String docType;    // ORDONNANCE, ATTESTATION, DIPLOME...
    private String filePath;   // chemin du fichier ou URL

    @Column(nullable = false, unique = true, length = 64)
    private String hash;       // hash du contenu

    private String blockchainTx;  // tx hash
    private Instant createdAt;
}
