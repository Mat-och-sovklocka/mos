package com.attendo.mos.service;

import com.attendo.mos.dto.MealRequirementsRequest;
import com.attendo.mos.dto.MealRequirementsResponse;
import com.attendo.mos.entity.MealRequirement;
import com.attendo.mos.entity.User;
import com.attendo.mos.dto.UserType;
import com.attendo.mos.repo.MealRequirementRepository;
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
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MealRequirementServiceTest {

    @Mock
    private MealRequirementRepository mealRequirementRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private MealRequirementService mealRequirementService;

    private User testUser;
    private final UUID testUserId = UUID.fromString("11111111-1111-1111-1111-111111111111");

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(testUserId);
        testUser.setEmail("test@mos.test");
        testUser.setDisplayName("Test User");
        testUser.setUserType(UserType.ADMIN);
        testUser.setActive(true);
        testUser.setCreatedAt(OffsetDateTime.now());
    }

    @Test
    void setMealRequirements_ShouldSaveRequirementsAndReturnResponse() {
        // Given
        MealRequirementsRequest request = new MealRequirementsRequest(
            List.of("Vegetarisk", "Glutenfri", "Laktosfri")
        );

        when(userRepository.findById(testUserId))
            .thenReturn(Optional.of(testUser));
        when(mealRequirementRepository.saveAll(anyList()))
            .thenAnswer(invocation -> {
                List<MealRequirement> requirements = invocation.getArgument(0);
                // Set IDs for the saved requirements
                for (int i = 0; i < requirements.size(); i++) {
                    requirements.get(i).setId(UUID.randomUUID());
                    requirements.get(i).setCreatedAt(OffsetDateTime.now());
                }
                return requirements;
            });

        // When
        MealRequirementsResponse response = mealRequirementService.setMealRequirements(testUserId, request);

        // Then
        assertThat(response).isNotNull();
        assertThat(response.requirements()).hasSize(3);
        assertThat(response.requirements().get(0).requirement()).isEqualTo("Vegetarisk");
        assertThat(response.requirements().get(1).requirement()).isEqualTo("Glutenfri");
        assertThat(response.requirements().get(2).requirement()).isEqualTo("Laktosfri");

        verify(userRepository).findById(testUserId);
        verify(mealRequirementRepository).deleteByUserId(testUserId);
        verify(mealRequirementRepository).saveAll(anyList());
    }

    @Test
    void setMealRequirements_ShouldRemoveDuplicates() {
        // Given
        MealRequirementsRequest request = new MealRequirementsRequest(
            List.of("Vegetarisk", "Vegetarisk", "Glutenfri", "Vegetarisk", "Laktosfri")
        );

        when(userRepository.findById(testUserId))
            .thenReturn(Optional.of(testUser));
        when(mealRequirementRepository.saveAll(anyList()))
            .thenAnswer(invocation -> {
                List<MealRequirement> requirements = invocation.getArgument(0);
                // Should only have 3 unique requirements
                assertThat(requirements).hasSize(3);
                for (int i = 0; i < requirements.size(); i++) {
                    requirements.get(i).setId(UUID.randomUUID());
                    requirements.get(i).setCreatedAt(OffsetDateTime.now());
                }
                return requirements;
            });

        // When
        MealRequirementsResponse response = mealRequirementService.setMealRequirements(testUserId, request);

        // Then
        assertThat(response.requirements()).hasSize(3);
        verify(mealRequirementRepository).saveAll(anyList());
    }

    @Test
    void setMealRequirements_ShouldFilterOutNullAndEmptyRequirements() {
        // Given
        MealRequirementsRequest request = new MealRequirementsRequest(
            List.of("Vegetarisk", "", null, "   ", "Glutenfri", null)
        );

        when(userRepository.findById(testUserId))
            .thenReturn(Optional.of(testUser));
        when(mealRequirementRepository.saveAll(anyList()))
            .thenAnswer(invocation -> {
                List<MealRequirement> requirements = invocation.getArgument(0);
                // Should only have 2 valid requirements
                assertThat(requirements).hasSize(2);
                for (int i = 0; i < requirements.size(); i++) {
                    requirements.get(i).setId(UUID.randomUUID());
                    requirements.get(i).setCreatedAt(OffsetDateTime.now());
                }
                return requirements;
            });

        // When
        MealRequirementsResponse response = mealRequirementService.setMealRequirements(testUserId, request);

        // Then
        assertThat(response.requirements()).hasSize(2);
        verify(mealRequirementRepository).saveAll(anyList());
    }

    @Test
    void setMealRequirements_ShouldThrowExceptionWhenUserNotFound() {
        // Given
        MealRequirementsRequest request = new MealRequirementsRequest(
            List.of("Vegetarisk")
        );

        when(userRepository.findById(testUserId))
            .thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> mealRequirementService.setMealRequirements(testUserId, request))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessage("User not found");

        verify(userRepository).findById(testUserId);
        verify(mealRequirementRepository, never()).deleteByUserId(any());
        verify(mealRequirementRepository, never()).saveAll(anyList());
    }

    @Test
    void getMealRequirements_ShouldReturnRequirementsForUser() {
        // Given
        List<MealRequirement> existingRequirements = List.of(
            createMealRequirement("Vegetarisk"),
            createMealRequirement("Glutenfri")
        );

        when(mealRequirementRepository.findByUserId(testUserId))
            .thenReturn(existingRequirements);

        // When
        MealRequirementsResponse response = mealRequirementService.getMealRequirements(testUserId);

        // Then
        assertThat(response).isNotNull();
        assertThat(response.requirements()).hasSize(2);
        assertThat(response.requirements().get(0).requirement()).isEqualTo("Vegetarisk");
        assertThat(response.requirements().get(1).requirement()).isEqualTo("Glutenfri");

        verify(mealRequirementRepository).findByUserId(testUserId);
    }

    @Test
    void getMealRequirements_ShouldReturnEmptyListWhenNoRequirements() {
        // Given
        when(mealRequirementRepository.findByUserId(testUserId))
            .thenReturn(List.of());

        // When
        MealRequirementsResponse response = mealRequirementService.getMealRequirements(testUserId);

        // Then
        assertThat(response).isNotNull();
        assertThat(response.requirements()).isEmpty();

        verify(mealRequirementRepository).findByUserId(testUserId);
    }

    private MealRequirement createMealRequirement(String requirement) {
        MealRequirement mr = new MealRequirement();
        mr.setId(UUID.randomUUID());
        mr.setUser(testUser);
        mr.setType(com.attendo.mos.dto.MealRequirementType.OTHER);
        mr.setNotes(requirement);
        mr.setCreatedAt(OffsetDateTime.now());
        return mr;
    }
}
