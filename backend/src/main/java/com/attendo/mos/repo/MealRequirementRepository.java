package com.attendo.mos.repo;

import com.attendo.mos.entity.MealRequirement;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface MealRequirementRepository extends JpaRepository<MealRequirement, UUID> {
    List<MealRequirement> findByUserId(UUID userId);
    void deleteByUserId(UUID userId);
}
