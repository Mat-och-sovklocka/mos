package com.attendo.mos.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "user_assignments")
public class UserAssignment {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "caregiver_id", nullable = false)
    private User caregiver;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "caretaker_id", nullable = false)
    private User caretaker;
    
    @Column(name = "assigned_at", nullable = false)
    private LocalDateTime assignedAt;
    
    // Constructors
    public UserAssignment() {
        this.assignedAt = LocalDateTime.now();
    }
    
    public UserAssignment(User caregiver, User caretaker) {
        this();
        this.caregiver = caregiver;
        this.caretaker = caretaker;
    }
    
    // Getters and Setters
    public UUID getId() {
        return id;
    }
    
    public void setId(UUID id) {
        this.id = id;
    }
    
    public User getCaregiver() {
        return caregiver;
    }
    
    public void setCaregiver(User caregiver) {
        this.caregiver = caregiver;
    }
    
    public User getCaretaker() {
        return caretaker;
    }
    
    public void setCaretaker(User caretaker) {
        this.caretaker = caretaker;
    }
    
    public LocalDateTime getAssignedAt() {
        return assignedAt;
    }
    
    public void setAssignedAt(LocalDateTime assignedAt) {
        this.assignedAt = assignedAt;
    }
}