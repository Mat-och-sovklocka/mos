package com.attendo.mos.controller;

import com.attendo.mos.dto.MealRequirementsRequest;
import com.attendo.mos.dto.MealRequirementsResponse;
import com.attendo.mos.service.MealRequirementService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(controllers = MealRequirementController.class, excludeAutoConfiguration = {
    org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration.class
})
@ActiveProfiles("test")
class MealRequirementControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private MealRequirementService mealRequirementService;

    @Autowired
    private ObjectMapper objectMapper;

    private final UUID testUserId = UUID.fromString("11111111-1111-1111-1111-111111111111");

    @Test
    void setMealRequirements_ShouldReturn201WhenSuccessful() throws Exception {
        // Given
        MealRequirementsRequest request = new MealRequirementsRequest(
            List.of("Vegetarisk", "Glutenfri", "Laktosfri")
        );
        
        MealRequirementsResponse response = new MealRequirementsResponse(
            List.of(
                new MealRequirementsResponse.MealRequirementDto(
                    UUID.randomUUID(),
                    "Vegetarisk",
                    OffsetDateTime.now()
                ),
                new MealRequirementsResponse.MealRequirementDto(
                    UUID.randomUUID(),
                    "Glutenfri",
                    OffsetDateTime.now()
                ),
                new MealRequirementsResponse.MealRequirementDto(
                    UUID.randomUUID(),
                    "Laktosfri",
                    OffsetDateTime.now()
                )
            )
        );

        when(mealRequirementService.setMealRequirements(testUserId, request))
            .thenReturn(response);

        // When & Then
        mockMvc.perform(post("/api/users/{userId}/meal-requirements", testUserId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.requirements").isArray())
                .andExpect(jsonPath("$.requirements.length()").value(3))
                .andExpect(jsonPath("$.requirements[0].requirement").value("Vegetarisk"))
                .andExpect(jsonPath("$.requirements[1].requirement").value("Glutenfri"))
                .andExpect(jsonPath("$.requirements[2].requirement").value("Laktosfri"));

        verify(mealRequirementService).setMealRequirements(testUserId, request);
    }

    @Test
    void setMealRequirements_ShouldRemoveDuplicates() throws Exception {
        // Given
        MealRequirementsRequest request = new MealRequirementsRequest(
            List.of("Vegetarisk", "Vegetarisk", "Glutenfri", "Vegetarisk")
        );
        
        MealRequirementsResponse response = new MealRequirementsResponse(
            List.of(
                new MealRequirementsResponse.MealRequirementDto(
                    UUID.randomUUID(),
                    "Vegetarisk",
                    OffsetDateTime.now()
                ),
                new MealRequirementsResponse.MealRequirementDto(
                    UUID.randomUUID(),
                    "Glutenfri",
                    OffsetDateTime.now()
                )
            )
        );

        when(mealRequirementService.setMealRequirements(testUserId, request))
            .thenReturn(response);

        // When & Then
        mockMvc.perform(post("/api/users/{userId}/meal-requirements", testUserId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.requirements.length()").value(2));

        verify(mealRequirementService).setMealRequirements(testUserId, request);
    }

    @Test
    void setMealRequirements_ShouldReturn400WhenUserNotFound() throws Exception {
        // Given
        MealRequirementsRequest request = new MealRequirementsRequest(
            List.of("Vegetarisk")
        );

        when(mealRequirementService.setMealRequirements(testUserId, request))
            .thenThrow(new IllegalArgumentException("User not found"));

        // When & Then
        mockMvc.perform(post("/api/users/{userId}/meal-requirements", testUserId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());

        verify(mealRequirementService).setMealRequirements(testUserId, request);
    }

    @Test
    void getMealRequirements_ShouldReturn200WithRequirements() throws Exception {
        // Given
        MealRequirementsResponse response = new MealRequirementsResponse(
            List.of(
                new MealRequirementsResponse.MealRequirementDto(
                    UUID.randomUUID(),
                    "Vegetarisk",
                    OffsetDateTime.now()
                ),
                new MealRequirementsResponse.MealRequirementDto(
                    UUID.randomUUID(),
                    "Glutenfri",
                    OffsetDateTime.now()
                )
            )
        );

        when(mealRequirementService.getMealRequirements(testUserId))
            .thenReturn(response);

        // When & Then
        mockMvc.perform(get("/api/users/{userId}/meal-requirements", testUserId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.requirements").isArray())
                .andExpect(jsonPath("$.requirements.length()").value(2))
                .andExpect(jsonPath("$.requirements[0].requirement").value("Vegetarisk"))
                .andExpect(jsonPath("$.requirements[1].requirement").value("Glutenfri"));

        verify(mealRequirementService).getMealRequirements(testUserId);
    }

    @Test
    void getMealRequirements_ShouldReturnEmptyListWhenNoRequirements() throws Exception {
        // Given
        MealRequirementsResponse response = new MealRequirementsResponse(List.of());

        when(mealRequirementService.getMealRequirements(testUserId))
            .thenReturn(response);

        // When & Then
        mockMvc.perform(get("/api/users/{userId}/meal-requirements", testUserId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.requirements").isArray())
                .andExpect(jsonPath("$.requirements.length()").value(0));

        verify(mealRequirementService).getMealRequirements(testUserId);
    }

    @Test
    void getMealRequirements_ShouldReturn400WhenUserNotFound() throws Exception {
        // Given
        when(mealRequirementService.getMealRequirements(testUserId))
            .thenThrow(new IllegalArgumentException("User not found"));

        // When & Then
        mockMvc.perform(get("/api/users/{userId}/meal-requirements", testUserId))
                .andExpect(status().isBadRequest());

        verify(mealRequirementService).getMealRequirements(testUserId);
    }
}