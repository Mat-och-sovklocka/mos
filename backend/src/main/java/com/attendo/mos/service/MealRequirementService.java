package com.attendo.mos.service;

import com.attendo.mos.dto.MealRequirementsRequest;
import com.attendo.mos.dto.MealRequirementsResponse;
import com.attendo.mos.entity.MealRequirement;
import com.attendo.mos.entity.User;
import com.attendo.mos.repo.MealRequirementRepository;
import com.attendo.mos.repo.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class MealRequirementService {
    
    private final MealRequirementRepository mealRequirementRepository;
    private final UserRepository userRepository;
    
    public MealRequirementService(MealRequirementRepository mealRequirementRepository, 
                                UserRepository userRepository) {
        this.mealRequirementRepository = mealRequirementRepository;
        this.userRepository = userRepository;
    }
    
    @Transactional
    public MealRequirementsResponse setMealRequirements(UUID userId, MealRequirementsRequest request) {
        // Find user
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new IllegalArgumentException("User not found"));
        
        // Delete existing meal requirements for this user
        mealRequirementRepository.deleteByUserId(userId);
        
        // Create new meal requirements (remove duplicates)
        List<MealRequirement> newRequirements = request.requirements().stream()
            .distinct() // Remove duplicates
            .filter(requirement -> requirement != null && !requirement.trim().isEmpty()) // Remove null/empty
            .map(requirement -> {
                MealRequirement mr = new MealRequirement();
                mr.setUser(user);
                mr.setType(com.attendo.mos.dto.MealRequirementType.OTHER);
                mr.setNotes(requirement.trim());
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
        
        return new MealRequirementsResponse(responseDtos);
    }
    
    public MealRequirementsResponse getMealRequirements(UUID userId) {
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
