package com.blockchain.orgservice.controllers;

import com.blockchain.orgservice.dto.RegisterOrganisationRequest;
import com.blockchain.orgservice.dto.RegisterOrganisationResponse;
import com.blockchain.orgservice.services.OrganisationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/orgs")
@RequiredArgsConstructor
public class OrganisationController {

    private final OrganisationService organisationService;

    @PostMapping("/register")
    public ResponseEntity<RegisterOrganisationResponse> registerOrgWithAdmin(
            @RequestBody RegisterOrganisationRequest request
    ) {
        RegisterOrganisationResponse response =
                organisationService.registerOrganizationWithAdmin(request);

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}
