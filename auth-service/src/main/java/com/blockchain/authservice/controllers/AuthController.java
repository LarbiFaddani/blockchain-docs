package com.blockchain.authservice.controllers;

import com.blockchain.authservice.dto.AuthResponse;
import com.blockchain.authservice.dto.LoginRequest;
import com.blockchain.authservice.services.AuthService;
import com.blockchain.authservice.dto.RegisterRequest;
import com.blockchain.authservice.services.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
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


}
