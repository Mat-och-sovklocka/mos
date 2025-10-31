package com.attendo.mos.controller;

import com.attendo.mos.constants.PermissionConstants;
import com.attendo.mos.dto.MealRequirementsRequest;
import com.attendo.mos.dto.MealRequirementsResponse;
import com.attendo.mos.service.MealRequirementService;
import com.attendo.mos.service.UserPermissionService;
import com.attendo.mos.config.JwtUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/users/{userId}/meal-requirements")
@CrossOrigin(origins = "http://localhost:3000")
@Tag(name = "Meal Requirements", description = "Meal requirement management endpoints")
public class MealRequirementController {
    
    private final MealRequirementService mealRequirementService;
    private final UserPermissionService userPermissionService;
    private final JwtUtil jwtUtil;
    
    public MealRequirementController(MealRequirementService mealRequirementService,
                                   UserPermissionService userPermissionService,
                                   JwtUtil jwtUtil) {
        this.mealRequirementService = mealRequirementService;
        this.userPermissionService = userPermissionService;
        this.jwtUtil = jwtUtil;
    }
    
    @Operation(summary = "Set meal requirements", description = "Set meal requirements for a user. Replaces all existing requirements.")
    @ApiResponses({
        @ApiResponse(responseCode = "201", description = "Meal requirements set successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid input")
    })
    @PostMapping
    public ResponseEntity<?> setMealRequirements(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable UUID userId,
            @RequestBody MealRequirementsRequest request) {
        
        UUID currentUserId = getCurrentUserId(authHeader);
        if (!hasPermission(currentUserId, PermissionConstants.MEAL_REQUIREMENTS)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of(
                "error", "Forbidden",
                "message", "You don't have permission to manage meal requirements"
            ));
        }
        
        MealRequirementsResponse response = mealRequirementService.setMealRequirements(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
    
    @Operation(summary = "Get meal requirements", description = "Get all meal requirements for a user")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Meal requirements retrieved successfully"),
        @ApiResponse(responseCode = "403", description = "Forbidden - insufficient permissions")
    })
    @GetMapping
    public ResponseEntity<?> getMealRequirements(@RequestHeader("Authorization") String authHeader,
            @PathVariable UUID userId) {
        UUID currentUserId = getCurrentUserId(authHeader);
        if (!hasPermission(currentUserId, PermissionConstants.MEAL_REQUIREMENTS)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of(
                "error", "Forbidden",
                "message", "You don't have permission to view meal requirements"
            ));
        }
        
        MealRequirementsResponse response = mealRequirementService.getMealRequirements(userId);
        return ResponseEntity.ok(response);
    }
    
    private UUID getCurrentUserId(String authHeader) {
        String token = authHeader.substring(7); // Remove "Bearer "
        return jwtUtil.getUserIdFromToken(token);
    }
    
    private boolean hasPermission(UUID userId, String permission) {
        return userPermissionService.hasPermission(userId, permission);
    }
}
