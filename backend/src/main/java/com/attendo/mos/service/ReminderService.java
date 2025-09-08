package com.attendo.mos.service;

import com.attendo.mos.dto.CreateReminderRequest;
import com.attendo.mos.dto.ReminderDto;
import com.attendo.mos.entity.Reminder;
import com.attendo.mos.entity.User;
import com.attendo.mos.repo.ReminderRepository;
import com.attendo.mos.repo.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class ReminderService {
  private final ReminderRepository reminders;
  private final UserRepository users;

  public ReminderService(ReminderRepository reminders, UserRepository users) {
    this.reminders = reminders; this.users = users;
  }

  public ReminderDto addReminder(UUID userId, CreateReminderRequest req) {
    User user = users.findById(userId)
        .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));

    Reminder r = new Reminder();
    r.setUser(user);
    r.setTime(req.time());
    r.setCategory(req.category());
    r.setNote(req.note());

    r = reminders.save(r);
    return new ReminderDto(r.getId(), r.getTime(), r.getCategory(), r.getNote(), r.getCreatedAt());
  }

  // ReminderService.java
  public List<ReminderDto> getReminders(UUID userId) {
    return reminders.findByUser_IdOrderByTimeAsc(userId).stream()
        .map(r -> new ReminderDto(
            r.getId(),
            r.getTime(),
            r.getCategory(),
            r.getNote(),
            r.getCreatedAt()))
        .toList();
  }

}
