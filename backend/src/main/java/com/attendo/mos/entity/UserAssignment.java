package com.attendo.mos.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;

@Entity
@Data
@Table(name = "user_assignment")
@IdClass(UserAssignmentId.class)
public class UserAssignment {
    
    @Id
    @ManyToOne(optional = false)
    @JoinColumn(name = "caregiver_id")
    private User caregiver;
    
    @Id
    @ManyToOne(optional = false)
    @JoinColumn(name = "resident_id")
    private User resident;
    
    @Column(name = "assigned_at", nullable = false)
    private OffsetDateTime assignedAt = OffsetDateTime.now(ZoneOffset.UTC);
    
    // Constructors
    public UserAssignment() {}
    
    public UserAssignment(User caregiver, User resident) {
        this.caregiver = caregiver;
        this.resident = resident;
        this.assignedAt = OffsetDateTime.now(ZoneOffset.UTC);
    }
}
