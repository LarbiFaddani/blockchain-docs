package com.blockchain.docsservice.dtos;

import com.blockchain.docsservice.entities.Document;
import lombok.*;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class StudentDocumentDto {
    private Long id;
    private String docType;
    private String hash;
    private String createdAt;
    private String downloadUrl;

    public static StudentDocumentDto from(Document d) {
        return StudentDocumentDto.builder()
                .id(d.getId())
                .docType(d.getDocType())
                .hash(d.getHash())
                .createdAt((d.getCreatedAt().toString()))
                .downloadUrl("/api/docs/download/" + d.getHash())
                .build();
    }
}
