package com.attendo.mos.service;

import com.attendo.mos.entity.User;
import com.attendo.mos.entity.UserPermission;
import com.attendo.mos.repository.UserPermissionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@Transactional
public class UserPermissionService {
    
    private final UserPermissionRepository userPermissionRepository;
    
    public UserPermissionService(UserPermissionRepository userPermissionRepository) {
        this.userPermissionRepository = userPermissionRepository;
    }
    
    public boolean hasPermission(UUID userId, String permissionName) {
        return userPermissionRepository.existsByUserIdAndPermissionNameAndIsEnabledTrue(userId, permissionName);
    }
    
    public List<String> getUserPermissions(UUID userId) {
        return userPermissionRepository.findEnabledPermissionNamesByUserId(userId);
    }
    
    public List<UserPermission> getUserPermissionDetails(UUID userId) {
        return userPermissionRepository.findByUserId(userId);
    }
    
    public void grantPermission(UUID userId, String permissionName, UUID grantedBy) {
        // Check if permission already exists
        Optional<UserPermission> existingPermission = userPermissionRepository.findByUserIdAndPermissionName(userId, permissionName);
        
        if (existingPermission.isPresent()) {
            // Update existing permission
            UserPermission permission = existingPermission.get();
            permission.setIsEnabled(true);
            userPermissionRepository.save(permission);
        } else {
            // Create new permission using the constructor that sets all fields
            User user = new User();
            user.setId(userId);
            
            User grantedByUser = new User();
            grantedByUser.setId(grantedBy);
            
            UserPermission newPermission = new UserPermission(user, permissionName, true, grantedByUser);
            userPermissionRepository.save(newPermission);
        }
    }
    
    public void revokePermission(UUID userId, String permissionName) {
        userPermissionRepository.findByUserIdAndPermissionName(userId, permissionName)
            .ifPresent(permission -> {
                permission.setIsEnabled(false);
                userPermissionRepository.save(permission);
            });
    }
    
    public void setUserPermissions(UUID userId, List<String> permissionNames, UUID grantedBy) {
        // First, disable all existing permissions
        List<UserPermission> existingPermissions = userPermissionRepository.findByUserId(userId);
        for (UserPermission permission : existingPermissions) {
            permission.setIsEnabled(false);
        }
        userPermissionRepository.saveAll(existingPermissions);
        
        // Then, enable the specified permissions
        for (String permissionName : permissionNames) {
            grantPermission(userId, permissionName, grantedBy);
        }
    }
    
    public void deleteAllUserPermissions(UUID userId) {
        userPermissionRepository.deleteByUserId(userId);
    }
}
