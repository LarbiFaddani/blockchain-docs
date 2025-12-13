package com.blockchain.docsservice.exceptions;

import com.blockchain.docsservice.entities.Document;
import lombok.Getter;

@Getter
public class DocumentAlreadyExistsException extends RuntimeException {

    private final Document existingDocument;

    public DocumentAlreadyExistsException(String message, Document existingDocument) {
        super(message);
        this.existingDocument = existingDocument;
    }
}
