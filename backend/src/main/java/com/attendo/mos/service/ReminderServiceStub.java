package com.attendo.mos.service;

import java.time.OffsetDateTime;

import org.springframework.stereotype.Service;

import com.attendo.mos.dto.CreateReminderRequest;
import com.attendo.mos.dto.ReminderDto;

/**
 * Stub implementation of the {@link ReminderService} interface.
 * This service provides a basic in-memory implementation for creating
 * reminders,
 * primarily intended for testing or prototyping purposes.
 */
@Service
public class ReminderServiceStub implements ReminderService {

    /**
     * Creates a new reminder based on the provided request.
     * <p>
     * The method checks if the requested reminder time is not more than 5 minutes
     * in the past.
     * If the time is too far in the past, an {@link IllegalArgumentException} is
     * thrown.
     * Otherwise, a new {@link ReminderDto} is created with a generated UUID and the
     * current timestamp.
     *
     * @param req the request object containing reminder details
     * @return a new {@link ReminderDto} representing the created reminder
     * @throws IllegalArgumentException if the requested time is more than 5 minutes
     *                                  in the past
     */
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