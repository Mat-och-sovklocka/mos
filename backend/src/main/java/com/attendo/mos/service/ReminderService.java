package com.attendo.mos.service;

import com.attendo.mos.dto.Category;
import com.attendo.mos.dto.CreateReminderRequest;
import com.attendo.mos.dto.ReminderDto;
import com.attendo.mos.dto.ReminderResponse;
import com.attendo.mos.entity.Reminder;
import com.attendo.mos.repo.ReminderRepository;
import com.attendo.mos.repo.UserRepository;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
public class ReminderService {
  private final ReminderRepository reminders;
  private final UserRepository users;
  private static final Map<String, Category> CATEGORY_MAP = Map.of(
      "måltider", Category.MEAL,
      "maltdier", Category.MEAL, // sloppy fallback if accents drop
      "medicin", Category.MEDICATION,
      "medication", Category.MEDICATION);
      
  private Category mapCategory(String raw) {
    if (raw == null)
      throw new IllegalArgumentException("category is required");
    var key = raw.toLowerCase(Locale.ROOT);
    return CATEGORY_MAP.getOrDefault(key, Category.MEAL); // default if needed
  }

  public ReminderService(ReminderRepository reminders, UserRepository users) {
    this.reminders = reminders; this.users = users;
  }

  public ReminderDto addReminder(UUID userId, CreateReminderRequest req) {
    var user = users.findById(userId).orElseThrow(() -> new IllegalArgumentException("User not found"));

    var r = new Reminder();
    r.setUser(user);
    r.setCategory(mapCategory(req.category()));
    r.setNote(req.note());
    r.setType(req.type() == null ? "once" : req.type());

    if ("once".equalsIgnoreCase(r.getType())) {
      if (req.dateTime() == null)
        throw new IllegalArgumentException("dateTime required for type=once");
      r.setTime(req.dateTime());
      r.setRecurrence(null);
    } else {
      // store the rule as-is; keep time null
      r.setTime(null);
      Map<String, Object> rec = new HashMap<>();
      rec.put("days", Optional.ofNullable(req.days()).orElse(List.of()));
      rec.put("times", Optional.ofNullable(req.times()).orElse(List.of()));
      r.setRecurrence(rec);
    }

    r = reminders.save(r);
    return new ReminderDto(r.getId(), r.getTime(), r.getCategory(), r.getNote(),
        r.getCreatedAt(), r.getType(), r.getRecurrence());
  }

  // ReminderService.java
  public List<ReminderResponse> getReminders(UUID userId) {
    return reminders.listForUser(userId).stream().map(r -> {
      List<String> days = null, times = null;
      if ("recurring".equalsIgnoreCase(r.getType()) && r.getRecurrence() != null) {
        days = (List<String>) r.getRecurrence().getOrDefault("days", List.of());
        times = (List<String>) r.getRecurrence().getOrDefault("times", List.of());
      }
      return new ReminderResponse(
          r.getId(),
          r.getType(),
          r.getCategory().name(), // or keep your mapping if you localize
          r.getNote(),
          "once".equalsIgnoreCase(r.getType()) ? r.getTime() : null,
          days,
          times,
          r.getCreatedAt());
    }).toList();
  }

  public void deleteReminder(UUID userId, UUID reminderId) {
    Reminder r = reminders.findById(reminderId)
        .filter(rem -> rem.getUser().getId().equals(userId))
        .orElseThrow(() -> new IllegalArgumentException(
            "Reminder not found for user " + userId));
    reminders.delete(r);
  }

}
