package com.blockchain.authservice.services;

import com.blockchain.authservice.dto.AuthResponse;
import com.blockchain.authservice.dto.LoginRequest;
import com.blockchain.authservice.dto.RegisterRequest;
import com.blockchain.authservice.enums.Role;
import com.blockchain.authservice.models.User;
import com.blockchain.authservice.repositories.UserRepository;
import com.blockchain.authservice.security.JwtUtil;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

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
        return new AuthResponse(token, user.getRole().name());
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
            throw new RuntimeException("Email déjà utilisé !");
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

}
