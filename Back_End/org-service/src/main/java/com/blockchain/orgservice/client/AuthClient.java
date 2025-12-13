package com.blockchain.orgservice.client;

import com.blockchain.orgservice.config.FeignAuthForwardConfig;
import com.blockchain.orgservice.dto.RegisterOrgAdminRequest;
import com.blockchain.orgservice.dto.RegisterStudentUserRequest;
import com.blockchain.orgservice.dto.RegisterStudentUserResponse;
import com.blockchain.orgservice.dto.UserStatusDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.List;
import java.util.Map;

@FeignClient(name = "auth-service", configuration = FeignAuthForwardConfig.class)
public interface AuthClient {

    @PostMapping("/auth/register-org-admin")
    Map<String, Object> createAdmin(@RequestBody RegisterOrgAdminRequest  request);
    @PostMapping("/auth/register-student")
    RegisterStudentUserResponse registerStudent(@RequestBody RegisterStudentUserRequest request);
    @PutMapping("/auth/disable/{id}")
    String disableAccount(@PathVariable("id") Long userId);
    @PutMapping("/auth/enable/{id}")
    String enableAccount(@PathVariable("id") Long userId);
    @PostMapping("/auth/users/status")
    List<UserStatusDto> getUsersStatus(@RequestBody List<Long> userIds);
}
