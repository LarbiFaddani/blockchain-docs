package com.blockchain.orgservice.controllers;

import com.blockchain.orgservice.dto.RegisterOrganisationRequest;
import com.blockchain.orgservice.dto.RegisterOrganisationResponse;
import com.blockchain.orgservice.dto.RegisterEtudiantRequest;
import com.blockchain.orgservice.dto.StudentResponse;
import com.blockchain.orgservice.services.EtudiantService;
import com.blockchain.orgservice.services.OrganisationService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/orgs")
@RequiredArgsConstructor
public class OrganisationController {

    private final OrganisationService organisationService;
    private final EtudiantService etudiantService;

    @PostMapping("/register")
    public ResponseEntity<RegisterOrganisationResponse> registerOrgWithAdmin(
            @RequestBody RegisterOrganisationRequest request
    ) {
        RegisterOrganisationResponse response =
                organisationService.registerOrganizationWithAdmin(request);

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
    @SecurityRequirement(name = "bearerAuth") // tous les endpoints de ce controller nécessitent un JWT

    @PostMapping("/students")
    public ResponseEntity<StudentResponse> registerStudent(
            @RequestBody RegisterEtudiantRequest request
    ) {
        StudentResponse response = etudiantService.createStudent(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}
