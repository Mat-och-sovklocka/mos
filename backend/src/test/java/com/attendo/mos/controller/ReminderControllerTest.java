package com.attendo.mos.controller;

import com.attendo.mos.dto.Category;
import com.attendo.mos.dto.CreateReminderRequest;
import com.attendo.mos.dto.ReminderDto;
import com.attendo.mos.entity.Reminder;
import com.attendo.mos.entity.User;
import com.attendo.mos.repo.ReminderRepository;
import com.attendo.mos.repo.UserRepository;
import com.attendo.mos.service.ReminderService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(controllers = ReminderController.class, excludeAutoConfiguration = {
    org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration.class
})
@ActiveProfiles("test")
class ReminderControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ReminderService reminderService;

    @Autowired
    private ObjectMapper objectMapper;

    private final UUID testUserId = UUID.fromString("11111111-1111-1111-1111-111111111111");
    private final UUID testReminderId = UUID.fromString("22222222-2222-2222-2222-222222222222");

    @Test
    void createReminder_ShouldReturnCreatedReminder() throws Exception {
        // Given
        CreateReminderRequest request = new CreateReminderRequest(
            "once",
            "meal",
            OffsetDateTime.now(ZoneOffset.UTC).plusHours(1),
            null,
            null,
            "Test reminder"
        );

        ReminderDto expectedResponse = new ReminderDto(
            testReminderId,
            request.dateTime(),
            Category.MEAL,
            "Test reminder",
            OffsetDateTime.now(ZoneOffset.UTC),
            "once",
            null
        );

        when(reminderService.addReminder(testUserId, request)).thenReturn(expectedResponse);

        // When & Then
        mockMvc.perform(post("/api/users/{userId}/reminders", testUserId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(testReminderId.toString()))
                .andExpect(jsonPath("$.category").value("MEAL"))
                .andExpect(jsonPath("$.note").value("Test reminder"))
                .andExpect(jsonPath("$.type").value("once"));

        verify(reminderService).addReminder(testUserId, request);
    }

    @Test
    void createReminder_ShouldReturnBadRequestWhenValidationFails() throws Exception {
        // Given - missing required fields
        CreateReminderRequest request = new CreateReminderRequest(
            null, // missing type
            null, // missing category
            null,
            null,
            null,
            "Test reminder"
        );

        // When & Then
        mockMvc.perform(post("/api/users/{userId}/reminders", testUserId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void createReminder_ShouldReturnBadRequestWhenServiceThrowsException() throws Exception {
        // Given
        CreateReminderRequest request = new CreateReminderRequest(
            "once",
            "meal",
            null, // missing dateTime for once type
            null,
            null,
            "Test reminder"
        );

        when(reminderService.addReminder(testUserId, request))
            .thenThrow(new IllegalArgumentException("dateTime required for type=once"));

        // When & Then
        mockMvc.perform(post("/api/users/{userId}/reminders", testUserId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Bad Request"))
                .andExpect(jsonPath("$.message").value("dateTime required for type=once"));

        verify(reminderService).addReminder(testUserId, request);
    }

    @Test
    void createRecurringReminder_ShouldReturnCreatedReminder() throws Exception {
        // Given
        CreateReminderRequest request = new CreateReminderRequest(
            "recurring",
            "medication",
            null,
            List.of("Mon", "Wed", "Fri"),
            List.of("08:00", "20:00"),
            "Medication reminder"
        );

        ReminderDto expectedResponse = new ReminderDto(
            testReminderId,
            null,
            Category.MEDICATION,
            "Medication reminder",
            OffsetDateTime.now(ZoneOffset.UTC),
            "recurring",
            java.util.Map.of("days", List.of("Mon", "Wed", "Fri"), "times", List.of("08:00", "20:00"))
        );

        when(reminderService.addReminder(testUserId, request)).thenReturn(expectedResponse);

        // When & Then
        mockMvc.perform(post("/api/users/{userId}/reminders", testUserId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(testReminderId.toString()))
                .andExpect(jsonPath("$.category").value("MEDICATION"))
                .andExpect(jsonPath("$.note").value("Medication reminder"))
                .andExpect(jsonPath("$.type").value("recurring"))
                .andExpect(jsonPath("$.recurrence.days").isArray())
                .andExpect(jsonPath("$.recurrence.times").isArray());

        verify(reminderService).addReminder(testUserId, request);
    }

    @Test
    void deleteReminder_ShouldReturnNoContent() throws Exception {
        // Given
        doNothing().when(reminderService).deleteReminder(testUserId, testReminderId);

        // When & Then
        mockMvc.perform(delete("/api/users/{userId}/reminders/{reminderId}", testUserId, testReminderId))
                .andExpect(status().isNoContent());

        verify(reminderService).deleteReminder(testUserId, testReminderId);
    }

    @Test
    void deleteReminder_ShouldReturnBadRequestWhenServiceThrowsException() throws Exception {
        // Given
        doThrow(new IllegalArgumentException("Reminder not found for user " + testUserId))
            .when(reminderService).deleteReminder(testUserId, testReminderId);

        // When & Then
        mockMvc.perform(delete("/api/users/{userId}/reminders/{reminderId}", testUserId, testReminderId))
                .andExpect(status().isBadRequest());

        verify(reminderService).deleteReminder(testUserId, testReminderId);
    }
}
