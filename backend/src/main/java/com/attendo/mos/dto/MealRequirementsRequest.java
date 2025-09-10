package com.attendo.mos.dto;

import java.util.List;

public record MealRequirementsRequest(
        List<String> requirements
) {
}
