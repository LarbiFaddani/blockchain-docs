package com.blockchain.authservice.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.security.web.SecurityFilterChain;

import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Value("${app.jwt.secret}")
    private String jwtSecret;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    /**
     * JWT claim:
     *  - claim name = "role"
     *  - prefix = "ROLE_"
     * Exemple: role=ECOLE_ADMIN => authority=ROLE_ECOLE_ADMIN
     */
    @Bean
    public JwtAuthenticationConverter jwtAuthenticationConverter() {
        JwtGrantedAuthoritiesConverter conv = new JwtGrantedAuthoritiesConverter();
        conv.setAuthoritiesClaimName("role");
        conv.setAuthorityPrefix("ROLE_");

        JwtAuthenticationConverter jwtConv = new JwtAuthenticationConverter();
        jwtConv.setJwtGrantedAuthoritiesConverter(conv);
        return jwtConv;
    }

    @Bean
    public JwtDecoder jwtDecoder() {
        SecretKeySpec key = new SecretKeySpec(
                jwtSecret.getBytes(StandardCharsets.UTF_8),
                "HmacSHA384"
        );

        return NimbusJwtDecoder.withSecretKey(key)
                .macAlgorithm(org.springframework.security.oauth2.jose.jws.MacAlgorithm.HS384)
                .build();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        http.csrf(csrf -> csrf.disable());
        http.sessionManagement(sess -> sess.sessionCreationPolicy(SessionCreationPolicy.STATELESS));

        http.authorizeHttpRequests(auth -> auth

                // Swagger / OpenAPI
                .requestMatchers(
                        "/swagger-ui.html", "/swagger-ui/**",
                        "/v3/api-docs", "/v3/api-docs/**", "/v3/api-docs.yaml"
                ).permitAll()

                // Public
                .requestMatchers(HttpMethod.POST,
                        "/auth/login",
                        "/auth/register",
                        "/auth/register-org-admin"
                ).permitAll()

                // Protégé : création étudiant + gestion status (ECOLE_ADMIN ou ADMIN)
                .requestMatchers(HttpMethod.POST, "/auth/register-student").hasAnyRole("ECOLE_ADMIN", "ADMIN")
                .requestMatchers(HttpMethod.POST, "/users/status").hasAnyRole("ECOLE_ADMIN", "ADMIN")
                .requestMatchers(HttpMethod.PUT, "/auth/disable/**", "/auth/enable/**").hasAnyRole("ECOLE_ADMIN", "ADMIN")
                .requestMatchers(HttpMethod.PUT, "/users/all").hasRole("ADMIN")

                .requestMatchers(HttpMethod.GET, "/auth/users/**").hasRole("ADMIN")
//                .requestMatchers(HttpMethod.PUT, "/auth/users/**/password").hasRole("ADMIN")

                .anyRequest().authenticated()
        );

        http.oauth2ResourceServer(oauth -> oauth
                .jwt(jwt -> jwt
                        .decoder(jwtDecoder())
                        .jwtAuthenticationConverter(jwtAuthenticationConverter())
                )
        );

        return http.build();
    }
}
