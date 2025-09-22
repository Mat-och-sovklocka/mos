package com.attendo.mos.entity;

import com.attendo.mos.dto.UserType;
import jakarta.persistence.*;
import lombok.Data;

import java.time.*;
import java.util.List;
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
    @Column(nullable = false)
    private OffsetDateTime createdAt = OffsetDateTime.now(ZoneOffset.UTC);
    
    // User management fields
    @Enumerated(EnumType.STRING)
    @Column(name = "user_type", nullable = false, length = 20)
    private UserType userType = UserType.RESIDENT;
    
    @Column(name = "is_active", nullable = false)
    private boolean isActive = true;
    
    @ManyToOne
    @JoinColumn(name = "assigned_caregiver_id")
    private User assignedCaregiver;
    
    @OneToMany(mappedBy = "assignedCaregiver")
    private List<User> assignedResidents;
    
    @Column(name = "last_login_at")
    private OffsetDateTime lastLoginAt;
}
