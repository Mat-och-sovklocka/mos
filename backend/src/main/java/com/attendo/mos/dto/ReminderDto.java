package com.attendo.mos.dto;

import java.time.OffsetDateTime;
import java.util.Map;
import java.util.UUID;

public record ReminderDto(
  UUID id, OffsetDateTime time, Category category, String note,
  OffsetDateTime createdAt, String type, Map<String,Object> recurrence
) {}
