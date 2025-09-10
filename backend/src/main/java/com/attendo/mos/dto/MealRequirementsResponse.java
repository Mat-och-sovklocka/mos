package com.attendo.mos.dto;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

public record MealRequirementsResponse(
        List<MealRequirementDto> requirements
) {
    
    public record MealRequirementDto(
            UUID id,
            String requirement,
            OffsetDateTime createdAt
    ) {}
}
