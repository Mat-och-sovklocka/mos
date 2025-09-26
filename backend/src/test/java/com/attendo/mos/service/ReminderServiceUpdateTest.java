package com.attendo.mos.service;

import com.attendo.mos.dto.Category;
import com.attendo.mos.dto.ReminderDto;
import com.attendo.mos.dto.UpdateReminderRequest;
import com.attendo.mos.entity.Reminder;
import com.attendo.mos.entity.User;
import com.attendo.mos.repo.ReminderRepository;
import com.attendo.mos.repo.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ReminderServiceUpdateTest {

    @Mock
    private ReminderRepository reminderRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private ReminderService reminderService;

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
        testReminder.setCreatedAt(OffsetDateTime.now());
    }

    private Reminder createReminderWithId(UUID id, User user, String type, Category category, String note, OffsetDateTime time) {
        Reminder reminder = new Reminder();
        reminder.setUser(user);
        reminder.setType(type);
        reminder.setCategory(category);
        reminder.setNote(note);
        reminder.setTime(time);
        reminder.setCreatedAt(OffsetDateTime.now());
        
        // Set the ID using reflection since there's no setter
        try {
            java.lang.reflect.Field idField = Reminder.class.getDeclaredField("id");
            idField.setAccessible(true);
            idField.set(reminder, id);
        } catch (Exception e) {
            throw new RuntimeException("Failed to set reminder ID", e);
        }
        
        return reminder;
    }

    @Test
    void updateReminder_ShouldUpdateAllFields_WhenAllFieldsProvided() {
        // Arrange
        UpdateReminderRequest request = new UpdateReminderRequest(
            "once",
            "medicin",
            OffsetDateTime.now().plusHours(2),
            null,
            null,
            "Updated note"
        );

        when(reminderRepository.findById(reminderId)).thenReturn(Optional.of(testReminder));
        
        // Create a saved reminder with the ID set
        Reminder savedReminder = createReminderWithId(
            reminderId, testUser, "once", Category.MEDICATION, "Updated note", request.dateTime()
        );
        savedReminder.setCreatedAt(testReminder.getCreatedAt());
        
        when(reminderRepository.save(any(Reminder.class))).thenReturn(savedReminder);

        // Act
        ReminderDto result = reminderService.updateReminder(userId, reminderId, request);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.id()).isEqualTo(reminderId);
        assertThat(result.category()).isEqualTo(Category.MEDICATION);
        assertThat(result.note()).isEqualTo("Updated note");
        assertThat(result.type()).isEqualTo("once");
        
        verify(reminderRepository).save(any(Reminder.class));
    }

    @Test
    void updateReminder_ShouldAllowPartialUpdate_WhenOnlySomeFieldsProvided() {
        // Arrange - only update note
        UpdateReminderRequest request = new UpdateReminderRequest(
            null,
            null,
            null,
            null,
            null,
            "Only note updated"
        );

        when(reminderRepository.findById(reminderId)).thenReturn(Optional.of(testReminder));
        
        // Create a saved reminder with the ID set
        Reminder savedReminder = createReminderWithId(
            reminderId, testUser, "once", Category.MEAL, "Only note updated", testReminder.getTime()
        );
        savedReminder.setCreatedAt(testReminder.getCreatedAt());
        
        when(reminderRepository.save(any(Reminder.class))).thenReturn(savedReminder);

        // Act
        ReminderDto result = reminderService.updateReminder(userId, reminderId, request);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.id()).isEqualTo(reminderId);
        assertThat(result.note()).isEqualTo("Only note updated");
        assertThat(result.category()).isEqualTo(Category.MEAL); // unchanged
        assertThat(result.type()).isEqualTo("once"); // unchanged
        
        verify(reminderRepository).save(any(Reminder.class));
    }

    @Test
    void updateReminder_ShouldHandleRecurringReminder_WhenTypeIsRecurring() {
        // Arrange
        UpdateReminderRequest request = new UpdateReminderRequest(
            "recurring",
            "medicin",
            null,
            List.of("Mon", "Wed", "Fri"),
            List.of("09:00", "15:00"),
            "Recurring medication reminder"
        );

        when(reminderRepository.findById(reminderId)).thenReturn(Optional.of(testReminder));
        
        // Create a saved reminder with the ID set
        Reminder savedReminder = createReminderWithId(
            reminderId, testUser, "recurring", Category.MEDICATION, "Recurring medication reminder", null
        );
        savedReminder.setCreatedAt(testReminder.getCreatedAt());
        Map<String, Object> recurrence = Map.of(
            "days", request.days(),
            "times", request.times()
        );
        savedReminder.setRecurrence(recurrence);
        
        when(reminderRepository.save(any(Reminder.class))).thenReturn(savedReminder);

        // Act
        ReminderDto result = reminderService.updateReminder(userId, reminderId, request);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.id()).isEqualTo(reminderId);
        assertThat(result.type()).isEqualTo("recurring");
        assertThat(result.category()).isEqualTo(Category.MEDICATION);
        assertThat(result.note()).isEqualTo("Recurring medication reminder");
        assertThat(result.time()).isNull(); // should be null for recurring
        assertThat(result.recurrence()).isNotNull();
        
        verify(reminderRepository).save(any(Reminder.class));
    }

    @Test
    void updateReminder_ShouldThrowException_WhenReminderNotFound() {
        // Arrange
        UpdateReminderRequest request = new UpdateReminderRequest(
            "once",
            "medicin",
            OffsetDateTime.now().plusHours(2),
            null,
            null,
            "Updated note"
        );

        when(reminderRepository.findById(reminderId)).thenReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() -> reminderService.updateReminder(userId, reminderId, request))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessage("Reminder not found for user " + userId);
    }

    @Test
    void updateReminder_ShouldThrowException_WhenReminderBelongsToDifferentUser() {
        // Arrange
        UUID differentUserId = UUID.randomUUID();
        UpdateReminderRequest request = new UpdateReminderRequest(
            "once",
            "medicin",
            OffsetDateTime.now().plusHours(2),
            null,
            null,
            "Updated note"
        );

        when(reminderRepository.findById(reminderId)).thenReturn(Optional.of(testReminder));

        // Act & Assert
        assertThatThrownBy(() -> reminderService.updateReminder(differentUserId, reminderId, request))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessage("Reminder not found for user " + differentUserId);
    }

    @Test
    void updateReminder_ShouldPreserveExistingRecurrence_WhenUpdatingOtherFields() {
        // Arrange - existing recurring reminder
        testReminder.setType("recurring");
        testReminder.setTime(null);
        Map<String, Object> existingRecurrence = Map.of(
            "days", List.of("Mon", "Wed"),
            "times", List.of("09:00")
        );
        testReminder.setRecurrence(existingRecurrence);

        // Update only note and category
        UpdateReminderRequest request = new UpdateReminderRequest(
            null,
            "medicin",
            null,
            null,
            null,
            "Updated note"
        );

        when(reminderRepository.findById(reminderId)).thenReturn(Optional.of(testReminder));
        
        // Create a saved reminder with the ID set
        Reminder savedReminder = createReminderWithId(
            reminderId, testUser, "recurring", Category.MEDICATION, "Updated note", null
        );
        savedReminder.setCreatedAt(testReminder.getCreatedAt());
        savedReminder.setRecurrence(existingRecurrence);
        
        when(reminderRepository.save(any(Reminder.class))).thenReturn(savedReminder);

        // Act
        ReminderDto result = reminderService.updateReminder(userId, reminderId, request);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.note()).isEqualTo("Updated note");
        assertThat(result.category()).isEqualTo(Category.MEDICATION);
        assertThat(result.type()).isEqualTo("recurring"); // unchanged
        assertThat(result.recurrence()).isNotNull(); // should preserve existing recurrence
        
        verify(reminderRepository).save(any(Reminder.class));
    }
}
