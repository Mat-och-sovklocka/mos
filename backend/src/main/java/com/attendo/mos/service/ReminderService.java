package com.attendo.mos.service;

import com.attendo.mos.dto.CreateReminderRequest;
import com.attendo.mos.dto.ReminderDto;

public interface ReminderService {
    ReminderDto create(CreateReminderRequest req);
}
