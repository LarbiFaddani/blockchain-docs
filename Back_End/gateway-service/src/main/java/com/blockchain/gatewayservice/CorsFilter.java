package com.blockchain.gatewayservice;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.web.server.WebFilter;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

@Configuration
public class CorsFilter {

    @Bean
    public WebFilter corsWebFilter() {
        return (ServerWebExchange exchange, org.springframework.web.server.WebFilterChain chain) -> {
            ServerHttpRequest request = exchange.getRequest();
            ServerHttpResponse response = exchange.getResponse();

            // 👉 origine de ton front
            String origin = request.getHeaders().getOrigin();
            if (origin == null) {
                origin = "http://localhost:4200";
            }

            response.getHeaders().add("Access-Control-Allow-Origin", origin);
            response.getHeaders().add("Vary", "Origin");
            response.getHeaders().add("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
            response.getHeaders().add("Access-Control-Allow-Headers", "Authorization,Content-Type,*");
            response.getHeaders().add("Access-Control-Allow-Credentials", "true");

            // Si c'est une pré-requête OPTIONS, on répond directement
            if (request.getMethod() == HttpMethod.OPTIONS) {
                response.setStatusCode(HttpStatus.OK);
                return Mono.empty();
            }

            return chain.filter(exchange);
        };
    }
}
