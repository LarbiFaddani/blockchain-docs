package com.blockchain.authservice.dto;

import com.blockchain.authservice.enums.Role;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserAdminDto {
    private Long id;
    private String email;
    private Role role;
    private boolean enabled;
}