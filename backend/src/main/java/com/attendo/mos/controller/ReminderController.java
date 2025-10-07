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
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.attendo.mos.constants.PermissionConstants;
import com.attendo.mos.dto.CreateReminderRequest;
import com.attendo.mos.dto.ReminderDto;
import com.attendo.mos.dto.ReminderResponse;
import com.attendo.mos.dto.UpdateReminderRequest;
import com.attendo.mos.service.ReminderService;
import com.attendo.mos.service.UserPermissionService;
import com.attendo.mos.config.JwtUtil;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/users/{userId}/reminders")
@CrossOrigin(origins = "http://localhost:3000")
public class ReminderController {
    private final ReminderService service;
    private final UserPermissionService userPermissionService;
    private final JwtUtil jwtUtil;
    
    public ReminderController(ReminderService service, UserPermissionService userPermissionService, JwtUtil jwtUtil) {
        this.service = service;
        this.userPermissionService = userPermissionService;
        this.jwtUtil = jwtUtil;
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
    public ResponseEntity<?> create(@RequestHeader("Authorization") String authHeader,
            @PathVariable UUID userId,
            @RequestBody @Valid CreateReminderRequest req) {
        try {
            UUID currentUserId = getCurrentUserId(authHeader);
            if (!hasPermission(currentUserId, PermissionConstants.CREATE_REMINDERS)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of(
                    "error", "Forbidden",
                    "message", "You don't have permission to create reminders"
                ));
            }
            
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
    public ResponseEntity<?> get(@RequestHeader("Authorization") String authHeader,
            @PathVariable UUID userId) {
        UUID currentUserId = getCurrentUserId(authHeader);
        if (!hasPermission(currentUserId, PermissionConstants.VIEW_REMINDERS)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of(
                "error", "Forbidden",
                "message", "You don't have permission to view reminders"
            ));
        }
        
        List<ReminderResponse> reminders = service.getReminders(userId);
        return ResponseEntity.ok(reminders);
    }

    @DeleteMapping("/{reminderId}")
    public ResponseEntity<?> delete(@RequestHeader("Authorization") String authHeader,
            @PathVariable UUID userId, @PathVariable UUID reminderId) {
        UUID currentUserId = getCurrentUserId(authHeader);
        if (!hasPermission(currentUserId, PermissionConstants.CREATE_REMINDERS)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of(
                "error", "Forbidden",
                "message", "You don't have permission to delete reminders"
            ));
        }
        
        service.deleteReminder(userId, reminderId);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Update a reminder", description = "Update an existing reminder with new time, category, or note.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Reminder updated", content = @Content(schema = @Schema(implementation = ReminderDto.class))),
            @ApiResponse(responseCode = "400", description = "Invalid input", content = @Content(schema = @Schema(example = """
                        {
                          "status": 400,
                          "error": "Bad Request",
                          "message": "Reminder not found for user",
                          "path": "/api/users/{userId}/reminders/{reminderId}"
                        }
                    """))),
            @ApiResponse(responseCode = "404", description = "Reminder not found")
    })
    @PutMapping("/{reminderId}")
    public ResponseEntity<?> update(@RequestHeader("Authorization") String authHeader,
            @PathVariable UUID userId, @PathVariable UUID reminderId,
            @RequestBody @Valid UpdateReminderRequest req) {
        try {
            UUID currentUserId = getCurrentUserId(authHeader);
            if (!hasPermission(currentUserId, PermissionConstants.CREATE_REMINDERS)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of(
                    "error", "Forbidden",
                    "message", "You don't have permission to update reminders"
                ));
            }
            
            var dto = service.updateReminder(userId, reminderId, req);
            return ResponseEntity.ok(dto);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of(
                "error", "Bad Request",
                "message", e.getMessage()
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "error", "Internal Server Error",
                "message", "Failed to update reminder"
            ));
        }
    }
    
    private UUID getCurrentUserId(String authHeader) {
        String token = authHeader.substring(7); // Remove "Bearer "
        return jwtUtil.getUserIdFromToken(token);
    }
    
    private boolean hasPermission(UUID userId, String permission) {
        return userPermissionService.hasPermission(userId, permission);
    }

}
