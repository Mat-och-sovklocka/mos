package com.attendo.mos.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

public record ReminderDto(
        UUID id,
        OffsetDateTime time,
        Category category,
        String note,
        OffsetDateTime createdAt) {
}