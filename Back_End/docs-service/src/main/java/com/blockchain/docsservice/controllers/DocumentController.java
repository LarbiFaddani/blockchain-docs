package com.blockchain.docsservice.controllers;

import com.blockchain.docsservice.dtos.DocumentCreateRequest;
import com.blockchain.docsservice.dtos.DocumentResponse;
import com.blockchain.docsservice.dtos.StudentDocumentDto
import com.blockchain.docsservice.dtos.VerifyResponse;
import com.blockchain.docsservice.entities.Document;
import com.blockchain.docsservice.services.BlockchainService;
import com.blockchain.docsservice.services.DocumentService;
import com.blockchain.docsservice.services.HashService;
import lombok.AllArgsConstructor;

import lombok.NoArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.web3j.protocol.Web3j;

import java.util.List;
import org.springframework.core.io.Resource;
import org.springframework.http.*;
import org.springframework.core.io.UrlResource;

import java.net.MalformedURLException;
import java.nio.file.Path;
import java.nio.file.Paths;
import com.blockchain.docsservice.repositories.DocumentRepository;

@RestController
@AllArgsConstructor
@RequestMapping("/api/docs")
public class DocumentController {

    private final DocumentService documentService;
    private final DocumentRepository documentRepository;
    private final HashService hashService;
    private final BlockchainService blockchainService;
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
//    @PostMapping("/verify")
//    public ResponseEntity<VerifyResponse> verify(@RequestBody VerifyRequest req) {
//        VerifyResponse res = documentService.verifyDocument(req.getHash());
//        return ResponseEntity.ok(res);
//    }
    /**
     * ✅ Vérification d’un document
     * - PDF + hash fourni
     */
    @PostMapping(value = "/verify", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<VerifyResponse> verify(@RequestPart("file") MultipartFile file) {
        return ResponseEntity.ok(documentService.verifyDocument(file));
    }

    @GetMapping("/download/{hash}")
    public ResponseEntity<Resource> download(@PathVariable String hash) {

        var docOpt = documentRepository.findByHash(hash);
        if (docOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }

        String filePathStr = docOpt.get().getFilePath();
        if (filePathStr == null || filePathStr.isBlank()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }

        try {
            Path path = Paths.get(filePathStr).normalize();
            Resource resource = new UrlResource(path.toUri());

            if (!resource.exists() || !resource.isReadable()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
            }

            String filename = path.getFileName().toString();

            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_PDF) // si tu stockes pdf
                    .header(HttpHeaders.CONTENT_DISPOSITION,
                            "attachment; filename=\"" + filename + "\"")
                    .body(resource);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }



    @GetMapping("/ping-chain")
    public String pingChain() throws Exception {
        return web3j.web3ClientVersion().send().getWeb3ClientVersion();
    }
    @GetMapping("/by-ecole/{ecoleId}")
    public ResponseEntity<List<Document>> getDocumentsByEcole(@PathVariable Long ecoleId) {
        return ResponseEntity.ok(documentService.getDocumentsByEcole(ecoleId));
    }

    @GetMapping("/by-user/{userId}")
    public ResponseEntity<List<StudentDocumentDto>> getDocumentsByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(documentService.getDocumentsByUserId(userId));
    }


}
