package com.attendo.mos.repo;

import com.attendo.mos.entity.MealRequirement;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface MealRequirementRepository extends JpaRepository<MealRequirement, UUID> {
}
