//package com.blockchain.gatewayservice;
//
//import jakarta.ws.rs.HttpMethod;
//import org.springframework.context.annotation.Bean;
//import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
//import org.springframework.security.config.web.server.ServerHttpSecurity;
//import org.springframework.security.web.server.SecurityWebFilterChain;
//
//@EnableWebFluxSecurity
//public class SecurityConfig {
//
//    @Bean
//    public SecurityWebFilterChain springSecurityFilterChain(ServerHttpSecurity http) {
//
//        http
//                .csrf(ServerHttpSecurity.CsrfSpec::disable)
//                .cors(cors -> {}) // 👉 OBLIGATOIRE — active la gestion CORS dans Security
//                .authorizeExchange(exchanges -> exchanges
//                        .pathMatchers(HttpMethod.OPTIONS, "/**").permitAll() // 👉 OBLIGATOIRE pour OPTIONS
//                        .pathMatchers("/auth/login").permitAll() // login ouvert
//                        .anyExchange().authenticated()
//                );
//
//        return http.build();
//    }
//}
