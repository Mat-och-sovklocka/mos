package com.attendo.mos.controller;

import java.net.URI;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.attendo.mos.dto.CreateReminderRequest;
import com.attendo.mos.dto.ReminderDto;
import com.attendo.mos.service.ReminderService;

import jakarta.validation.Valid;

import lombok.RequiredArgsConstructor;

/**
 * REST controller for managing reminders.
 * Handles HTTP requests for creating and retrieving reminders.
 */
@RestController
@RequestMapping("/api/v1/reminders")
@RequiredArgsConstructor
public class ReminderController {
    private final ReminderService service;

    /**
     * Creates a new reminder.
     *
     * @param req the request body containing reminder details, validated
     * @return ResponseEntity containing the created ReminderDto and the location
     *         header
     */
    @PostMapping
    public ResponseEntity<ReminderDto> create(@Valid @RequestBody CreateReminderRequest req) {
        ReminderDto created = service.create(req);
        URI location = URI.create("/api/v1/reminders/" + created.id());
        return ResponseEntity.created(location).body(created);
    }
}
