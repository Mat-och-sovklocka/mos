package com.attendo.mos.config;

import com.attendo.mos.dto.UserType;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.OffsetDateTime;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
class JwtUtilTest {

    @InjectMocks
    private JwtUtil jwtUtil;

    private final String testSecret = "mySecretKeyThatIsAtLeast64CharactersLongForJWT512AlgorithmSecurityRequirements";
    private final int testExpiration = 86400; // 24 hours
    private final UUID testUserId = UUID.fromString("11111111-1111-1111-1111-111111111111");
    private final String testEmail = "test@mos.test";
    private final UserType testUserType = UserType.ADMIN;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(jwtUtil, "secret", testSecret);
        ReflectionTestUtils.setField(jwtUtil, "expiration", testExpiration);
    }

    @Test
    void generateToken_ShouldCreateValidToken() {
        // When
        String token = jwtUtil.generateToken(testUserId, testEmail, testUserType);

        // Then
        assertNotNull(token);
        assertTrue(token.contains(".")); // JWT format has dots
        assertTrue(jwtUtil.validateToken(token));
    }

    @Test
    void getUserIdFromToken_ShouldReturnCorrectUserId() {
        // Given
        String token = jwtUtil.generateToken(testUserId, testEmail, testUserType);

        // When
        UUID userId = jwtUtil.getUserIdFromToken(token);

        // Then
        assertEquals(testUserId, userId);
    }

    @Test
    void getEmailFromToken_ShouldReturnCorrectEmail() {
        // Given
        String token = jwtUtil.generateToken(testUserId, testEmail, testUserType);

        // When
        String email = jwtUtil.getEmailFromToken(token);

        // Then
        assertEquals(testEmail, email);
    }

    @Test
    void getUserTypeFromToken_ShouldReturnCorrectUserType() {
        // Given
        String token = jwtUtil.generateToken(testUserId, testEmail, testUserType);

        // When
        UserType userType = jwtUtil.getUserTypeFromToken(token);

        // Then
        assertEquals(testUserType, userType);
    }

    @Test
    void validateToken_ShouldReturnTrueForValidToken() {
        // Given
        String token = jwtUtil.generateToken(testUserId, testEmail, testUserType);

        // When
        boolean isValid = jwtUtil.validateToken(token);

        // Then
        assertTrue(isValid);
    }

    @Test
    void validateToken_ShouldReturnFalseForInvalidToken() {
        // Given
        String invalidToken = "invalid.token.here";

        // When
        boolean isValid = jwtUtil.validateToken(invalidToken);

        // Then
        assertFalse(isValid);
    }
}
