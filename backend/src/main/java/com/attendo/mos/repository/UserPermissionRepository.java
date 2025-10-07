package com.attendo.mos.repository;

import com.attendo.mos.entity.UserPermission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserPermissionRepository extends JpaRepository<UserPermission, UUID> {
    
    List<UserPermission> findByUserId(UUID userId);
    
    List<UserPermission> findByUserIdAndIsEnabledTrue(UUID userId);
    
    Optional<UserPermission> findByUserIdAndPermissionName(UUID userId, String permissionName);
    
    @Query("SELECT up FROM UserPermission up WHERE up.user.id = :userId AND up.permissionName = :permissionName AND up.isEnabled = true")
    Optional<UserPermission> findEnabledPermissionByUserIdAndName(@Param("userId") UUID userId, @Param("permissionName") String permissionName);
    
    @Query("SELECT up.permissionName FROM UserPermission up WHERE up.user.id = :userId AND up.isEnabled = true")
    List<String> findEnabledPermissionNamesByUserId(@Param("userId") UUID userId);
    
    boolean existsByUserIdAndPermissionNameAndIsEnabledTrue(UUID userId, String permissionName);
    
    void deleteByUserId(UUID userId);
}
