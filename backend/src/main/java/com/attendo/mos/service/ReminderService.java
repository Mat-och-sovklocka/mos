package com.attendo.mos.service;

import com.attendo.mos.dto.CreateReminderRequest;
import com.attendo.mos.dto.ReminderDto;

public interface ReminderService {
    /**
     * Creates a new reminder based on the provided request data.
     *
     * @param req the request object containing the details for the new reminder
     * @return a ReminderDto representing the created reminder
     */
    ReminderDto create(CreateReminderRequest req);
}
