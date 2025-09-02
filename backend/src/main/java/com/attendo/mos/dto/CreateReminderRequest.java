package com.attendo.mos.dto;

import java.time.OffsetDateTime;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CreateReminderRequest(
        @NotNull OffsetDateTime time,
        @NotNull Category category,
        @Size(max = 280) String note) {
}
