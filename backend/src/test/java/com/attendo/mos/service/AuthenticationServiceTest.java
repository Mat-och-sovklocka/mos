package com.attendo.mos.service;

import com.attendo.mos.config.JwtUtil;
import com.attendo.mos.dto.LoginRequest;
import com.attendo.mos.dto.LoginResponse;
import com.attendo.mos.dto.UserInfoResponse;
import com.attendo.mos.dto.UserType;
import com.attendo.mos.entity.User;
import com.attendo.mos.repo.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.OffsetDateTime;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthenticationServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private JwtUtil jwtUtil;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private AuthenticationService authenticationService;

    private User testUser;
    private final UUID testUserId = UUID.fromString("11111111-1111-1111-1111-111111111111");
    private final String testEmail = "test@mos.test";
    private final String testPassword = "password123";
    private final String testToken = "test.jwt.token";

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(testUserId);
        testUser.setEmail(testEmail);
        testUser.setDisplayName("Test User");
        testUser.setUserType(UserType.ADMIN);
        testUser.setActive(true);
        testUser.setCreatedAt(OffsetDateTime.now());
        testUser.setPasswordHash("$2a$10$WbOd/JiKwBuiIIZe0JwuPuQHEWI9ltUu9vffhqEa4biZvrbQYsmFu");
    }

    //todo: fix these tests
    /* @Test
    void authenticate_ShouldReturnLoginResponseWhenCredentialsValid() {
        // Given
        LoginRequest request = new LoginRequest(testEmail, testPassword);

        when(userRepository.findByEmail(testEmail))
            .thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches(testPassword, testUser.getPasswordHash()))
            .thenReturn(true);
        when(jwtUtil.generateToken(testEmail, testUserId.toString()))
            .thenReturn(testToken);
        when(userRepository.save(any(User.class)))
            .thenReturn(testUser);

        // When
        LoginResponse response = authenticationService.authenticate(request);

        // Then
        assertThat(response).isNotNull();
        assertThat(response.token()).isEqualTo(testToken);
        assertThat(response.userId()).isEqualTo(testUserId);
        assertThat(response.email()).isEqualTo(testEmail);
        assertThat(response.displayName()).isEqualTo("Test User");
        assertThat(response.userType()).isEqualTo("ADMIN");

        verify(userRepository).findByEmail(testEmail);
        verify(passwordEncoder).matches(testPassword, testUser.getPasswordHash());
        verify(jwtUtil).generateToken(testEmail, testUserId.toString());
        verify(userRepository).save(testUser);
    } */

    /* @Test
    void authenticate_ShouldThrowExceptionWhenUserNotFound() {
        // Given
        LoginRequest request = new LoginRequest(testEmail, testPassword);

        when(userRepository.findByEmail(testEmail))
            .thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> authenticationService.authenticate(request))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessage("Invalid email or password");

        verify(userRepository).findByEmail(testEmail);
        verify(passwordEncoder, never()).matches(anyString(), anyString());
        verify(jwtUtil, never()).generateToken(anyString(), anyString());
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void authenticate_ShouldThrowExceptionWhenPasswordInvalid() {
        // Given
        LoginRequest request = new LoginRequest(testEmail, testPassword);

        when(userRepository.findByEmail(testEmail))
            .thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches(testPassword, testUser.getPasswordHash()))
            .thenReturn(false);

        // When & Then
        assertThatThrownBy(() -> authenticationService.authenticate(request))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessage("Invalid email or password");

        verify(userRepository).findByEmail(testEmail);
        verify(passwordEncoder).matches(testPassword, testUser.getPasswordHash());
        verify(jwtUtil, never()).generateToken(anyString(), anyString());
        verify(userRepository, never()).save(any(User.class));
    } */

    @Test
    void getUserInfo_ShouldReturnUserInfoResponseWhenUserExists() {
        // Given
        when(userRepository.findById(testUserId))
            .thenReturn(Optional.of(testUser));

        // When
        UserInfoResponse response = authenticationService.getUserInfo(testUserId);

        // Then
        assertThat(response).isNotNull();
        assertThat(response.id()).isEqualTo(testUserId);
        assertThat(response.email()).isEqualTo(testEmail);
        assertThat(response.displayName()).isEqualTo("Test User");
        assertThat(response.userType()).isEqualTo(UserType.ADMIN);
        assertThat(response.createdAt()).isEqualTo(testUser.getCreatedAt());
        assertThat(response.lastLoginAt()).isEqualTo(testUser.getLastLoginAt());

        verify(userRepository).findById(testUserId);
    }

    @Test
    void getUserInfo_ShouldThrowExceptionWhenUserNotFound() {
        // Given
        when(userRepository.findById(testUserId))
            .thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> authenticationService.getUserInfo(testUserId))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessage("User not found");

        verify(userRepository).findById(testUserId);
    }
}
