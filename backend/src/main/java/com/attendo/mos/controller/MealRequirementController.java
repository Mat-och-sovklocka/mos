package com.attendo.mos.controller;

import com.attendo.mos.dto.MealRequirementsRequest;
import com.attendo.mos.dto.MealRequirementsResponse;
import com.attendo.mos.entity.MealRequirement;
import com.attendo.mos.entity.User;
import com.attendo.mos.repo.MealRequirementRepository;
import com.attendo.mos.repo.UserRepository;
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
    
    private final MealRequirementRepository mealRequirementRepository;
    private final UserRepository userRepository;
    
    public MealRequirementController(MealRequirementRepository mealRequirementRepository, 
                                   UserRepository userRepository) {
        this.mealRequirementRepository = mealRequirementRepository;
        this.userRepository = userRepository;
    }
    
    @Operation(summary = "Set meal requirements", description = "Set meal requirements for a user. Replaces all existing requirements.")
    @ApiResponses({
        @ApiResponse(responseCode = "201", description = "Meal requirements set successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid input")
    })
    @PostMapping
    @Transactional
    public ResponseEntity<MealRequirementsResponse> setMealRequirements(
            @PathVariable UUID userId,
            @RequestBody MealRequirementsRequest request) {
        
        // Find user
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new IllegalArgumentException("User not found"));
        
        // Delete existing meal requirements for this user
        mealRequirementRepository.deleteByUserId(userId);
        
        // Create new meal requirements
        List<MealRequirement> newRequirements = request.requirements().stream()
            .map(requirement -> {
                MealRequirement mr = new MealRequirement();
                mr.setUser(user);
                mr.setType(com.attendo.mos.dto.MealRequirementType.OTHER);
                mr.setNotes(requirement);
                return mr;
            })
            .toList();
        
        List<MealRequirement> savedRequirements = mealRequirementRepository.saveAll(newRequirements);
        
        // Convert to response DTOs
        List<MealRequirementsResponse.MealRequirementDto> responseDtos = savedRequirements.stream()
            .map(mr -> new MealRequirementsResponse.MealRequirementDto(
                mr.getId(),
                mr.getNotes(),
                mr.getCreatedAt()
            ))
            .toList();
        
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(new MealRequirementsResponse(responseDtos));
    }
    
    @Operation(summary = "Get meal requirements", description = "Get all meal requirements for a user.")
    @GetMapping
    public MealRequirementsResponse getMealRequirements(@PathVariable UUID userId) {
        List<MealRequirement> requirements = mealRequirementRepository.findByUserId(userId);
        
        List<MealRequirementsResponse.MealRequirementDto> responseDtos = requirements.stream()
            .map(mr -> new MealRequirementsResponse.MealRequirementDto(
                mr.getId(),
                mr.getNotes(),
                mr.getCreatedAt()
            ))
            .toList();
        
        return new MealRequirementsResponse(responseDtos);
    }
}
