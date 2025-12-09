package com.blockchain.notificationservice.services;

import com.blockchain.notificationservice.dto.StudentCreatedEvent;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;

import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring6.SpringTemplateEngine;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final JavaMailSender mailSender;
    private final SpringTemplateEngine templateEngine;

    public void sendStudentCreatedEmail(StudentCreatedEvent event) {

        try {
            MimeMessage msg = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(msg, true);

            helper.setTo(event.getPersonalEmail());
            helper.setSubject("Bienvenue à " + event.getEcoleName());

            Context context = new Context();
            context.setVariable("firstName", event.getStudentFirstName());
            context.setVariable("lastName", event.getStudentLastName());
            context.setVariable("ecoleName", event.getEcoleName());
            context.setVariable("ecoleAddress", event.getEcoleAddress());
            context.setVariable("email", event.getInstitutionalEmail());
            context.setVariable("password", event.getGeneratedPassword());

            String html = templateEngine.process("student_email_template", context);

            helper.setText(html, true);
            mailSender.send(msg);

            System.out.println("📧 Email envoyé → " + event.getPersonalEmail());

        } catch (MessagingException e) {
            throw new RuntimeException("Erreur email : " + e.getMessage());
        }
    }
}
