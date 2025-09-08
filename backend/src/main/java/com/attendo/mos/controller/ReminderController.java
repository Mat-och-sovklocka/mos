package com.attendo.mos.controller;


import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;

import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.attendo.mos.dto.CreateReminderRequest;
import com.attendo.mos.dto.ReminderDto;
import com.attendo.mos.service.ReminderService;

import jakarta.validation.Valid;

/**
 * Handles HTTP POST requests to create a new resource.
 * <p>
 * This method processes the incoming request body, creates a new entity,
 * and returns a response with the created entity and its location.
 *
 * @param req the request body containing the details for the new resource
 * @return ResponseEntity containing the created resource and the location
 *         header
 * REST controller for managing reminders.
 * Handles HTTP requests for creating and retrieving reminders.
 */
@RestController
@RequestMapping("/api/users/{userId}/reminders")
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
    public ResponseEntity<ReminderDto> create(@PathVariable UUID userId,
            @RequestBody @Valid CreateReminderRequest req) {
        var dto = service.addReminder(userId, req);
        return ResponseEntity.status(HttpStatus.CREATED).body(dto);
    }
}
