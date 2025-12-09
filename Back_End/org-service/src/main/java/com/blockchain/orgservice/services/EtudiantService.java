package com.blockchain.orgservice.services;
import com.blockchain.orgservice.client.AuthClient;
import com.blockchain.orgservice.dto.*;
import com.blockchain.orgservice.entities.Ecole;
import com.blockchain.orgservice.entities.Etudiant;
import com.blockchain.orgservice.entities.Filiere;
import com.blockchain.orgservice.repositories.EcoleRepository;
import com.blockchain.orgservice.repositories.EtudiantRepository;
import com.blockchain.orgservice.repositories.FiliereRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.Normalizer;
import java.time.LocalDate;
import java.time.Year;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class EtudiantService {

    private final EtudiantRepository etudiantRepository;
    private final EcoleRepository ecoleRepository;
    private final FiliereRepository filiereRepository;
    private final AuthClient authClient;
    private final KafkaTemplate<String, StudentCreatedEvent> kafkaTemplate;

    @Transactional
    public StudentResponse createStudent(RegisterEtudiantRequest request) {

        Ecole ecole = ecoleRepository.findById(request.getEcoleId())
                .orElseThrow(() -> new RuntimeException("Ecole non trouvée"));

        Filiere filiere = filiereRepository.findById(request.getFiliereId())
                .orElseThrow(() -> new RuntimeException("Filière non trouvée"));

        if (!filiere.getEcole().getId().equals(ecole.getId())) {
            throw new RuntimeException("Filière n'appartient pas à cette école");
        }

        etudiantRepository.findByCin(request.getCin()).ifPresent(e -> {
            throw new RuntimeException("Un étudiant avec ce CIN existe déjà");
        });

        List<Etudiant> etudiantsAvecMemeNom = etudiantRepository
                .findByFirstNameIgnoreCaseAndLastNameIgnoreCaseAndEcole(
                        request.getFirstName(),
                        request.getLastName(),
                        ecole
                );

        String institutionalEmail = generateInstitutionalEmail(
                ecole,
                request.getFirstName(),
                request.getLastName(),
                etudiantsAvecMemeNom.size()
        );

        String rawPassword = generateRandomPassword();

        RegisterStudentUserRequest userReq = new RegisterStudentUserRequest();
        userReq.setEmail(institutionalEmail);
        userReq.setPassword(rawPassword);
        userReq.setRole("ETUDIANT");

        try {
            RegisterStudentUserResponse userRes = authClient.registerStudent(userReq);
            Long userId = userRes.getUserId();

            Etudiant etu = new Etudiant();
            etu.setFirstName(request.getFirstName());
            etu.setLastName(request.getLastName());
            etu.setCin(request.getCin());
            etu.setBirthDate(request.getBirthDate());
            etu.setGenre(request.getGenre());
            etu.setPhoneNumber(request.getPhoneNumber());
            etu.setLevel(request.getLevel());
            etu.setPersonalEmail(request.getPersonalEmail());
            etu.setFiliere(filiere);
            etu.setUserId(userId);
            etu.setEcole(filiere.getEcole());
            etu.setStudentCode(generateStudentCode(ecole, filiere));

            if (filiere.getStudents() != null) {
                filiere.getStudents().add(etu);
            }

            Etudiant saved = etudiantRepository.save(etu);
            System.out.println("Etudiant sauvegardé avec ID : " + saved.getId());

            StudentCreatedEvent event = new StudentCreatedEvent();
            event.setStudentFirstName(saved.getFirstName());
            event.setStudentLastName(saved.getLastName());
            event.setPersonalEmail(saved.getPersonalEmail());
            event.setInstitutionalEmail(institutionalEmail);
            event.setGeneratedPassword(rawPassword);
            event.setEcoleName(ecole.getName());
            event.setEcoleAddress(ecole.getAddress());

            kafkaTemplate.send("student-created", event);

            return StudentResponse.builder()
                    .id(saved.getId())
                    .firstName(saved.getFirstName())
                    .lastName(saved.getLastName())
                    .cin(saved.getCin())
                    .personalEmail(saved.getPersonalEmail())
                    .ecoleId(ecole.getId())
                    .filiereId(filiere.getId())
                    .level(saved.getLevel())
                    .generatedPassword(rawPassword)
                    .build();

        } catch (Exception ex) {
            ex.printStackTrace();
            throw new RuntimeException("Erreur lors de la création de l'étudiant : " + ex.getMessage());
        }

}



    // -------------------------------------------------
    // Helpers
    // --------------------------------------------------

    private String generateInstitutionalEmail(Ecole ecole, String firstName, String lastName, int homonymeIndex) {

        String domain="exemple.com" ;
        if (ecole.getEmailContact() != null && ecole.getEmailContact().contains("@")) {
            domain = ecole.getEmailContact().split("@")[1].trim();
        }

        String baseLocal = normalize(firstName) + "." + normalize(lastName);

        // si homonymeIndex > 0, on ajoute un suffixe
        String localPart = (homonymeIndex > 0)
                ? baseLocal + "." + homonymeIndex
                : baseLocal;

        return localPart+ "@" + domain;
    }

    private String normalize(String input) {
        if (input == null) return "";
        String normalized = Normalizer.normalize(input, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", ""); // supprime accents
        normalized = normalized.replaceAll("[^a-zA-Z]", "."); // remplace autres caractères
        normalized = normalized.replaceAll("\\.+", "."); // supprime doublons de points
        normalized=normalized.toLowerCase();
        return normalized;
    }

    private String generateRandomPassword() {
        return UUID.randomUUID().toString().replace("-", "").substring(0, 10);
    }

    private String generateStudentCode(Ecole ecole, Filiere filiere) {
        int annee = Year.now().getValue();
        return "STU-" + ecole.getId() + "-" + filiere.getId() + "-" + annee;
    }

    public List<StudentResponse> getAllStudents() {
        return etudiantRepository.findAll()
                .stream()
                .map(this::mapToStudentResponse)
                .toList();
    }
    public StudentResponse getStudentByCin(String cin) {
        Etudiant etu = etudiantRepository.findByCin(cin)
                .orElseThrow(() -> new RuntimeException("Étudiant non trouvé avec CIN : " + cin));

        return mapToStudentResponse(etu);
    }
    public List<StudentResponse> findByName(String firstName, String lastName) {

        List<Etudiant> results;

        if (firstName != null && lastName != null) {
            results = etudiantRepository.findByFirstNameIgnoreCaseAndLastNameIgnoreCase(firstName, lastName);
        } else if (firstName != null) {
            results = etudiantRepository.findByFirstNameIgnoreCase(firstName);
        } else if (lastName != null) {
            results = etudiantRepository.findByLastNameIgnoreCase(lastName);
        } else {
            throw new RuntimeException("Veuillez fournir au moins un nom ou un prénom");
        }

        return results.stream()
                .map(this::mapToStudentResponse)
                .toList();
    }
    @Transactional
    public StudentResponse updateStudent(Long id, RegisterEtudiantRequest request) {

        Etudiant etudiant = etudiantRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Étudiant non trouvé"));

        if (request.getCin() != null && !request.getCin().equals(etudiant.getCin())) {
            etudiantRepository.findByCin(request.getCin()).ifPresent(e -> {
                throw new RuntimeException("Un étudiant avec ce CIN existe déjà");
            });
            etudiant.setCin(request.getCin());
        }

        if (request.getFirstName() != null) etudiant.setFirstName(request.getFirstName());
        if (request.getLastName() != null) etudiant.setLastName(request.getLastName());
        if (request.getPhoneNumber() != null) etudiant.setPhoneNumber(request.getPhoneNumber());
        if (request.getPersonalEmail() != null) etudiant.setPersonalEmail(request.getPersonalEmail());
        if (request.getBirthDate() != null) etudiant.setBirthDate(request.getBirthDate());
        if (request.getGenre() != null) etudiant.setGenre(request.getGenre());
        if (request.getLevel() != null) etudiant.setLevel(request.getLevel());

        if (request.getFiliereId() != null) {
            Filiere f = filiereRepository.findById(request.getFiliereId())
                    .orElseThrow(() -> new RuntimeException("Filière non trouvée"));
            etudiant.setFiliere(f);
            etudiant.setEcole(f.getEcole());
        }

        Etudiant updated = etudiantRepository.save(etudiant);

        return mapToStudentResponse(updated);
    }

    private StudentResponse mapToStudentResponse(Etudiant e) {
        return StudentResponse.builder()
                .id(e.getId())
                .firstName(e.getFirstName())
                .lastName(e.getLastName())
                .cin(e.getCin())
                .personalEmail(e.getPersonalEmail())
                .ecoleId(e.getEcole() != null ? e.getEcole().getId() : null)
                .filiereId(e.getFiliere() != null ? e.getFiliere().getId() : null)
                .build();
    }


}

