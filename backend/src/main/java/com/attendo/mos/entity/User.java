package com.attendo.mos.entity;

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
    @Column(nullable = false)
    private OffsetDateTime createdAt = OffsetDateTime.now(ZoneOffset.UTC);
}
