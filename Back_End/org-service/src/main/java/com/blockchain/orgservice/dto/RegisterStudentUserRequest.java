package com.blockchain.orgservice.dto;

import lombok.Data;

@Data
public class RegisterStudentUserRequest {
    private String email;
    private String password;
    private String role;
}
