package com.attendo.mos.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

public record UserInfoResponse(
    UUID id,
    String email,
    String displayName,
    String phone,
    UserType userType,
    boolean isActive,
    OffsetDateTime lastLoginAt,
    OffsetDateTime createdAt
) {}
