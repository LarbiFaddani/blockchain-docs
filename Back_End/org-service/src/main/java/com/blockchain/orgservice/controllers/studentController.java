package com.blockchain.orgservice.controllers;

import com.blockchain.orgservice.client.AuthClient;
import com.blockchain.orgservice.dto.RegisterEtudiantRequest;
import com.blockchain.orgservice.dto.StudentResponse;
import com.blockchain.orgservice.services.EtudiantService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RequestMapping("/student")
@RestController
@RequiredArgsConstructor
public class studentController {

    private final EtudiantService etudiantService;
    private final AuthClient authClient;

    @SecurityRequirement(name = "bearerAuth")
    @PostMapping("/create")
    public StudentResponse createStudent(@RequestBody RegisterEtudiantRequest request) {
        return etudiantService.createStudent(request);
    }

    @GetMapping("/all")
    public List<StudentResponse> getAllStudents() {
        return etudiantService.getAllStudents();
    }

    @GetMapping("/cin/{cin}")
    public StudentResponse getByCin(@PathVariable String cin) {
        return etudiantService.getStudentByCin(cin);
    }

    @GetMapping("/search")
    public List<StudentResponse> findByName(
            @RequestParam(required = false) String firstName,
            @RequestParam(required = false) String lastName
    ) {
        return etudiantService.findByName(firstName, lastName);
    }

    @PutMapping("/update/{id}")
    public StudentResponse updateStudent(@PathVariable Long id, @RequestBody RegisterEtudiantRequest request) {
        return etudiantService.updateStudent(id, request);
    }
    @PutMapping("/disable/{userId}")
    public String disableStudentAccount(@PathVariable Long userId) {
        authClient.disableAccount(userId);
        return "Compte étudiant désactivé";
    }

    @PutMapping("/enable/{userId}")
    public String enableStudentAccount(@PathVariable Long userId) {
        authClient.enableAccount(userId);
        return "Compte étudiant réactivé";
    }

}
