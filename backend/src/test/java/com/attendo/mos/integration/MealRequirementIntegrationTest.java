package com.attendo.mos.integration;

import com.attendo.mos.dto.MealRequirementsRequest;
import com.attendo.mos.entity.User;
import com.attendo.mos.repo.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureWebMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureWebMvc
@ActiveProfiles("test")
@Transactional
class MealRequirementIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void fullMealRequirementsFlow_ShouldWorkEndToEnd() throws Exception {
        // Given - Create a test user
        User testUser = new User();
        testUser.setId(UUID.fromString("11111111-1111-1111-1111-111111111111"));
        testUser.setDisplayName("Test User");
        testUser.setEmail("test@example.com");
        testUser.setPasswordHash("dummy-hash");
        userRepository.save(testUser);

        MealRequirementsRequest request = new MealRequirementsRequest(
            List.of("Laktosfri", "Diabetesanpassad", "Glutenfri")
        );

        // When & Then - Set meal requirements
        mockMvc.perform(post("/api/users/{userId}/meal-requirements", testUser.getId())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.requirements").isArray())
                .andExpect(jsonPath("$.requirements.length()").value(3))
                .andExpect(jsonPath("$.requirements[0].requirement").value("Laktosfri"))
                .andExpect(jsonPath("$.requirements[1].requirement").value("Diabetesanpassad"))
                .andExpect(jsonPath("$.requirements[2].requirement").value("Glutenfri"));

        // When & Then - Get meal requirements
        mockMvc.perform(get("/api/users/{userId}/meal-requirements", testUser.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.requirements").isArray())
                .andExpect(jsonPath("$.requirements.length()").value(3));

        // When & Then - Update meal requirements (replace all)
        MealRequirementsRequest updateRequest = new MealRequirementsRequest(
            List.of("Vegetarisk", "Halal")
        );

        mockMvc.perform(post("/api/users/{userId}/meal-requirements", testUser.getId())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.requirements").isArray())
                .andExpect(jsonPath("$.requirements.length()").value(2))
                .andExpect(jsonPath("$.requirements[0].requirement").value("Vegetarisk"))
                .andExpect(jsonPath("$.requirements[1].requirement").value("Halal"));

        // Verify the old requirements are gone
        mockMvc.perform(get("/api/users/{userId}/meal-requirements", testUser.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.requirements").isArray())
                .andExpect(jsonPath("$.requirements.length()").value(2));
    }
}
