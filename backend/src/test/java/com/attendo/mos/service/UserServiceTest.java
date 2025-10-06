package com.attendo.mos.service;

import com.attendo.mos.dto.UserInfoResponse;
import com.attendo.mos.entity.User;
import com.attendo.mos.dto.UserType;
import com.attendo.mos.repo.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private UserService userService;

    private User testUser;
    private final UUID testUserId = UUID.fromString("11111111-1111-1111-1111-111111111111");
    private final String testEmail = "test@mos.test";

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(testUserId);
        testUser.setEmail(testEmail);
        testUser.setDisplayName("Test User");
        testUser.setUserType(UserType.ADMIN);
        testUser.setActive(true);
        testUser.setCreatedAt(OffsetDateTime.now());
        testUser.setLastLoginAt(OffsetDateTime.now());
    }

    @Test
    void getUserById_ShouldReturnUserInfoResponseWhenUserExists() {
        // Given
        when(userRepository.findById(testUserId))
            .thenReturn(Optional.of(testUser));

        // When
        UserInfoResponse response = userService.getUserById(testUserId);

        // Then
        assertThat(response).isNotNull();
        assertThat(response.id()).isEqualTo(testUserId);
        assertThat(response.email()).isEqualTo(testEmail);
        assertThat(response.displayName()).isEqualTo("Test User");
        assertThat(response.userType()).isEqualTo("ADMIN");
        assertThat(response.createdAt()).isEqualTo(testUser.getCreatedAt());
        assertThat(response.lastLoginAt()).isEqualTo(testUser.getLastLoginAt());

        verify(userRepository).findById(testUserId);
    }

    @Test
    void getUserById_ShouldThrowExceptionWhenUserNotFound() {
        // Given
        when(userRepository.findById(testUserId))
            .thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> userService.getUserById(testUserId))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessage("User not found");

        verify(userRepository).findById(testUserId);
    }

    @Test
    void getAllUsers_ShouldReturnListOfUserInfoResponses() {
        // Given
        User user2 = new User();
        user2.setId(UUID.randomUUID());
        user2.setEmail("user2@mos.test");
        user2.setDisplayName("User 2");
        user2.setUserType(UserType.RESIDENT);
        user2.setActive(true);
        user2.setCreatedAt(OffsetDateTime.now());
        user2.setLastLoginAt(OffsetDateTime.now());

        List<User> users = List.of(testUser, user2);

        when(userRepository.findAll())
            .thenReturn(users);

        // When
        List<UserInfoResponse> responses = userService.getAllUsers();

        // Then
        assertThat(responses).hasSize(2);
        assertThat(responses.get(0).id()).isEqualTo(testUserId);
        assertThat(responses.get(0).email()).isEqualTo(testEmail);
        assertThat(responses.get(1).id()).isEqualTo(user2.getId());
        assertThat(responses.get(1).email()).isEqualTo("user2@mos.test");

        verify(userRepository).findAll();
    }

    @Test
    void getAllUsers_ShouldReturnEmptyListWhenNoUsers() {
        // Given
        when(userRepository.findAll())
            .thenReturn(List.of());

        // When
        List<UserInfoResponse> responses = userService.getAllUsers();

        // Then
        assertThat(responses).isEmpty();

        verify(userRepository).findAll();
    }

    @Test
    void findUserByEmail_ShouldReturnUserWhenEmailExists() {
        // Given
        when(userRepository.findByEmail(testEmail))
            .thenReturn(Optional.of(testUser));

        // When
        User user = userService.findUserByEmail(testEmail);

        // Then
        assertThat(user).isNotNull();
        assertThat(user.getId()).isEqualTo(testUserId);
        assertThat(user.getEmail()).isEqualTo(testEmail);

        verify(userRepository).findByEmail(testEmail);
    }

    @Test
    void findUserByEmail_ShouldThrowExceptionWhenEmailNotFound() {
        // Given
        when(userRepository.findByEmail(testEmail))
            .thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> userService.findUserByEmail(testEmail))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessage("User not found");

        verify(userRepository).findByEmail(testEmail);
    }

    @Test
    void findUserById_ShouldReturnUserWhenIdExists() {
        // Given
        when(userRepository.findById(testUserId))
            .thenReturn(Optional.of(testUser));

        // When
        User user = userService.findUserById(testUserId);

        // Then
        assertThat(user).isNotNull();
        assertThat(user.getId()).isEqualTo(testUserId);
        assertThat(user.getEmail()).isEqualTo(testEmail);

        verify(userRepository).findById(testUserId);
    }

    @Test
    void findUserById_ShouldThrowExceptionWhenIdNotFound() {
        // Given
        when(userRepository.findById(testUserId))
            .thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> userService.findUserById(testUserId))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessage("User not found");

        verify(userRepository).findById(testUserId);
    }
}
