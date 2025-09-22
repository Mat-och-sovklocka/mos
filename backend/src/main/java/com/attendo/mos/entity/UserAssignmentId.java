package com.attendo.mos.entity;

import lombok.Data;
import lombok.EqualsAndHashCode;

import java.io.Serializable;
import java.util.UUID;

@Data
@EqualsAndHashCode
public class UserAssignmentId implements Serializable {
    
    private UUID caregiver;
    private UUID resident;
    
    public UserAssignmentId() {}
    
    public UserAssignmentId(UUID caregiver, UUID resident) {
        this.caregiver = caregiver;
        this.resident = resident;
    }
}
