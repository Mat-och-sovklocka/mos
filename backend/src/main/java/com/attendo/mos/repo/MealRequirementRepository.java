package com.attendo.mos.repo;

import com.attendo.mos.entity.MealRequirement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface MealRequirementRepository extends JpaRepository<MealRequirement, UUID> {
    List<MealRequirement> findByUserId(UUID userId);
    
    @Modifying
    @Query("DELETE FROM MealRequirement mr WHERE mr.user.id = :userId")
    void deleteByUserId(@Param("userId") UUID userId);
}
