package com.attendo.mos.dto;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

// dto/ReminderResponse.java
public record ReminderResponse(
        UUID id,
        String type, // "once" | "recurring"
        String category, // keep as string for FE
        String note,
        OffsetDateTime dateTime, // set when type=once
        List<String> days, // set when type=recurring
        List<String> times, // set when type=recurring
        OffsetDateTime createdAt) {
}
