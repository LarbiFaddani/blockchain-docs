package com.blockchain.docsservice.services;

import com.blockchain.docsservice.dtos.DocumentCreateRequest;
import com.blockchain.docsservice.dtos.VerifyResponse;
import com.blockchain.docsservice.entities.Document;
import com.blockchain.docsservice.exceptions.DocumentAlreadyExistsException;
import com.blockchain.docsservice.repositories.DocumentRepository;
import com.blockchain.docsservice.utils.FileUtils;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;

@Service
@RequiredArgsConstructor
public class DocumentService {

    private final DocumentRepository documentRepository;
    private final HashService hashService;
    private final BlockchainService blockchainService;

    /**
     * Crée un document :
     *  - calcule le hash
     *  - vérifie s'il existe déjà
     *  - l'enregistre sur la blockchain
     *  - le persiste en base
     */
    @Transactional
    public Document createDocument(DocumentCreateRequest req) {

        // 1️⃣ Calcul du hash du contenu
        String hash = hashService.computeHash(req.getFileContent());

        // 2️⃣ Vérifier si ce hash existe déjà en base
        var existing = documentRepository.findByHash(hash);
        if (existing.isPresent()) {
            // Exception métier, gérée par GlobalExceptionHandler
            throw new DocumentAlreadyExistsException(
                    "Un document avec ce contenu existe déjà",
                    existing.get()
            );
        }

        // 3️⃣ Sauvegarde physique du fichier
        String filename = "doc_" + System.currentTimeMillis() + ".pdf";
        String filePath = FileUtils.saveFile(req.getFileContent(), filename);

        // 4️⃣ Enregistrement sur la blockchain (smart contract)
        String txHash;
        try {
            txHash = blockchainService.registerDocument(hash, req.getDocType());
        } catch (Exception e) {
            // En cas d'erreur blockchain, on annule la transaction BD
            throw new RuntimeException("Erreur lors de l'enregistrement sur la blockchain", e);
        }

        // 5️⃣ Persistance en base
        Document doc = new Document();
        doc.setOrgId(req.getOrgId());
        doc.setUserId(req.getUserId());
        doc.setDocType(req.getDocType());
        doc.setFilePath(filePath);
        doc.setHash(hash);
        doc.setBlockchainTx(txHash);
        doc.setCreatedAt(Instant.now());

        return documentRepository.save(doc);
    }

    /**
     * Vérification d'un document par son hash.
     * Source de vérité = smart contract.
     */
    public VerifyResponse verifyDocument(String hash) {

        boolean onChain;
        try {
            onChain = blockchainService.isDocumentRegistered(hash);
        } catch (Exception e) {
            return new VerifyResponse(
                    false,
                    "Erreur lors de la vérification sur le smart contract",
                    null,
                    null,
                    null
            );
        }

        if (!onChain) {
            // ❌ Si non enregistré on-chain, le document n'est pas authentique
            return new VerifyResponse(
                    false,
                    "Document non trouvé dans le smart contract (non authentique)",
                    null,
                    null,
                    null
            );
        }

        // ✅ Il est bien sur la blockchain → on enrichit avec les infos locales si possible
        return documentRepository.findByHash(hash)
                .map(doc -> new VerifyResponse(
                        true,
                        "Document authentique (présent dans le smart contract et dans la base locale)",
                        doc.getOrgId(),
                        doc.getUserId(),
                        doc.getDocType()
                ))
                .orElseGet(() -> new VerifyResponse(
                        true,
                        "Document authentique (présent dans le smart contract) mais non retrouvé dans la base locale",
                        null,
                        null,
                        null
                ));
    }
}
