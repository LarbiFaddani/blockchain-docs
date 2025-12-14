package com.blockchain.authservice.services;

import com.blockchain.authservice.dto.*;
import com.blockchain.authservice.enums.Role;
import com.blockchain.authservice.exceptions.EmailAlreadyUsedException;
import com.blockchain.authservice.models.User;
import com.blockchain.authservice.repositories.UserRepository;
import com.blockchain.authservice.security.JwtUtil;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    public void register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email déjà utilisé");
        }

        Role role = request.getRole();
        User user = new User();
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(role);
        user.setEnabled(true);

        userRepository.save(user);
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Email ou mot de passe incorrect"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Email ou mot de passe incorrect");
        }

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name());
        return new AuthResponse(token,user.getId(), user.getRole().name());
    }

    public Long registerOrgAdmin(RegisterRequest request) {

        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email déjà utilisé !");
        }

        User user = new User();
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(Role.valueOf(request.getRole().name()));    // ECOLE_ADMIN ou ENTREPRISE_ADMIN
        user.setEnabled(true);

        User saved = userRepository.save(user);
        return saved.getId();
    }
    public Long registerStudent(RegisterRequest req) {

        if (userRepository.existsByEmail(req.getEmail())) {
            throw new EmailAlreadyUsedException("Email déjà utilisé !");
        }

        User user = new User();
        user.setEmail(req.getEmail());
        user.setPassword(passwordEncoder.encode(req.getPassword()));
        user.setRole(Role.ETUDIANT);
        user.setEnabled(true);

        User saved = userRepository.save(user);
        return saved.getId();
    }
    public void disableAccount(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé avec ID : " + userId));

        if (!user.isEnabled()) {
            throw new RuntimeException("Le compte est déjà désactivé");
        }

        user.setEnabled(false);
        userRepository.save(user);
    }
    public void enableAccount(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé avec ID : " + userId));

        if (user.isEnabled()) {
            throw new RuntimeException("Le compte est déjà actif");
        }

        user.setEnabled(true);
        userRepository.save(user);
    }
    public List<UserStatusDto> getUsersStatus(List<Long> userIds) {
        if (userIds == null || userIds.isEmpty()) return List.of();

        return userRepository.findAllById(userIds).stream()
                .map(u -> new UserStatusDto(u.getId(), u.isEnabled()))
                .toList();
    }

    public List<UserAdminDto> getAllUsers() {
        return userRepository.findAll().stream()
                .map(u -> new UserAdminDto(
                        u.getId(),
                        u.getEmail(),
                        u.getRole(),
                        u.isEnabled()
                ))
                .toList();
    }

    public UserAdminDto getUserById(Long userId) {
        User u = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé avec ID : " + userId));

        return new UserAdminDto(
                u.getId(),
                u.getEmail(),
                u.getRole(),
                u.isEnabled()
        );
    }


    public void changePassword(Long userId, ChangePasswordRequest req) {
        if (req == null) throw new RuntimeException("Requête invalide");
        if (req.getCurrentPassword() == null || req.getCurrentPassword().isBlank()) {
            throw new RuntimeException("Mot de passe actuel obligatoire");
        }
        if (req.getNewPassword() == null || req.getNewPassword().length() < 6) {
            throw new RuntimeException("Nouveau mot de passe invalide (min 6)");
        }
        if (Objects.equals(req.getCurrentPassword(), req.getNewPassword())) {
            throw new RuntimeException("Le nouveau mot de passe doit être différent");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé avec ID : " + userId));

        if (!passwordEncoder.matches(req.getCurrentPassword(), user.getPassword())) {
            throw new RuntimeException("Mot de passe actuel incorrect");
        }

        user.setPassword(passwordEncoder.encode(req.getNewPassword()));
        userRepository.save(user);
    }
}
