package com.attendo.mos.service;

import java.time.OffsetDateTime;

import org.springframework.stereotype.Service;

import com.attendo.mos.dto.CreateReminderRequest;
import com.attendo.mos.dto.ReminderDto;

@Service
public class ReminderServiceStub implements ReminderService {
    @Override
    public ReminderDto create(CreateReminderRequest req) {
        var now = OffsetDateTime.now();
        // (Optional) basic guard: reject times too far in past
        if (req.time().isBefore(now.minusMinutes(5))) {
            throw new IllegalArgumentException("time must be now or future (±5m)");
        }
        return new ReminderDto(
                java.util.UUID.randomUUID(),
                req.time(),
                req.category(),
                req.note(),
                now);
    }
}