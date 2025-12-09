package com.blockchain.orgservice.dto;


import com.blockchain.orgservice.enums.RoleType;
import lombok.Data;

@Data
public class RegisterOrgAdminRequest {
    private String email;
    private String password;
    private RoleType role;
}
