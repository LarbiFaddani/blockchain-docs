package com.blockchain.authservice.controllers;

import com.blockchain.authservice.dto.*;
import com.blockchain.authservice.services.AuthService;
import com.blockchain.authservice.services.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService service) {
        this.authService = service;
    }

    @PostMapping("/register")
    public ResponseEntity<Void> register(@Valid @RequestBody RegisterRequest request) {
        authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }
    @PostMapping("/register-org-admin")
    public ResponseEntity<?> registerOrgAdmin(@RequestBody RegisterRequest request) {

        Long userId = authService.registerOrgAdmin(request);

        Map<String, Object> body = new HashMap<>();
        body.put("message", "Admin organisation créé avec succès");
        body.put("userId", userId);

        return ResponseEntity.ok(body);
    }
    @PostMapping("/register-student")
    public ResponseEntity<Map<String, Object>> registerStudent(@RequestBody RegisterRequest req) {

        Long userId = authService.registerStudent(req);

        Map<String, Object> body = new HashMap<>();
        body.put("message", "Compte étudiant créé avec succès");
        body.put("userId", userId);

        return ResponseEntity.status(HttpStatus.CREATED).body(body);
    }
    @PutMapping("/disable/{id}")
    public String disableUser(@PathVariable Long id) {
        authService.disableAccount(id);
        return "Compte désactivé avec succès";
    }

    @PutMapping("/enable/{id}")
    public String enableUser(@PathVariable Long id) {
        authService.enableAccount(id);
        return "Compte activé avec succès";
    }
    @PostMapping("/users/status")
    public List<UserStatusDto> getUsersStatus(@RequestBody List<Long> userIds) {
        return authService.getUsersStatus(userIds);
    }

    @GetMapping("/users/all")
    public List<UserAdminDto> getAllUsers() {
        return authService.getAllUsers();
    }

    @GetMapping("/users/{id}")
    public ResponseEntity<UserAdminDto> getById(@PathVariable Long id) {
        return ResponseEntity.ok(authService.getUserById(id));
    }

    @PutMapping("/users/{id}/password")
    public ResponseEntity<String> changePassword(@PathVariable Long id,
                                                 @RequestBody ChangePasswordRequest req) {
        authService.changePassword(id, req);
        return ResponseEntity.ok("Mot de passe modifié avec succès");
    }

}
