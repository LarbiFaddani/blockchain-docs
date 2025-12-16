package com.blockchain.orgservice.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.security.web.SecurityFilterChain;

import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;

@Configuration
public class SecurityConfig {

    @Value("${app.jwt.secret}")
    private String jwtSecret;

    @Bean
    public JwtAuthenticationConverter jwtAuthenticationConverter() {
        JwtGrantedAuthoritiesConverter converter = new JwtGrantedAuthoritiesConverter();
        converter.setAuthoritiesClaimName("role");
        converter.setAuthorityPrefix("ROLE_");

        JwtAuthenticationConverter jwtConverter = new JwtAuthenticationConverter();
        jwtConverter.setJwtGrantedAuthoritiesConverter(converter);
        return jwtConverter;
    }

    @Bean
    public JwtDecoder jwtDecoder() {
        SecretKeySpec key = new SecretKeySpec(
                jwtSecret.getBytes(StandardCharsets.UTF_8),
                "HmacSHA384"
        );

        return NimbusJwtDecoder
                .withSecretKey(key)
                .macAlgorithm(org.springframework.security.oauth2.jose.jws.MacAlgorithm.HS384)
                .build();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        http
                .csrf(csrf -> csrf.disable())
                .sessionManagement(sess -> sess.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth

                        // Swagger / OpenAPI
                        .requestMatchers(
                                "/swagger-ui.html", "/swagger-ui/**",
                                "/v3/api-docs", "/v3/api-docs/**", "/v3/api-docs.yaml"
                        ).permitAll()

                        // Public (si tu veux le laisser public)
                        .requestMatchers(HttpMethod.POST, "/orgs/register").permitAll()

                        // ---------------- ECOLE_ADMIN scope ----------------
                        // filières: ECOLE_ADMIN (et ADMIN en bonus)
                        .requestMatchers("/filieres/**").hasAnyRole("ECOLE_ADMIN", "ADMIN")

                        // étudiants: ECOLE_ADMIN (et ADMIN)
                        .requestMatchers("/student/**").hasAnyRole("ECOLE_ADMIN", "ADMIN","ENTREPRISE_ADMIN","ETUDIANT")
                        .requestMatchers(HttpMethod.POST, "/orgs/students").hasAnyRole("ECOLE_ADMIN", "ADMIN")

                        // récupérer l'école d'un admin (ECOLE_ADMIN et ADMIN)
                        .requestMatchers(HttpMethod.GET, "/orgs/ecoles/by-admin/**").hasAnyRole("ECOLE_ADMIN","ENTREPRISE_ADMIN", "ADMIN")

                        // ---------------- ADMIN scope (gestion globale) ----------------
                        // écoles globales
                        .requestMatchers(HttpMethod.GET, "/orgs/ecoles").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.GET, "/orgs/ecoles/*").hasAnyRole("ADMIN","ENTREPRISE_ADMIN")
                        // update école : ADMIN et ECOLE_ADMIN (si tu veux autoriser l’école admin à modifier son école)
                        .requestMatchers(HttpMethod.PUT, "/orgs/ecoles/update/**").hasAnyRole("ECOLE_ADMIN", "ADMIN")

                        // entreprises globales
                        .requestMatchers(HttpMethod.GET, "/orgs/entreprises").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.GET, "/orgs/entreprises/*").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.GET, "/student/*").hasAnyRole("ENTREPRISE_ADMIN","ETUDIANT")

                        .requestMatchers(HttpMethod.GET, "/entreprises/by-admin/*entreprises/by-admin").hasRole("ENTREPRISE_ADMIN")

                        // update entreprise : ADMIN et ENTREPRISE_ADMIN (si tu veux)
                        .requestMatchers(HttpMethod.PUT, "/orgs/entreprises/update/**").hasAnyRole("ENTREPRISE_ADMIN", "ADMIN")

                        .anyRequest().authenticated()
                )
                .oauth2ResourceServer(oauth -> oauth
                        .jwt(jwt -> jwt
                                .decoder(jwtDecoder())
                                .jwtAuthenticationConverter(jwtAuthenticationConverter())
                        )
                );

        return http.build();
    }
}
