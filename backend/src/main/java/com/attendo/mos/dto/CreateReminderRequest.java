package com.attendo.mos.dto;

import java.time.OffsetDateTime;
import java.util.List;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;


public record CreateReminderRequest(
        String type, // "once" | "recurring"
        String category, // e.g. "Meals"
        OffsetDateTime dateTime, // present when type=once
        List<String> days, // ["Ons","Tor"] when type=recurring
        List<String> times, // ["11:11"] when type=recurring
        String note) {
}
