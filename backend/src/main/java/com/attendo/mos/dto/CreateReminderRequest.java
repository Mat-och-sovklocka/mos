package com.attendo.mos.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.OffsetDateTime;
import java.util.List;

public record CreateReminderRequest(
        @NotBlank(message = "Type is required") String type, // "once" | "recurring"
        @NotBlank(message = "Category is required") String category, // e.g. "meal", "medication", "clean", "sleep"
        OffsetDateTime dateTime, // present when type=once
        List<String> days, // ["Ons","Tor"] when type=recurring
        List<String> times, // ["11:11"] when type=recurring
        String note) {
}
