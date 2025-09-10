package com.attendo.mos.controller;

import com.attendo.mos.dto.MealRequirementsRequest;
import com.attendo.mos.dto.MealRequirementsResponse;
import com.attendo.mos.entity.MealRequirement;
import com.attendo.mos.entity.User;
import com.attendo.mos.repo.MealRequirementRepository;
import com.attendo.mos.repo.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(controllers = MealRequirementController.class, excludeAutoConfiguration = {
    org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration.class
})
class MealRequirementControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private MealRequirementRepository mealRequirementRepository;

    @MockBean
    private UserRepository userRepository;

    @Autowired
    private ObjectMapper objectMapper;

    private final UUID testUserId = UUID.fromString("11111111-1111-1111-1111-111111111111");

    @Test
    void setMealRequirements_ShouldCreateNewRequirements() throws Exception {
        // Given
        User user = new User();
        user.setId(testUserId);
        
        MealRequirementsRequest request = new MealRequirementsRequest(
            List.of("Laktosfri", "Diabetesanpassad")
        );

        when(userRepository.findById(testUserId)).thenReturn(Optional.of(user));
        when(mealRequirementRepository.saveAll(any())).thenAnswer(invocation -> {
            List<MealRequirement> requirements = invocation.getArgument(0);
            requirements.forEach(req -> {
                req.setCreatedAt(OffsetDateTime.now());
            });
            return requirements;
        });

        // When & Then
        mockMvc.perform(post("/api/users/{userId}/meal-requirements", testUserId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.requirements").isArray())
                .andExpect(jsonPath("$.requirements.length()").value(2))
                .andExpect(jsonPath("$.requirements[0].requirement").value("Laktosfri"))
                .andExpect(jsonPath("$.requirements[1].requirement").value("Diabetesanpassad"));

        verify(mealRequirementRepository).deleteByUserId(testUserId);
        verify(mealRequirementRepository).saveAll(any());
    }

    @Test
    void setMealRequirements_ShouldReturn404WhenUserNotFound() throws Exception {
        // Given
        MealRequirementsRequest request = new MealRequirementsRequest(List.of("Laktosfri"));

        when(userRepository.findById(testUserId)).thenReturn(Optional.empty());

        // When & Then
        mockMvc.perform(post("/api/users/{userId}/meal-requirements", testUserId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());

        verify(mealRequirementRepository, never()).deleteByUserId(any());
        verify(mealRequirementRepository, never()).saveAll(any());
    }

    @Test
    void getMealRequirements_ShouldReturnExistingRequirements() throws Exception {
        // Given
        MealRequirement requirement1 = new MealRequirement();
        requirement1.setNotes("Laktosfri");
        requirement1.setCreatedAt(OffsetDateTime.now());

        MealRequirement requirement2 = new MealRequirement();
        requirement2.setNotes("Diabetesanpassad");
        requirement2.setCreatedAt(OffsetDateTime.now());

        when(mealRequirementRepository.findByUserId(testUserId))
            .thenReturn(List.of(requirement1, requirement2));

        // When & Then
        mockMvc.perform(get("/api/users/{userId}/meal-requirements", testUserId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.requirements").isArray())
                .andExpect(jsonPath("$.requirements.length()").value(2))
                .andExpect(jsonPath("$.requirements[0].requirement").value("Laktosfri"))
                .andExpect(jsonPath("$.requirements[1].requirement").value("Diabetesanpassad"));
    }

    @Test
    void getMealRequirements_ShouldReturnEmptyListWhenNoRequirements() throws Exception {
        // Given
        when(mealRequirementRepository.findByUserId(testUserId)).thenReturn(List.of());

        // When & Then
        mockMvc.perform(get("/api/users/{userId}/meal-requirements", testUserId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.requirements").isArray())
                .andExpect(jsonPath("$.requirements.length()").value(0));
    }
}
