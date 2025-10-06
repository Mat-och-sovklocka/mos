package com.attendo.mos.controller;

import com.attendo.mos.dto.MealRequirementsRequest;
import com.attendo.mos.dto.MealRequirementsResponse;
import com.attendo.mos.service.MealRequirementService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/users/{userId}/meal-requirements")
@CrossOrigin(origins = "http://localhost:3000")
public class MealRequirementController {
    
    private final MealRequirementService mealRequirementService;
    
    public MealRequirementController(MealRequirementService mealRequirementService) {
        this.mealRequirementService = mealRequirementService;
    }
    
    @Operation(summary = "Set meal requirements", description = "Set meal requirements for a user. Replaces all existing requirements.")
    @ApiResponses({
        @ApiResponse(responseCode = "201", description = "Meal requirements set successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid input")
    })
    @PostMapping
    public ResponseEntity<MealRequirementsResponse> setMealRequirements(
            @PathVariable UUID userId,
            @RequestBody MealRequirementsRequest request) {
        
        MealRequirementsResponse response = mealRequirementService.setMealRequirements(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
    
    @Operation(summary = "Get meal requirements", description = "Get all meal requirements for a user.")
    @GetMapping
    public MealRequirementsResponse getMealRequirements(@PathVariable UUID userId) {
        return mealRequirementService.getMealRequirements(userId);
    }
}
