package com.blockchain.docsservice.services;

import com.blockchain.docsservice.dtos.DocumentCreateRequest;
import com.blockchain.docsservice.dtos.StudentDocumentDto;
import com.blockchain.docsservice.dtos.VerifyResponse;
import com.blockchain.docsservice.entities.Document;
import com.blockchain.docsservice.exceptions.DocumentAlreadyExistsException;
import com.blockchain.docsservice.repositories.DocumentRepository;
import com.blockchain.docsservice.utils.FileUtils;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.Instant;
import java.util.List;

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
     * Vérification complète :
     * - recalcul hash depuis le PDF
     * - comparaison avec hash fourni
     * - vérification on-chain
     * - enrichissement DB
     */
    public VerifyResponse verifyDocument(MultipartFile file) {

        if (file == null || file.isEmpty()) {
            return new VerifyResponse(false, "Fichier manquant", null, null, null, null);
        }

        final String hash;
        try {
            hash = hashService.computeHash(file.getBytes());
        } catch (Exception e) {
            return new VerifyResponse(false, "Erreur calcul hash", null, null, null, null);
        }

        boolean onChain;
        try {
            onChain = blockchainService.isDocumentRegistered(hash);
        } catch (Exception e) {
            return new VerifyResponse(false, "Erreur smart contract", null, null, null, null);
        }

        if (!onChain) {
            return new VerifyResponse(false, "Document non authentique", null, null, null, null);
        }

        return documentRepository.findByHash(hash)
                .map(doc -> new VerifyResponse(
                        true,
                        "Document authentique",
                        doc.getOrgId(),
                        doc.getUserId(),
                        doc.getDocType(),
                        "/api/docs/download/" + hash   // ✅ lien public contrôlé
                ))
                .orElseGet(() -> new VerifyResponse(
                        true,
                        "Authentique (blockchain) – fichier non stocké localement",
                        null,
                        null,
                        null,
                        null
                ));
    }


    public List<Document> getDocumentsByEcole(Long ecoleId) {
        if (ecoleId == null || ecoleId <= 0) {
            throw new RuntimeException("ecoleId invalide");
        }
        return documentRepository.findAllByOrgId(ecoleId);
    }

    @Transactional
    public List<StudentDocumentDto> getDocumentsByUserId(Long userId) {
        if (userId == null || userId <= 0) {
            throw new RuntimeException("userId invalide");
        }

        return documentRepository.findAllByUserId(userId)
                .stream()
                .map(StudentDocumentDto::from)
                .toList();
    }
}
