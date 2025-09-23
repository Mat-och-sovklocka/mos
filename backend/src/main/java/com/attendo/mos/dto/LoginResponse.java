package com.attendo.mos.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

public record LoginResponse(
    String token,
    String tokenType,
    UUID userId,
    String email,
    String displayName,
    UserType userType,
    OffsetDateTime expiresAt
) {
    public static LoginResponse of(String token, String tokenType, UUID userId, 
                                 String email, String displayName, UserType userType, 
                                 OffsetDateTime expiresAt) {
        return new LoginResponse(token, tokenType, userId, email, displayName, userType, expiresAt);
    }
}
