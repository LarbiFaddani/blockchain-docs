package com.blockchain.orgservice.controllers;

import com.blockchain.orgservice.dto.CreateFiliereRequest;
import com.blockchain.orgservice.dto.FiliereResponse;
import com.blockchain.orgservice.services.FiliereService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/filieres")
@RequiredArgsConstructor
public class FiliereController {

    private final FiliereService filiereService;

    @PostMapping("/add")
    public ResponseEntity<FiliereResponse> createFiliere(@RequestBody CreateFiliereRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(filiereService.createFiliere(request));
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<FiliereResponse> updateFiliere(
            @PathVariable Long id,
            @RequestBody CreateFiliereRequest request
    ) {
        return ResponseEntity.ok(filiereService.updateFiliere(id, request));
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Void> deleteFiliere(@PathVariable Long id) {
        filiereService.deleteFiliere(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/all")
    public ResponseEntity<List<FiliereResponse>> getAllFilieres() {
        return ResponseEntity.ok(filiereService.getAllFilieres());
    }
    @GetMapping("/by-ecole/{ecoleId}")
    public ResponseEntity<List<FiliereResponse>> getFilieresByEcole(
            @PathVariable Long ecoleId
    ) {
        return ResponseEntity.ok(
                filiereService.getFilieresByEcoleId(ecoleId)
        );
    }

}
