package com.attendo.mos.controller;

import com.attendo.mos.config.JwtUtil;
import com.attendo.mos.dto.LoginRequest;
import com.attendo.mos.dto.UserType;
import com.attendo.mos.entity.User;
import com.attendo.mos.repo.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;

import java.time.OffsetDateTime;
import java.util.Optional;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(controllers = AuthenticationController.class, excludeAutoConfiguration = {
    org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration.class
})
class AuthenticationControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private JwtUtil jwtUtil;

    @MockBean
    private UserRepository userRepository;

    @Autowired
    private ObjectMapper objectMapper;

    private final UUID testUserId = UUID.fromString("11111111-1111-1111-1111-111111111111");
    private final String testEmail = "test@mos.test";
    private final String testPassword = "password123";
    private final String testToken = "test.jwt.token";

    @Test
    void login_ShouldReturnTokenWhenCredentialsValid() throws Exception {
        // Given
        LoginRequest request = new LoginRequest(testEmail, testPassword);
        User user = createTestUser();
        OffsetDateTime expiresAt = OffsetDateTime.now().plusHours(24);

        when(userRepository.findByEmailAndIsActiveTrue(testEmail))
            .thenReturn(Optional.of(user));
        when(jwtUtil.generateToken(testUserId, testEmail, UserType.ADMIN))
            .thenReturn(testToken);
        when(jwtUtil.getExpirationFromToken(testToken))
            .thenReturn(expiresAt);

        // When & Then
        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value(testToken))
                .andExpect(jsonPath("$.tokenType").value("Bearer"))
                .andExpect(jsonPath("$.userId").value(testUserId.toString()))
                .andExpect(jsonPath("$.email").value(testEmail))
                .andExpect(jsonPath("$.displayName").value("Test User"))
                .andExpect(jsonPath("$.userType").value("ADMIN"));

        verify(userRepository).save(user); // Verify lastLoginAt was updated
    }

    @Test
    void login_ShouldReturn401WhenUserNotFound() throws Exception {
        // Given
        LoginRequest request = new LoginRequest(testEmail, testPassword);

        when(userRepository.findByEmailAndIsActiveTrue(testEmail))
            .thenReturn(Optional.empty());

        // When & Then
        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized())
                .andExpect(content().string("Invalid email or password"));

        verify(userRepository, never()).save(any());
    }

    @Test
    void logout_ShouldReturn200() throws Exception {
        // When & Then
        mockMvc.perform(post("/api/auth/logout"))
                .andExpect(status().isOk())
                .andExpect(content().string("Logout successful"));
    }

    private User createTestUser() {
        User user = new User();
        user.setId(testUserId);
        user.setEmail(testEmail);
        user.setDisplayName("Test User");
        user.setUserType(UserType.ADMIN);
        user.setActive(true);
        user.setCreatedAt(OffsetDateTime.now());
        // Set a proper BCrypt hash for "password123"
        user.setPasswordHash("$2a$10$WbOd/JiKwBuiIIZe0JwuPuQHEWI9ltUu9vffhqEa4biZvrbQYsmFu");
        return user;
    }
}
