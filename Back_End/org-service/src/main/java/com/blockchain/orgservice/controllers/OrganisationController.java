package com.blockchain.orgservice.controllers;

import com.blockchain.orgservice.dto.*;
import com.blockchain.orgservice.entities.Ecole;
import com.blockchain.orgservice.entities.Entreprise;
import com.blockchain.orgservice.repositories.EcoleRepository;
import com.blockchain.orgservice.services.EtudiantService;
import com.blockchain.orgservice.services.OrganisationService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/orgs")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth") // JWT sur tous les endpoints
public class OrganisationController {

    private final OrganisationService organisationService;
    private final EtudiantService etudiantService;
    private final EcoleRepository ecoleRepository;



    @PostMapping("/register")
    public ResponseEntity<RegisterOrganisationResponse> registerOrgWithAdmin(
            @RequestBody RegisterOrganisationRequest request
    ) {
        RegisterOrganisationResponse response =
                organisationService.registerOrganizationWithAdmin(request);

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }


    @PostMapping("/students")
    public ResponseEntity<StudentResponse> registerStudent(
            @RequestBody RegisterEtudiantRequest request
    ) {
        StudentResponse response = etudiantService.createStudent(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

//=========ECOLE=======================
@GetMapping("/ecoles")
public ResponseEntity<List<EcoleDetailsResponse>> getAllEcoles() {
    return ResponseEntity.ok(organisationService.getAllEcoles());
}

    @GetMapping("/ecoles/{id}")
    public ResponseEntity<Ecole> getEcoleById(@PathVariable Long id) {
        Ecole ecole = organisationService.getEcoleById(id);
        return ResponseEntity.ok(ecole);
    }

    @PutMapping("/ecoles/update/{id}")
    public ResponseEntity<Ecole> updateEcole(
            @PathVariable Long id,
            @RequestBody Ecole ecoleRequest
    ) {
        Ecole updated = organisationService.updateEcole(id, ecoleRequest);
        return ResponseEntity.ok(updated);
    }

    @GetMapping("/ecoles/by-admin/{userId}")
    public ResponseEntity<EcoleDetailsResponse> getEcoleByAdmin(@PathVariable Long userId) {

        Ecole e = ecoleRepository.findByAdminUserId(userId)
                .orElseThrow(() -> new RuntimeException("Aucune école pour cet admin"));

        EcoleDetailsResponse dto = new EcoleDetailsResponse();
        dto.setId(e.getId());
        dto.setName(e.getName());
        dto.setAddress(e.getAddress());
        dto.setCity(e.getCity());
        dto.setEmailContact(e.getEmailContact());
        dto.setNumeroAutorisation(e.getNumeroAutorisation());
        dto.setTypeEcole(e.getTypeEcole());
        dto.setAnneeCreation(
                e.getAnneeCreation() != null ? e.getAnneeCreation().toString() : null
        );
        dto.setNombreEtudiants(e.getNombreEtudiants());

        return ResponseEntity.ok(dto);
    }

    // ========= ENTREPRISES =========

    @GetMapping("/entreprises")
    public ResponseEntity<List<EntrepriseAdminDto>> getAllEntreprises() {
        return ResponseEntity.ok(organisationService.getAllEntreprises());
    }
    @GetMapping("/entreprises/{id}")
    public ResponseEntity<Entreprise> getEntrepriseById(@PathVariable Long id) {
        Entreprise ent = organisationService.getEntrepriseById(id);
        return ResponseEntity.ok(ent);
    }

    @PutMapping("/entreprises/update/{id}")
    public ResponseEntity<Entreprise> updateEntreprise(
            @PathVariable Long id,
            @RequestBody Entreprise entrepriseRequest
    ) {
        Entreprise updated = organisationService.updateEntreprise(id, entrepriseRequest);
        return ResponseEntity.ok(updated);
    }
}
