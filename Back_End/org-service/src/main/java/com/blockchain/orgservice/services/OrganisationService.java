package com.blockchain.orgservice.services;

import com.blockchain.orgservice.client.AuthClient;
import com.blockchain.orgservice.dto.RegisterOrgAdminRequest;
import com.blockchain.orgservice.dto.RegisterOrganisationRequest;
import com.blockchain.orgservice.dto.RegisterOrganisationResponse;
import com.blockchain.orgservice.entities.Ecole;
import com.blockchain.orgservice.entities.Entreprise;
import com.blockchain.orgservice.entities.Organisation;
import com.blockchain.orgservice.enums.TypeEcole;
import com.blockchain.orgservice.repositories.OrganisationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class OrganisationService {

    private final OrganisationRepository organisationRepository;
    private final AuthClient authClient;

    @Transactional
    public RegisterOrganisationResponse registerOrganizationWithAdmin(RegisterOrganisationRequest request) {

        // Construire la requête pour auth-service
        RegisterOrgAdminRequest adminReq = new RegisterOrgAdminRequest();
        adminReq.setEmail(request.getAdminEmail());
        adminReq.setPassword(request.getAdminPassword());
        adminReq.setRole(request.getAdminRole());

        // Appeler auth-service
        Map<String, Object> authRes = authClient.createAdmin(adminReq);

        Object userIdObj = authRes.get("userId");
        if (userIdObj == null) {
            throw new RuntimeException("userId non retourné par auth-service");
        }
        Long adminUserId = ((Number) userIdObj).longValue();

        // Construire l'entité selon le type
        Organisation organisation;

        // Si orgType est un enum (OrgType), .name() est ok
        String type = request.getOrgType().name();

        if ("ECOLE".equalsIgnoreCase(type)) {
            Ecole ecole = new Ecole();
            ecole.setName(request.getName());
            ecole.setAddress(request.getAddress());
            ecole.setCity(request.getCity());
            ecole.setEmailContact(request.getEmailContact());
            ecole.setAdminUserId(adminUserId);
            ecole.setNumeroAutorisation(request.getNumeroAutorisation());
            ecole.setTypeEcole(request.getTypeEcole());
            ecole.setAnneeCreation(request.getAnneeCreation());
            ecole.setNombreEtudiants(request.getNombreEtudiants());
            organisation = ecole;

        } else if ("ENTREPRISE".equalsIgnoreCase(type)) {
            Entreprise ent = new Entreprise();
            ent.setName(request.getName());
            ent.setAddress(request.getAddress());
            ent.setCity(request.getCity());
            ent.setEmailContact(request.getEmailContact());
            ent.setAdminUserId(adminUserId);
            ent.setIce(request.getIce());
            ent.setSecteurActivite(request.getSecteurActivite());
            ent.setStatutJuridique(request.getStatutJuridique());

            organisation = ent;

        } else {
            throw new IllegalArgumentException("Type d'organisation invalide : " + type);
        }

        // Sauvegarder
        Organisation saved = organisationRepository.save(organisation);

        //  Réponse
        RegisterOrganisationResponse res = new RegisterOrganisationResponse();
        res.setOrgId(saved.getId());
        res.setType(type.toUpperCase());
        res.setName(saved.getName());
        res.setAdminUserId(adminUserId);
        res.setAdminEmail(request.getAdminEmail());

        return res;
    }
}
