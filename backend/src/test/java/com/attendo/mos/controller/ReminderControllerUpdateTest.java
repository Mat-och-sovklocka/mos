package com.attendo.mos.controller;

import com.attendo.mos.dto.Category;
import com.attendo.mos.dto.ReminderDto;
import com.attendo.mos.dto.UpdateReminderRequest;
import com.attendo.mos.entity.Reminder;
import com.attendo.mos.entity.User;
import com.attendo.mos.repo.ReminderRepository;
import com.attendo.mos.repo.UserRepository;
import com.attendo.mos.service.ReminderService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ReminderController.class)
@ActiveProfiles("test")
class ReminderControllerUpdateTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ReminderService reminderService;

    @MockBean
    private ReminderRepository reminderRepository;

    @MockBean
    private UserRepository userRepository;

    @Autowired
    private ObjectMapper objectMapper;

    private UUID userId;
    private UUID reminderId;
    private User testUser;
    private Reminder testReminder;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        reminderId = UUID.randomUUID();
        
        testUser = new User();
        testUser.setId(userId);
        testUser.setEmail("test@example.com");
        testUser.setUserType(com.attendo.mos.dto.UserType.RESIDENT);
        testUser.setActive(true);

        testReminder = new Reminder();
        testReminder.setUser(testUser);
        testReminder.setType("once");
        testReminder.setCategory(Category.MEAL);
        testReminder.setNote("Original note");
        testReminder.setTime(OffsetDateTime.now().plusHours(1));
    }

    @Test
    void updateReminder_ShouldReturnUpdatedReminder_WhenValidRequest() throws Exception {
        // Arrange
        UpdateReminderRequest request = new UpdateReminderRequest(
            "once",
            "medicin",
            OffsetDateTime.now().plusHours(2),
            null,
            null,
            "Updated note"
        );

        ReminderDto expectedDto = new ReminderDto(
            reminderId,
            request.dateTime(),
            Category.MEDICATION,
            request.note(),
            testReminder.getCreatedAt(),
            request.type(),
            null
        );

        when(reminderService.updateReminder(eq(userId), eq(reminderId), any(UpdateReminderRequest.class)))
            .thenReturn(expectedDto);

        // Act & Assert
        mockMvc.perform(put("/api/users/{userId}/reminders/{reminderId}", userId, reminderId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(reminderId.toString()))
                .andExpect(jsonPath("$.category").value("MEDICATION"))
                .andExpect(jsonPath("$.note").value("Updated note"))
                .andExpect(jsonPath("$.type").value("once"));
    }

    @Test
    void updateReminder_ShouldReturnBadRequest_WhenReminderNotFound() throws Exception {
        // Arrange
        UpdateReminderRequest request = new UpdateReminderRequest(
            "once",
            "medicin",
            OffsetDateTime.now().plusHours(2),
            null,
            null,
            "Updated note"
        );

        when(reminderService.updateReminder(eq(userId), eq(reminderId), any(UpdateReminderRequest.class)))
            .thenThrow(new IllegalArgumentException("Reminder not found for user " + userId));

        // Act & Assert
        mockMvc.perform(put("/api/users/{userId}/reminders/{reminderId}", userId, reminderId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Bad Request"))
                .andExpect(jsonPath("$.message").value("Reminder not found for user " + userId));
    }

    @Test
    void updateReminder_ShouldAllowPartialUpdate_WhenOnlySomeFieldsProvided() throws Exception {
        // Arrange - only update note
        UpdateReminderRequest request = new UpdateReminderRequest(
            null,
            null,
            null,
            null,
            null,
            "Only note updated"
        );

        ReminderDto expectedDto = new ReminderDto(
            reminderId,
            testReminder.getTime(),
            testReminder.getCategory(),
            request.note(),
            testReminder.getCreatedAt(),
            testReminder.getType(),
            null
        );

        when(reminderService.updateReminder(eq(userId), eq(reminderId), any(UpdateReminderRequest.class)))
            .thenReturn(expectedDto);

        // Act & Assert
        mockMvc.perform(put("/api/users/{userId}/reminders/{reminderId}", userId, reminderId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(reminderId.toString()))
                .andExpect(jsonPath("$.note").value("Only note updated"))
                .andExpect(jsonPath("$.category").value("MEAL")); // unchanged
    }

    @Test
    void updateReminder_ShouldHandleRecurringReminder_WhenTypeIsRecurring() throws Exception {
        // Arrange
        UpdateReminderRequest request = new UpdateReminderRequest(
            "recurring",
            "medicin",
            null,
            List.of("Mon", "Wed", "Fri"),
            List.of("09:00", "15:00"),
            "Recurring medication reminder"
        );

        Map<String, Object> recurrence = Map.of(
            "days", request.days(),
            "times", request.times()
        );

        ReminderDto expectedDto = new ReminderDto(
            reminderId,
            null,
            Category.MEDICATION,
            request.note(),
            testReminder.getCreatedAt(),
            request.type(),
            recurrence
        );

        when(reminderService.updateReminder(eq(userId), eq(reminderId), any(UpdateReminderRequest.class)))
            .thenReturn(expectedDto);

        // Act & Assert
        mockMvc.perform(put("/api/users/{userId}/reminders/{reminderId}", userId, reminderId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(reminderId.toString()))
                .andExpect(jsonPath("$.type").value("recurring"))
                .andExpect(jsonPath("$.category").value("MEDICATION"))
                .andExpect(jsonPath("$.note").value("Recurring medication reminder"))
                .andExpect(jsonPath("$.recurrence.days").isArray())
                .andExpect(jsonPath("$.recurrence.times").isArray());
    }
}
