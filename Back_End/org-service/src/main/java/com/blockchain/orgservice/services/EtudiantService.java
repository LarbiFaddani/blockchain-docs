package com.blockchain.orgservice.services;

import com.blockchain.orgservice.client.AuthClient;
import com.blockchain.orgservice.dto.*;
import com.blockchain.orgservice.entities.Ecole;
import com.blockchain.orgservice.entities.Etudiant;
import com.blockchain.orgservice.entities.Filiere;
import com.blockchain.orgservice.repositories.EcoleRepository;
import com.blockchain.orgservice.repositories.EtudiantRepository;
import com.blockchain.orgservice.repositories.FiliereRepository;
import feign.FeignException;
import lombok.RequiredArgsConstructor;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.Normalizer;
import java.time.Year;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EtudiantService {

    private final EtudiantRepository etudiantRepository;
    private final EcoleRepository ecoleRepository;
    private final FiliereRepository filiereRepository;
    private final AuthClient authClient;
    private final KafkaTemplate<String, StudentCreatedEvent> kafkaTemplate;

    // -------------------------------------------------
    // Create
    // -------------------------------------------------
    @Transactional
    public StudentResponse createStudent(RegisterEtudiantRequest request) {

        Ecole ecole = ecoleRepository.findById(request.getEcoleId())
                .orElseThrow(() -> new RuntimeException("Ecole non trouvée"));

        Filiere filiere = filiereRepository.findById(request.getFiliereId())
                .orElseThrow(() -> new RuntimeException("Filière non trouvée"));

        if (!Objects.equals(filiere.getEcole().getId(), ecole.getId())) {
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

            Etudiant saved = etudiantRepository.save(etu);

            StudentCreatedEvent event = new StudentCreatedEvent();
            event.setStudentFirstName(saved.getFirstName());
            event.setStudentLastName(saved.getLastName());
            event.setPersonalEmail(saved.getPersonalEmail());
            event.setInstitutionalEmail(institutionalEmail);
            event.setGeneratedPassword(rawPassword);
            event.setEcoleName(ecole.getName());
            event.setEcoleAddress(ecole.getAddress());
            kafkaTemplate.send("student-created", event);

            // ✅ enabled (optionnel) : on tente de le récupérer, sinon null
            Boolean enabled = fetchEnabledSafe(saved.getUserId());

            return StudentResponse.builder()
                    .id(saved.getId())
                    .userId(saved.getUserId())
                    .firstName(saved.getFirstName())
                    .lastName(saved.getLastName())
                    .cin(saved.getCin())
                    .birthDate(saved.getBirthDate())
                    .genre(saved.getGenre())
                    .phoneNumber(saved.getPhoneNumber())
                    .personalEmail(saved.getPersonalEmail())
                    .ecoleId(ecole.getId())
                    .filiereId(filiere.getId())
                    .level(saved.getLevel())
                    .studentCode(saved.getStudentCode())
                    .generatedPassword(rawPassword)
                    .enabled(enabled) // ✅ AJOUT
                    .build();

        } catch (FeignException e) {

            if (e.status() == 409) {
                throw new RuntimeException(
                        "Impossible de créer le compte étudiant : email institutionnel déjà utilisé (" + institutionalEmail + ")"
                );
            }

            if (e.status() == 400) {
                throw new RuntimeException("Requête invalide vers auth-service (400) : " + e.getMessage());
            }

            if (e.status() == 401 || e.status() == 403) {
                throw new RuntimeException(
                        "Accès refusé à auth-service (status=" + e.status() + "). Vérifiez la sécurité / token inter-services."
                );
            }

            throw new RuntimeException("Erreur auth-service (status=" + e.status() + ") : " + e.getMessage());

        } catch (Exception ex) {
            throw new RuntimeException("Erreur lors de la création de l'étudiant : " + ex.getMessage(), ex);
        }
    }

    // -------------------------------------------------
    // Helpers
    // -------------------------------------------------
    private String generateInstitutionalEmail(Ecole ecole, String firstName, String lastName, int homonymeIndex) {
        String domain = "exemple.com";
        if (ecole.getEmailContact() != null && ecole.getEmailContact().contains("@")) {
            domain = ecole.getEmailContact().split("@")[1].trim();
        }

        String baseLocal = normalize(firstName) + "." + normalize(lastName);
        String localPart = (homonymeIndex > 0) ? baseLocal + "." + homonymeIndex : baseLocal;

        return localPart + "@" + domain;
    }

    private String normalize(String input) {
        if (input == null) return "";
        String normalized = Normalizer.normalize(input, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "");
        normalized = normalized.replaceAll("[^a-zA-Z]", ".");
        normalized = normalized.replaceAll("\\.+", ".");
        return normalized.toLowerCase();
    }

    private String generateRandomPassword() {
        return UUID.randomUUID().toString().replace("-", "").substring(0, 10);
    }

    private String generateStudentCode(Ecole ecole, Filiere filiere) {
        int annee = Year.now().getValue();
        return "STU-" + ecole.getId() + "-" + filiere.getId() + "-" + annee;
    }

    /**
     * ✅ Récupère enabled pour un userId sans casser le flow si auth-service refuse.
     */
    private Boolean fetchEnabledSafe(Long userId) {
        if (userId == null) return null;
        try {
            List<UserStatusDto> res = authClient.getUsersStatus(List.of(userId));
            if (res == null || res.isEmpty()) return null;
            return res.get(0).enabled();
        } catch (FeignException ex) {
            return null;
        } catch (Exception ex) {
            return null;
        }
    }

    // -------------------------------------------------
    // Read
    // -------------------------------------------------
    public List<StudentResponse> getAllStudents() {
        List<Etudiant> etudiants = etudiantRepository.findAll();
        return mapListWithEnabled(etudiants);
    }

    public StudentResponse getStudentByCin(String cin) {
        Etudiant etu = etudiantRepository.findByCin(cin)
                .orElseThrow(() -> new RuntimeException("Étudiant non trouvé avec CIN : " + cin));

        // ✅ enabled
        Boolean enabled = fetchEnabledSafe(etu.getUserId());
        return mapToStudentResponse(etu, enabled);
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

        return mapListWithEnabled(results);
    }

    // -------------------------------------------------
    // Update
    // -------------------------------------------------
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

        // ✅ enabled
        Boolean enabled = fetchEnabledSafe(updated.getUserId());
        return mapToStudentResponse(updated, enabled);
    }

    // -------------------------------------------------
    // Mapping (avec enabled)
    // -------------------------------------------------
    private StudentResponse mapToStudentResponse(Etudiant e, Boolean enabled) {
        return StudentResponse.builder()
                .id(e.getId())
                .userId(e.getUserId())
                .firstName(e.getFirstName())
                .lastName(e.getLastName())
                .cin(e.getCin())
                .birthDate(e.getBirthDate())
                .genre(e.getGenre())
                .phoneNumber(e.getPhoneNumber())
                .level(e.getLevel())
                .personalEmail(e.getPersonalEmail())
                .studentCode(e.getStudentCode())
                .ecoleId(e.getEcole() != null ? e.getEcole().getId() : null)
                .filiereId(e.getFiliere() != null ? e.getFiliere().getId() : null)
                .enabled(enabled) // ✅ AJOUT
                .build();
    }

    /**
     * ✅ Map liste étudiants + enabled en 1 seul appel auth-service (batch).
     */
    private List<StudentResponse> mapListWithEnabled(List<Etudiant> etudiants) {

        List<Long> userIds = etudiants.stream()
                .map(Etudiant::getUserId)
                .filter(Objects::nonNull)
                .distinct()
                .toList();

        Map<Long, Boolean> enabledMap = new HashMap<>();

        if (!userIds.isEmpty()) {
            try {
                List<UserStatusDto> statuses = authClient.getUsersStatus(userIds);
                if (statuses != null) {
                    enabledMap = statuses.stream()
                            .collect(Collectors.toMap(UserStatusDto::userId, UserStatusDto::enabled, (a, b) -> a));
                }
            } catch (FeignException ex) {
                // si 403 ou auth-service down -> enabled restera null
            } catch (Exception ex) {
                // idem
            }
        }

        Map<Long, Boolean> finalEnabledMap = enabledMap;
        return etudiants.stream()
                .map(e -> mapToStudentResponse(e, finalEnabledMap.get(e.getUserId())))
                .toList();
    }

    // -------------------------------------------------
    // Read by school
    // -------------------------------------------------
    @Transactional(readOnly = true)
    public List<StudentResponse> getStudentsByEcoleId(Long ecoleId) {
        List<Etudiant> etudiants = etudiantRepository.findByEcole_Id(ecoleId);
        return mapListWithEnabled(etudiants);
    }
}
