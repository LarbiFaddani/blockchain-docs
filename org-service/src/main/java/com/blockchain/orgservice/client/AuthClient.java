package com.blockchain.orgservice.client;

import com.blockchain.orgservice.dto.RegisterOrgAdminRequest;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.Map;

@FeignClient(name = "auth-service", url = "${auth-service.url}")
public interface AuthClient {

    @PostMapping("/auth/register-org-admin")
    Map<String, Object> createAdmin(@RequestBody RegisterOrgAdminRequest  request);
}
