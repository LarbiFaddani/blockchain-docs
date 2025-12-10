package com.blockchain.orgservice.services;

import com.blockchain.orgservice.client.AuthClient;
import com.blockchain.orgservice.dto.RegisterOrgAdminRequest;
import com.blockchain.orgservice.dto.RegisterOrganisationRequest;
import com.blockchain.orgservice.dto.RegisterOrganisationResponse;
import com.blockchain.orgservice.entities.Ecole;
import com.blockchain.orgservice.entities.Entreprise;
import com.blockchain.orgservice.entities.Organisation;
import com.blockchain.orgservice.repositories.EcoleRepository;
import com.blockchain.orgservice.repositories.EntrepriseRepository;
import com.blockchain.orgservice.repositories.OrganisationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class OrganisationService {

    private final OrganisationRepository organisationRepository;
    private final EcoleRepository ecoleRepository;
    private final EntrepriseRepository entrepriseRepository;
    private final AuthClient authClient;

    @Transactional
    public RegisterOrganisationResponse registerOrganizationWithAdmin(RegisterOrganisationRequest request) {

        RegisterOrgAdminRequest adminReq = new RegisterOrgAdminRequest();
        adminReq.setEmail(request.getAdminEmail());
        adminReq.setPassword(request.getAdminPassword());
        adminReq.setRole(request.getAdminRole());

        Map<String, Object> authRes = authClient.createAdmin(adminReq);

        Object userIdObj = authRes.get("userId");
        if (userIdObj == null) {
            throw new RuntimeException("userId non retourné par auth-service");
        }
        Long adminUserId = ((Number) userIdObj).longValue();

        Organisation organisation;

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

        Organisation saved = organisationRepository.save(organisation);

        RegisterOrganisationResponse res = new RegisterOrganisationResponse();
        res.setOrgId(saved.getId());
        res.setType(type.toUpperCase());
        res.setName(saved.getName());
        res.setAdminUserId(adminUserId);
        res.setAdminEmail(request.getAdminEmail());

        return res;
    }

    //      ECOLES

    @Transactional(readOnly = true)
    public List<Ecole> getAllEcoles() {
        return ecoleRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Ecole getEcoleById(Long id) {
        return ecoleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("École introuvable avec id = " + id));
    }

    @Transactional
    public Ecole updateEcole(Long id, Ecole updated) {
        Ecole existing = getEcoleById(id);

        // Mise à jour des champs autorisés
        existing.setName(updated.getName());
        existing.setAddress(updated.getAddress());
        existing.setCity(updated.getCity());
        existing.setEmailContact(updated.getEmailContact());
        existing.setNumeroAutorisation(updated.getNumeroAutorisation());
        existing.setTypeEcole(updated.getTypeEcole());
        existing.setAnneeCreation(updated.getAnneeCreation());
        existing.setNombreEtudiants(updated.getNombreEtudiants());

        return ecoleRepository.save(existing);
    }


    //      ENTREPRISES

    @Transactional(readOnly = true)
    public List<Entreprise> getAllEntreprises() {
        return entrepriseRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Entreprise getEntrepriseById(Long id) {
        return entrepriseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Entreprise introuvable avec id = " + id));
    }

    @Transactional
    public Entreprise updateEntreprise(Long id, Entreprise updated) {
        Entreprise existing = getEntrepriseById(id);

        // Mise à jour des champs autorisés
        existing.setName(updated.getName());
        existing.setAddress(updated.getAddress());
        existing.setCity(updated.getCity());
        existing.setEmailContact(updated.getEmailContact());
        existing.setIce(updated.getIce());
        existing.setSecteurActivite(updated.getSecteurActivite());
        existing.setStatutJuridique(updated.getStatutJuridique());

        return entrepriseRepository.save(existing);
    }
}
