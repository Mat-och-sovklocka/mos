package com.attendo.mos.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "user_permissions")
public class UserPermission {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @Column(name = "permission_name", nullable = false, length = 50)
    private String permissionName;
    
    @Column(name = "is_enabled", nullable = false)
    private Boolean isEnabled = false;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "granted_by")
    private User grantedBy;
    
    @Column(name = "granted_at", nullable = false)
    private LocalDateTime grantedAt;
    
    // Constructors
    public UserPermission() {
        this.grantedAt = LocalDateTime.now();
    }
    
    public UserPermission(User user, String permissionName, Boolean isEnabled, User grantedBy) {
        this();
        this.user = user;
        this.permissionName = permissionName;
        this.isEnabled = isEnabled;
        this.grantedBy = grantedBy;
    }
    
    // Getters and Setters
    public UUID getId() {
        return id;
    }
    
    public void setId(UUID id) {
        this.id = id;
    }
    
    public User getUser() {
        return user;
    }
    
    public void setUser(User user) {
        this.user = user;
    }
    
    public String getPermissionName() {
        return permissionName;
    }
    
    public void setPermissionName(String permissionName) {
        this.permissionName = permissionName;
    }
    
    public Boolean getIsEnabled() {
        return isEnabled;
    }
    
    public void setIsEnabled(Boolean isEnabled) {
        this.isEnabled = isEnabled;
    }
    
    public User getGrantedBy() {
        return grantedBy;
    }
    
    public void setGrantedBy(User grantedBy) {
        this.grantedBy = grantedBy;
    }
    
    public LocalDateTime getGrantedAt() {
        return grantedAt;
    }
    
    public void setGrantedAt(LocalDateTime grantedAt) {
        this.grantedAt = grantedAt;
    }
}
