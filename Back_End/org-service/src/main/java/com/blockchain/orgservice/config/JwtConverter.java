package com.blockchain.orgservice.config;

import org.springframework.core.convert.converter.Converter;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;

import java.util.List;

public class JwtConverter {

    public static Converter<Jwt, ? extends AbstractAuthenticationToken> jwtAuthConverter() {
        JwtAuthenticationConverter converter = new JwtAuthenticationConverter();

        converter.setJwtGrantedAuthoritiesConverter(jwt -> {
            String role = jwt.getClaimAsString("role"); // claim "role"

            if (role == null) {
                return List.of();
            }

            // => "ECOLE_ADMIN" devient "ROLE_ECOLE_ADMIN"
            String authority = "ROLE_" + role;
            return List.of(new SimpleGrantedAuthority(authority));
        });

        return converter;
    }
}
