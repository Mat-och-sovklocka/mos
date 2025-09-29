package com.attendo.mos.service;

import com.attendo.mos.dto.Category;
import com.attendo.mos.dto.CreateReminderRequest;
import com.attendo.mos.dto.ReminderDto;
import com.attendo.mos.dto.ReminderResponse;
import com.attendo.mos.dto.UpdateReminderRequest;
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
  private static final Map<String, Category> CATEGORY_MAP = new HashMap<>() {{
      // Swedish
      put("måltider", Category.MEAL);
      put("maltdier", Category.MEAL); // fallback if accents drop
      put("medicinintag", Category.MEDICATION);
      put("medicin", Category.MEDICATION);
      put("rörelse/pauser", Category.EXERCISE);
      put("rorelse/pauser", Category.EXERCISE); // fallback if accents drop
      put("vila/sömn", Category.REST);
      put("vila/somn", Category.REST); // fallback if accents drop
      put("möte", Category.MEETING);
      put("mote", Category.MEETING); // fallback if accents drop
      put("dusch", Category.SHOWER);
      put("städning", Category.CLEANING);
      put("stadning", Category.CLEANING); // fallback if accents drop
      put("övrigt", Category.OTHER);
      put("ovrigt", Category.OTHER); // fallback if accents drop
      // English
      put("meal", Category.MEAL);
      put("meals", Category.MEAL);
      put("medication", Category.MEDICATION);
      put("medicine", Category.MEDICATION);
      put("exercise", Category.EXERCISE);
      put("rest", Category.REST);
      put("sleep", Category.REST);
      put("meeting", Category.MEETING);
      put("shower", Category.SHOWER);
      put("cleaning", Category.CLEANING);
      put("other", Category.OTHER);
  }};
      
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
        @SuppressWarnings("unchecked")
        List<String> daysList = (List<String>) r.getRecurrence().getOrDefault("days", List.of());
        @SuppressWarnings("unchecked")
        List<String> timesList = (List<String>) r.getRecurrence().getOrDefault("times", List.of());
        days = daysList;
        times = timesList;
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

  public ReminderDto updateReminder(UUID userId, UUID reminderId, UpdateReminderRequest req) {
    Reminder r = reminders.findById(reminderId)
        .filter(rem -> rem.getUser().getId().equals(userId))
        .orElseThrow(() -> new IllegalArgumentException(
            "Reminder not found for user " + userId));

    // Update fields only if provided (partial update)
    if (req.type() != null) {
      r.setType(req.type());
    }
    
    if (req.category() != null) {
      r.setCategory(mapCategory(req.category()));
    }
    
    if (req.note() != null) {
      r.setNote(req.note());
    }

    // Handle time/recurrence based on type
    String currentType = r.getType();
    if (req.type() != null) {
      currentType = req.type();
    }

    if ("once".equalsIgnoreCase(currentType)) {
      if (req.dateTime() != null) {
        r.setTime(req.dateTime());
      }
      r.setRecurrence(null);
    } else if ("recurring".equalsIgnoreCase(currentType)) {
      r.setTime(null);
      Map<String, Object> rec = new HashMap<>();
      rec.put("days", req.days() != null ? req.days() : 
          (r.getRecurrence() != null ? r.getRecurrence().getOrDefault("days", List.of()) : List.of()));
      rec.put("times", req.times() != null ? req.times() : 
          (r.getRecurrence() != null ? r.getRecurrence().getOrDefault("times", List.of()) : List.of()));
      r.setRecurrence(rec);
    }

    r = reminders.save(r);
    return new ReminderDto(r.getId(), r.getTime(), r.getCategory(), r.getNote(),
        r.getCreatedAt(), r.getType(), r.getRecurrence());
  }

}
