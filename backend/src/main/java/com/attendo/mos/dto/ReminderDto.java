package com.attendo.mos.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * Data Transfer Object (DTO) representing a reminder.
 * 
 * @param id        Unique identifier for the reminder.
 * @param time      The scheduled time for the reminder.
 * @param category  The category to which the reminder belongs.
 * @param note      Additional notes or description for the reminder.
 * @param createdAt The timestamp when the reminder was created.
 */
public record ReminderDto(
                UUID id,
                OffsetDateTime time,
                Category category,
                String note,
                OffsetDateTime createdAt) {
}