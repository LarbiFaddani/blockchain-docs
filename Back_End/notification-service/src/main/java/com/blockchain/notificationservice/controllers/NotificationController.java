package com.blockchain.notificationservice.controllers;

import com.blockchain.notificationservice.dto.StudentCreatedEvent;
import com.blockchain.notificationservice.services.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/notification")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;
// pour test
    @PostMapping("/test-email")
    public ResponseEntity<String> testEmail(@RequestBody StudentCreatedEvent event) {
        notificationService.sendStudentCreatedEmail(event);
        return ResponseEntity.ok("Email envoyé !");
    }
}
