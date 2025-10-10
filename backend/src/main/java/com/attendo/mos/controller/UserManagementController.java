package com.attendo.mos.controller;

import com.attendo.mos.entity.User;
import com.attendo.mos.dto.UserType;
import com.attendo.mos.service.UserManagementService;
import com.attendo.mos.service.UserPermissionService;
import com.attendo.mos.config.JwtUtil;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/user-management")
@CrossOrigin(origins = "http://localhost:3000")
public class UserManagementController {
    
    private final UserManagementService userManagementService;
    private final UserPermissionService userPermissionService;
    private final JwtUtil jwtUtil;
    
    public UserManagementController(UserManagementService userManagementService,
                                  UserPermissionService userPermissionService,
                                  JwtUtil jwtUtil) {
        this.userManagementService = userManagementService;
        this.userPermissionService = userPermissionService;
        this.jwtUtil = jwtUtil;
    }
    
    @PostMapping("/caretakers")
    public ResponseEntity<User> createCaretaker(@RequestHeader("Authorization") String authHeader,
                                                  @RequestBody CreateCaretakerRequest request) {
        UUID caregiverId = getCurrentUserId(authHeader);
        User caretaker = userManagementService.createCaretaker(
            request.getName(), 
            request.getEmail(), 
            caregiverId
        );
        return ResponseEntity.ok(caretaker);
    }
    
    @GetMapping("/caretakers")
    public ResponseEntity<List<User>> getCaretakers(@RequestHeader("Authorization") String authHeader) {
        UUID caregiverId = getCurrentUserId(authHeader);
        List<User> caretakers = userManagementService.getCaretakersByCaregiver(caregiverId);
        return ResponseEntity.ok(caretakers);
    }
    
    @GetMapping("/caretakers/{caretakerId}/permissions")
    public ResponseEntity<List<String>> getCaretakerPermissions(@RequestHeader("Authorization") String authHeader,
                                                               @PathVariable UUID caretakerId) {
        UUID caregiverId = getCurrentUserId(authHeader);
        
        // Verify the caregiver manages this caretaker
        if (!userManagementService.getCaretakersByCaregiver(caregiverId).stream()
            .anyMatch(caretaker -> caretaker.getId().equals(caretakerId))) {
            return ResponseEntity.status(403).build();
        }
        
        List<String> permissions = userManagementService.getCaretakerPermissions(caretakerId);
        return ResponseEntity.ok(permissions);
    }
    
    @PutMapping("/caretakers/{caretakerId}/permissions")
    public ResponseEntity<Void> setCaretakerPermissions(@RequestHeader("Authorization") String authHeader,
                                                       @PathVariable UUID caretakerId,
                                                       @RequestBody SetPermissionsRequest request) {
        UUID caregiverId = getCurrentUserId(authHeader);
        
        // Verify the caregiver manages this caretaker
        if (!userManagementService.getCaretakersByCaregiver(caregiverId).stream()
            .anyMatch(caretaker -> caretaker.getId().equals(caretakerId))) {
            return ResponseEntity.status(403).build();
        }
        
        userManagementService.setCaretakerPermissions(caretakerId, request.getPermissions(), caregiverId);
        return ResponseEntity.ok().build();
    }
    
    @DeleteMapping("/caretakers/{caretakerId}")
    public ResponseEntity<Void> deleteCaretaker(@RequestHeader("Authorization") String authHeader,
                                               @PathVariable UUID caretakerId) {
        UUID caregiverId = getCurrentUserId(authHeader);
        
        // Verify the caregiver manages this caretaker
        if (!userManagementService.getCaretakersByCaregiver(caregiverId).stream()
            .anyMatch(caretaker -> caretaker.getId().equals(caretakerId))) {
            return ResponseEntity.status(403).build();
        }
        
        userManagementService.deleteCaretaker(caretakerId);
        return ResponseEntity.ok().build();
    }
    
    @GetMapping("/permissions")
    public ResponseEntity<List<String>> getCurrentUserPermissions(@RequestHeader("Authorization") String authHeader) {
        UUID userId = getCurrentUserId(authHeader);
        List<String> permissions = userPermissionService.getUserPermissions(userId);
        return ResponseEntity.ok(permissions);
    }
    
    @PostMapping("/admin/users")
    public ResponseEntity<User> createUser(@RequestHeader("Authorization") String authHeader,
                                         @RequestBody CreateUserRequest request) {
        UUID adminId = getCurrentUserId(authHeader);
        
        try {
            User newUser = userManagementService.createUser(
                request.getName(),
                request.getEmail(),
                request.getUserType(),
                adminId
            );
            return ResponseEntity.ok(newUser);
        } catch (RuntimeException e) {
            return ResponseEntity.status(403).build(); // Forbidden - not admin or other error
        }
    }
    
    private UUID getCurrentUserId(String authHeader) {
        String token = authHeader.substring(7); // Remove "Bearer "
        return jwtUtil.getUserIdFromToken(token);
    }
    
    // DTOs
    public static class CreateCaretakerRequest {
        private String name;
        private String email;
        
        // Getters and setters
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
    }
    
    public static class SetPermissionsRequest {
        private List<String> permissions;
        
        // Getters and setters
        public List<String> getPermissions() { return permissions; }
        public void setPermissions(List<String> permissions) { this.permissions = permissions; }
    }
    
    public static class CreateUserRequest {
        private String name;
        private String email;
        private UserType userType;
        
        // Getters and setters
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public UserType getUserType() { return userType; }
        public void setUserType(UserType userType) { this.userType = userType; }
    }
}
