package com.attendo.mos.service;

import com.attendo.mos.dto.Category;
import com.attendo.mos.dto.CreateReminderRequest;
import com.attendo.mos.dto.ReminderDto;
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
import java.time.ZoneOffset;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ReminderServiceTest {

    @Mock
    private ReminderRepository reminderRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private ReminderService reminderService;

    private User testUser;
    private UUID testUserId;

    @BeforeEach
    void setUp() {
        testUserId = UUID.fromString("11111111-1111-1111-1111-111111111111");
        testUser = new User();
        testUser.setId(testUserId);
        testUser.setEmail("test@example.com");
        testUser.setDisplayName("Test User");
    }

    @Test
    void addReminder_WithSwedishCategory_ShouldMapCorrectly() {
        // Given
        CreateReminderRequest request = new CreateReminderRequest(
            "once",
            "måltider", // Swedish for meals
            OffsetDateTime.now(ZoneOffset.UTC).plusHours(1),
            null,
            null,
            "Test meal reminder"
        );

        Reminder savedReminder = new Reminder();
        savedReminder.setUser(testUser);
        savedReminder.setCategory(Category.MEAL);
        savedReminder.setNote("Test meal reminder");
        savedReminder.setType("once");
        savedReminder.setTime(request.dateTime());
        savedReminder.setCreatedAt(OffsetDateTime.now(ZoneOffset.UTC));

        when(userRepository.findById(testUserId)).thenReturn(Optional.of(testUser));
        when(reminderRepository.save(any(Reminder.class))).thenReturn(savedReminder);

        // When
        ReminderDto result = reminderService.addReminder(testUserId, request);

        // Then
        assertNotNull(result);
        assertEquals(Category.MEAL, result.category());
        verify(reminderRepository).save(any(Reminder.class));
    }

    @Test
    void addReminder_WithEnglishCategory_ShouldMapCorrectly() {
        // Given
        CreateReminderRequest request = new CreateReminderRequest(
            "once",
            "medication", // English
            OffsetDateTime.now(ZoneOffset.UTC).plusHours(1),
            null,
            null,
            "Test medication reminder"
        );

        Reminder savedReminder = new Reminder();
        savedReminder.setUser(testUser);
        savedReminder.setCategory(Category.MEDICATION);
        savedReminder.setNote("Test medication reminder");
        savedReminder.setType("once");
        savedReminder.setTime(request.dateTime());
        savedReminder.setCreatedAt(OffsetDateTime.now(ZoneOffset.UTC));

        when(userRepository.findById(testUserId)).thenReturn(Optional.of(testUser));
        when(reminderRepository.save(any(Reminder.class))).thenReturn(savedReminder);

        // When
        ReminderDto result = reminderService.addReminder(testUserId, request);

        // Then
        assertNotNull(result);
        assertEquals(Category.MEDICATION, result.category());
        verify(reminderRepository).save(any(Reminder.class));
    }

    @Test
    void addReminder_WithUnknownCategory_ShouldDefaultToMeal() {
        // Given
        CreateReminderRequest request = new CreateReminderRequest(
            "once",
            "unknown_category", // Unknown category
            OffsetDateTime.now(ZoneOffset.UTC).plusHours(1),
            null,
            null,
            "Test reminder"
        );

        Reminder savedReminder = new Reminder();
        savedReminder.setUser(testUser);
        savedReminder.setCategory(Category.MEAL); // Should default to MEAL
        savedReminder.setNote("Test reminder");
        savedReminder.setType("once");
        savedReminder.setTime(request.dateTime());
        savedReminder.setCreatedAt(OffsetDateTime.now(ZoneOffset.UTC));

        when(userRepository.findById(testUserId)).thenReturn(Optional.of(testUser));
        when(reminderRepository.save(any(Reminder.class))).thenReturn(savedReminder);

        // When
        ReminderDto result = reminderService.addReminder(testUserId, request);

        // Then
        assertNotNull(result);
        assertEquals(Category.MEAL, result.category()); // Should default to MEAL
        verify(reminderRepository).save(any(Reminder.class));
    }

    @Test
    void addReminder_WithRecurringType_ShouldSetRecurrence() {
        // Given
        CreateReminderRequest request = new CreateReminderRequest(
            "recurring",
            "medicin", // Swedish for medication
            null,
            List.of("Mon", "Wed", "Fri"),
            List.of("08:00", "20:00"),
            "Recurring medication"
        );

        Reminder savedReminder = new Reminder();
        savedReminder.setUser(testUser);
        savedReminder.setCategory(Category.MEDICATION);
        savedReminder.setNote("Recurring medication");
        savedReminder.setType("recurring");
        savedReminder.setTime(null);
        savedReminder.setRecurrence(java.util.Map.of("days", List.of("Mon", "Wed", "Fri"), "times", List.of("08:00", "20:00")));
        savedReminder.setCreatedAt(OffsetDateTime.now(ZoneOffset.UTC));

        when(userRepository.findById(testUserId)).thenReturn(Optional.of(testUser));
        when(reminderRepository.save(any(Reminder.class))).thenReturn(savedReminder);

        // When
        ReminderDto result = reminderService.addReminder(testUserId, request);

        // Then
        assertNotNull(result);
        assertEquals("recurring", result.type());
        assertNull(result.time());
        assertNotNull(result.recurrence());
        assertEquals(List.of("Mon", "Wed", "Fri"), result.recurrence().get("days"));
        assertEquals(List.of("08:00", "20:00"), result.recurrence().get("times"));
        verify(reminderRepository).save(any(Reminder.class));
    }

    @Test
    void addReminder_WithNullType_ShouldDefaultToOnce() {
        // Given
        CreateReminderRequest request = new CreateReminderRequest(
            null, // null type
            "meal",
            OffsetDateTime.now(ZoneOffset.UTC).plusHours(1),
            null,
            null,
            "Test reminder"
        );

        Reminder savedReminder = new Reminder();
        savedReminder.setUser(testUser);
        savedReminder.setCategory(Category.MEAL);
        savedReminder.setNote("Test reminder");
        savedReminder.setType("once"); // Should default to "once"
        savedReminder.setTime(request.dateTime());
        savedReminder.setCreatedAt(OffsetDateTime.now(ZoneOffset.UTC));

        when(userRepository.findById(testUserId)).thenReturn(Optional.of(testUser));
        when(reminderRepository.save(any(Reminder.class))).thenReturn(savedReminder);

        // When
        ReminderDto result = reminderService.addReminder(testUserId, request);

        // Then
        assertNotNull(result);
        assertEquals("once", result.type());
        verify(reminderRepository).save(any(Reminder.class));
    }

    @Test
    void addReminder_WithOnceTypeButNoDateTime_ShouldThrowException() {
        // Given
        CreateReminderRequest request = new CreateReminderRequest(
            "once",
            "meal",
            null, // Missing dateTime for once type
            null,
            null,
            "Test reminder"
        );

        when(userRepository.findById(testUserId)).thenReturn(Optional.of(testUser));

        // When & Then
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
            reminderService.addReminder(testUserId, request);
        });

        assertEquals("dateTime required for type=once", exception.getMessage());
        verify(reminderRepository, never()).save(any(Reminder.class));
    }

    @Test
    void addReminder_WithUserNotFound_ShouldThrowException() {
        // Given
        CreateReminderRequest request = new CreateReminderRequest(
            "once",
            "meal",
            OffsetDateTime.now(ZoneOffset.UTC).plusHours(1),
            null,
            null,
            "Test reminder"
        );

        when(userRepository.findById(testUserId)).thenReturn(Optional.empty());

        // When & Then
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
            reminderService.addReminder(testUserId, request);
        });

        assertEquals("User not found", exception.getMessage());
        verify(reminderRepository, never()).save(any(Reminder.class));
    }
}
