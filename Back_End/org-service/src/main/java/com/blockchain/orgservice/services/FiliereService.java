package com.blockchain.orgservice.services;

import com.blockchain.orgservice.dto.CreateFiliereRequest;
import com.blockchain.orgservice.dto.FiliereResponse;
import com.blockchain.orgservice.entities.Ecole;
import com.blockchain.orgservice.entities.Filiere;
import com.blockchain.orgservice.repositories.EcoleRepository;
import com.blockchain.orgservice.repositories.FiliereRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FiliereService {

    private final FiliereRepository filiereRepository;
    private final EcoleRepository ecoleRepository;

    public FiliereResponse createFiliere(CreateFiliereRequest request) {
        Ecole ecole = ecoleRepository.findById(request.getEcoleId())
                .orElseThrow(() -> new RuntimeException("École non trouvée"));

        Filiere filiere = new Filiere();
        filiere.setNom(request.getNom());
        filiere.setNomResponsableFiliere(request.getNomResponsableFiliere());
        filiere.setCode(request.getCode());
        filiere.setDescription(request.getDescription());
        filiere.setAccreditation(request.getAccreditation());
        filiere.setStatutAccreditation(request.getStatutAccreditation());
        filiere.setDateDebutAccreditation(request.getDateDebutAccreditation());
        filiere.setDateFinAccreditation(request.getDateFinAccreditation());
        filiere.setEcole(ecole);

        filiereRepository.save(filiere);

        return toResponse(filiere);
    }

    public FiliereResponse updateFiliere(Long filiereId, CreateFiliereRequest request) {
        Filiere filiere = filiereRepository.findById(filiereId)
                .orElseThrow(() -> new RuntimeException("Filière non trouvée"));

        Ecole ecole = ecoleRepository.findById(request.getEcoleId())
                .orElseThrow(() -> new RuntimeException("École non trouvée"));

        filiere.setNom(request.getNom());
        filiere.setNomResponsableFiliere(request.getNomResponsableFiliere());
        filiere.setCode(request.getCode());
        filiere.setDescription(request.getDescription());
        filiere.setAccreditation(request.getAccreditation());
        filiere.setStatutAccreditation(request.getStatutAccreditation());
        filiere.setDateDebutAccreditation(request.getDateDebutAccreditation());
        filiere.setDateFinAccreditation(request.getDateFinAccreditation());
        filiere.setEcole(ecole);

        filiereRepository.save(filiere);

        return toResponse(filiere);
    }

    public void deleteFiliere(Long filiereId) {
        Filiere filiere = filiereRepository.findById(filiereId)
                .orElseThrow(() -> new RuntimeException("Filière non trouvée"));
        filiereRepository.delete(filiere);
    }

    public List<FiliereResponse> getAllFilieres() {
        return filiereRepository.findAll()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    private FiliereResponse toResponse(Filiere filiere) {
        FiliereResponse response = new FiliereResponse();
        response.setId(filiere.getId());
        response.setNom(filiere.getNom());
        response.setNomResponsableFiliere(filiere.getNomResponsableFiliere());
        response.setCode(filiere.getCode());
        response.setDescription(filiere.getDescription());
        response.setAccreditation(filiere.getAccreditation());
        response.setStatutAccreditation(filiere.getStatutAccreditation());
        response.setDateDebutAccreditation(filiere.getDateDebutAccreditation());
        response.setDateFinAccreditation(filiere.getDateFinAccreditation());
        return response;
    }
}
