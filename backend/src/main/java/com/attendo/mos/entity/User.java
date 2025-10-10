package com.attendo.mos.entity;

import com.attendo.mos.dto.UserType;
import jakarta.persistence.*;
import lombok.Data;

import java.time.*;
import java.util.UUID;

import org.hibernate.annotations.UuidGenerator;

@Entity
@Data
@Table(name = "app_user")
public class User {
    @Id
    @GeneratedValue
    @UuidGenerator
    private UUID id;

    @Column(nullable = false, unique = true)
    private String email;
    @Column(nullable = false)
    private String displayName;
    @Column(nullable = false)
    private String passwordHash;
    @Column
    private String phone;
    @Column(nullable = false)
    private OffsetDateTime createdAt = OffsetDateTime.now(ZoneOffset.UTC);
    
    // User management fields
    @Enumerated(EnumType.STRING)
    @Column(name = "user_type", nullable = false, length = 20)
    private UserType userType = UserType.RESIDENT;
    
    @Column(name = "is_active", nullable = false)
    private boolean isActive = true;
    
    @Column(name = "last_login_at")
    private OffsetDateTime lastLoginAt;
}
