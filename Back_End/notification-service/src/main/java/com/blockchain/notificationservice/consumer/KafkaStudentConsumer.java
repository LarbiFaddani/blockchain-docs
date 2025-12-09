package com.blockchain.notificationservice.consumer;

import com.blockchain.notificationservice.dto.StudentCreatedEvent;
import com.blockchain.notificationservice.services.NotificationService;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class KafkaStudentConsumer {

    private final NotificationService notificationService;
    private final ObjectMapper objectMapper; // injecté automatiquement par Spring

    @KafkaListener(topics = "student-created", groupId = "notification-group")
    public void consume(String message) {
        try {
            // 🔁 convertir le JSON String en StudentCreatedEvent
            StudentCreatedEvent event =
                    objectMapper.readValue(message, StudentCreatedEvent.class);

            log.info("📥 Event reçu : {}", event);

            // ✅ comme avant
            notificationService.sendStudentCreatedEmail(event);

        } catch (Exception e) {
            log.error("❌ Erreur lors de la désérialisation du message Kafka", e);
        }
    }
}
