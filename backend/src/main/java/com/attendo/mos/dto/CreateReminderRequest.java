package com.attendo.mos.dto;

import java.time.OffsetDateTime;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * Represents a request to create a new reminder.
 *
 * @param time     The date and time when the reminder should trigger. Must not
 *                 be null.
 * @param category The category of the reminder. Must not be null.
 * @param note     An optional note for the reminder, with a maximum length of
 *                 280 characters.
 */
public record CreateReminderRequest(
                @NotNull OffsetDateTime time,
                @NotNull Category category,
                @Size(max = 280) String note) {
}
