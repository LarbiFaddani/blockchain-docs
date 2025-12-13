package com.blockchain.docsservice.handlers;

import com.blockchain.docsservice.dtos.DocumentResponse;
import com.blockchain.docsservice.exceptions.DocumentAlreadyExistsException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(DocumentAlreadyExistsException.class)
    public ResponseEntity<DocumentResponse> handleDocumentAlreadyExists(DocumentAlreadyExistsException ex) {
        var existing = ex.getExistingDocument();

        DocumentResponse response = DocumentResponse.from(existing);
        response.setAlreadyExists(true);
        response.setMessage(ex.getMessage());

        return ResponseEntity
                .status(HttpStatus.CONFLICT)
                .body(response);
    }
}
