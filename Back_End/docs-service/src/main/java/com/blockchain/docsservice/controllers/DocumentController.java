package com.blockchain.docsservice.controllers;

import com.blockchain.docsservice.dtos.DocumentCreateRequest;
import com.blockchain.docsservice.dtos.DocumentResponse;
import com.blockchain.docsservice.dtos.VerifyRequest;
import com.blockchain.docsservice.dtos.VerifyResponse;
import com.blockchain.docsservice.entities.Document;
import com.blockchain.docsservice.services.DocumentService;
import lombok.AllArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.web3j.protocol.Web3j;

@RestController
@AllArgsConstructor
@RequestMapping("/api/docs")
public class DocumentController {

    private final DocumentService documentService;
    private final Web3j web3j;

    // ✅ Upload avec fichier (multipart/form-data)
    @PostMapping(
            value = "/create",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<DocumentResponse> create(
            @RequestParam("orgId") Long orgId,
            @RequestParam("userId") Long userId,
            @RequestParam("docType") String docType,
            @RequestPart("file") MultipartFile file
    ) throws Exception {

        // 1️⃣ Conversion fichier → bytes
        byte[] content = file.getBytes();

        // 2️⃣ Construction du DTO métier
        DocumentCreateRequest req = new DocumentCreateRequest();
        req.setOrgId(orgId);
        req.setUserId(userId);
        req.setDocType(docType);
        req.setFileContent(content);

        // 3️⃣ Appel service
        Document doc = documentService.createDocument(req);

        // 4️⃣ Mapping vers DTO de réponse
        return ResponseEntity.ok(DocumentResponse.from(doc));
    }

    // ✅ Vérification par hash (inchangé)
    @PostMapping("/verify")
    public ResponseEntity<VerifyResponse> verify(@RequestBody VerifyRequest req) {
        VerifyResponse res = documentService.verifyDocument(req.getHash());
        return ResponseEntity.ok(res);
    }

    @GetMapping("/api/docs/ping-chain")
    public String pingChain() throws Exception {
        return web3j.web3ClientVersion().send().getWeb3ClientVersion();
    }
}
