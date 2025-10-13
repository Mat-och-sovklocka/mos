package com.attendo.mos.controller;

import com.attendo.mos.dto.LoginRequest;
import com.attendo.mos.dto.LoginResponse;
import com.attendo.mos.dto.UserInfoResponse;
import com.attendo.mos.dto.UserType;
import com.attendo.mos.service.AuthenticationService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.OffsetDateTime;
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
    private AuthenticationService authenticationService;

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
        LoginResponse response = LoginResponse.of(
            testToken,
            "Bearer",
            testUserId,
            testEmail,
            "Test User",
            UserType.ADMIN,
            OffsetDateTime.now().plusHours(24)
        );

        when(authenticationService.authenticate(any(LoginRequest.class)))
            .thenReturn(response);

        // When & Then
        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value(testToken))
                .andExpect(jsonPath("$.userId").value(testUserId.toString()))
                .andExpect(jsonPath("$.email").value(testEmail))
                .andExpect(jsonPath("$.displayName").value("Test User"))
                .andExpect(jsonPath("$.userType").value("ADMIN"));

        verify(authenticationService).authenticate(request);
    }

    @Test
    void login_ShouldReturn401WhenCredentialsInvalid() throws Exception {
        // Given
        LoginRequest request = new LoginRequest(testEmail, testPassword);

        when(authenticationService.authenticate(any(LoginRequest.class)))
            .thenThrow(new IllegalArgumentException("Invalid email or password"));

        // When & Then
        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized())
                .andExpect(content().string("Invalid email or password"));

        verify(authenticationService).authenticate(request);
    }

    @Test
    void login_ShouldReturn500WhenServiceThrowsException() throws Exception {
        // Given
        LoginRequest request = new LoginRequest(testEmail, testPassword);

        when(authenticationService.authenticate(any(LoginRequest.class)))
            .thenThrow(new RuntimeException("Database connection failed"));

        // When & Then
        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isInternalServerError())
                .andExpect(content().string("Login failed: Database connection failed"));

        verify(authenticationService).authenticate(request);
    }

    //todo: fix this test
    @Test
    void getCurrentUser_ShouldReturnUserInfoWhenTokenValid() throws Exception {
        // Given
        String authHeader = "Bearer " + testToken;
        UserInfoResponse userInfo = new UserInfoResponse(
            testUserId,
            testEmail,
            "Test User",
            UserType.ADMIN,
            true,
            OffsetDateTime.now(),
            OffsetDateTime.now()
        );

        when(authenticationService.getUserInfo(testUserId))
            .thenReturn(userInfo);

        // When & Then
        mockMvc.perform(get("/api/auth/me")
                .header("Authorization", authHeader))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(testUserId.toString()))
                .andExpect(jsonPath("$.email").value(testEmail))
                .andExpect(jsonPath("$.displayName").value("Test User"))
                .andExpect(jsonPath("$.userType").value("ADMIN"));

        verify(authenticationService).getUserInfo(testUserId);
    } */

    @Test
    void getCurrentUser_ShouldReturn401WhenNoAuthHeader() throws Exception {
        // When & Then
        mockMvc.perform(get("/api/auth/me"))
                .andExpect(status().isUnauthorized())
                .andExpect(content().string("Missing or invalid authorization header"));

        verify(authenticationService, never()).getUserInfo(any());
    }

    @Test
    void logout_ShouldReturn200() throws Exception {
        // When & Then
        mockMvc.perform(post("/api/auth/logout"))
                .andExpect(status().isOk())
                .andExpect(content().string("Logout successful"));
    }
}