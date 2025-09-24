package com.attendo.mos.controller;


import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.attendo.mos.dto.CreateReminderRequest;
import com.attendo.mos.dto.ReminderDto;
import com.attendo.mos.dto.ReminderResponse;
import com.attendo.mos.service.ReminderService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/users/{userId}/reminders")
@CrossOrigin(origins = "http://localhost:3000")
public class ReminderController {
    private final ReminderService service;
    
    public ReminderController(ReminderService service) {
        this.service = service;
    }
    // Swagger annotations
    @Operation(summary = "Create a reminder", description = "Create a new reminder with time, category, and optional note.")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Reminder created", content = @Content(schema = @Schema(implementation = ReminderDto.class))),
            @ApiResponse(responseCode = "400", description = "Invalid input", content = @Content(schema = @Schema(example = """
                        {
                          "status": 400,
                          "error": "Bad Request",
                          "message": "time must be now or future (±5m)",
                          "path": "/api/v1/reminders"
                        }
                    """)))
    })

    @PostMapping
    public ResponseEntity<?> create(@PathVariable UUID userId,
            @RequestBody @Valid CreateReminderRequest req) {
        try {
            var dto = service.addReminder(userId, req);
            return ResponseEntity.status(HttpStatus.CREATED).body(dto);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of(
                "error", "Bad Request",
                "message", e.getMessage()
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "error", "Internal Server Error",
                "message", "Failed to create reminder"
            ));
        }
    }
    @GetMapping
    public List<ReminderResponse> get(@PathVariable UUID userId) {
        return service.getReminders(userId);
    }

    @DeleteMapping("/{reminderId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable UUID userId, @PathVariable UUID reminderId) {
        service.deleteReminder(userId, reminderId);
    }

}
