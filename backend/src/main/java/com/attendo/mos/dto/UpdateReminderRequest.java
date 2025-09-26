package com.attendo.mos.dto;

import java.time.OffsetDateTime;
import java.util.List;

public record UpdateReminderRequest(
        String type, // "once" | "recurring" - optional for updates
        String category, // e.g. "måltider", "medicin", "medication", "meal" - optional
        OffsetDateTime dateTime, // present when type=once - optional
        List<String> days, // ["Ons","Tor"] when type=recurring - optional
        List<String> times, // ["11:11"] when type=recurring - optional
        String note) { // optional
}
