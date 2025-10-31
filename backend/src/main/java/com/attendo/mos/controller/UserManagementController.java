package com.attendo.mos.controller;

import com.attendo.mos.entity.User;
import com.attendo.mos.dto.UserType;
import com.attendo.mos.service.UserManagementService;
import com.attendo.mos.service.UserPermissionService;
import com.attendo.mos.config.JwtUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/user-management")
@CrossOrigin(origins = "http://localhost:3000")
@Tag(name = "User Management", description = "User and caretaker management endpoints")
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
    
    @Operation(summary = "Create a caretaker", description = "Create a new caretaker assigned to the current caregiver")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Caretaker created successfully"),
        @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    @PostMapping("/caretakers")
    public ResponseEntity<User> createCaretaker(@RequestHeader("Authorization") String authHeader,
                                                  @RequestBody CreateCaretakerRequest request) {
        UUID caregiverId = getCurrentUserId(authHeader);
        User caretaker = userManagementService.createCaretaker(
            request.getName(), 
            request.getEmail(), 
            request.getPhone(),
            caregiverId
        );
        return ResponseEntity.ok(caretaker);
    }
    
    @Operation(summary = "Get caretakers", description = "Get all caretakers assigned to the current caregiver")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Caretakers retrieved successfully"),
        @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    @GetMapping("/caretakers")
    public ResponseEntity<List<User>> getCaretakers(@RequestHeader("Authorization") String authHeader) {
        UUID caregiverId = getCurrentUserId(authHeader);
        List<User> caretakers = userManagementService.getCaretakersByCaregiver(caregiverId);
        return ResponseEntity.ok(caretakers);
    }
    
    @Operation(summary = "Get caretaker permissions", description = "Get all permissions for a specific caretaker")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Permissions retrieved successfully"),
        @ApiResponse(responseCode = "403", description = "Forbidden - caretaker not managed by current user"),
        @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
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
    
    @Operation(summary = "Set caretaker permissions", description = "Update permissions for a specific caretaker")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Permissions updated successfully"),
        @ApiResponse(responseCode = "403", description = "Forbidden - caretaker not managed by current user"),
        @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
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
    
    @Operation(summary = "Delete a caretaker", description = "Delete a caretaker assigned to the current caregiver")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Caretaker deleted successfully"),
        @ApiResponse(responseCode = "403", description = "Forbidden - caretaker not managed by current user"),
        @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
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
    
    @Operation(summary = "Get current user permissions", description = "Get all permissions for the currently authenticated user")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Permissions retrieved successfully"),
        @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    @GetMapping("/permissions")
    public ResponseEntity<List<String>> getCurrentUserPermissions(@RequestHeader("Authorization") String authHeader) {
        UUID userId = getCurrentUserId(authHeader);
        List<String> permissions = userPermissionService.getUserPermissions(userId);
        return ResponseEntity.ok(permissions);
    }
    
    @Operation(summary = "Get all users (Admin only)", description = "Get a list of all users in the system. Requires admin role.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Users retrieved successfully"),
        @ApiResponse(responseCode = "403", description = "Forbidden - admin role required"),
        @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    @GetMapping("/admin/users")
    public ResponseEntity<List<com.attendo.mos.dto.UserInfoResponse>> getAllUsers(@RequestHeader("Authorization") String authHeader) {
        UUID adminId = getCurrentUserId(authHeader);
        
        // Verify the user is an admin
        com.attendo.mos.entity.User admin = userManagementService.findUserById(adminId);
        if (admin.getUserType() != com.attendo.mos.dto.UserType.ADMIN) {
            return ResponseEntity.status(403).build();
        }
        
        List<com.attendo.mos.dto.UserInfoResponse> users = userManagementService.getAllUsers();
        return ResponseEntity.ok(users);
    }
    
    @Operation(summary = "Create a user (Admin only)", description = "Create a new user of any type. Requires admin role.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "User created successfully"),
        @ApiResponse(responseCode = "403", description = "Forbidden - admin role required"),
        @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    @PostMapping("/admin/users")
    public ResponseEntity<User> createUser(@RequestHeader("Authorization") String authHeader,
                                         @RequestBody CreateUserRequest request) {
        UUID adminId = getCurrentUserId(authHeader);
        
        try {
            User newUser = userManagementService.createUser(
                request.getName(),
                request.getEmail(),
                request.getPhone(),
                request.getUserType(),
                adminId
            );
            return ResponseEntity.ok(newUser);
        } catch (RuntimeException e) {
            return ResponseEntity.status(403).build(); // Forbidden - not admin or other error
        }
    }
    
    @Operation(summary = "Delete a user (Admin only)", description = "Delete a user from the system. Requires admin role. Cannot delete users with dependencies.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "User deleted successfully"),
        @ApiResponse(responseCode = "400", description = "Bad Request - user has dependencies"),
        @ApiResponse(responseCode = "403", description = "Forbidden - admin role required"),
        @ApiResponse(responseCode = "404", description = "User not found"),
        @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    @DeleteMapping("/admin/users/{userId}")
    public ResponseEntity<Map<String, String>> deleteUser(@RequestHeader("Authorization") String authHeader,
                                                         @PathVariable UUID userId) {
        UUID adminId = getCurrentUserId(authHeader);
        
        try {
            userManagementService.deleteUser(userId, adminId);
            return ResponseEntity.ok(Map.of("message", "User deleted successfully"));
        } catch (RuntimeException e) {
            if (e.getMessage().contains("Only admins can delete users")) {
                return ResponseEntity.status(403).body(Map.of("error", "Only admins can delete users"));
            } else if (e.getMessage().contains("Cannot delete user")) {
                return ResponseEntity.status(400).body(Map.of("error", e.getMessage()));
            } else if (e.getMessage().contains("User not found")) {
                return ResponseEntity.status(404).body(Map.of("error", "User not found"));
            } else {
                return ResponseEntity.status(500).body(Map.of("error", "Internal server error"));
            }
        }
    }
    
    @Operation(summary = "Update a user (Admin only)", description = "Update user information. Requires admin role.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "User updated successfully"),
        @ApiResponse(responseCode = "403", description = "Forbidden - admin role required"),
        @ApiResponse(responseCode = "404", description = "User not found"),
        @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    @PutMapping("/admin/users/{userId}")
    public ResponseEntity<User> updateUser(@RequestHeader("Authorization") String authHeader,
                                         @PathVariable UUID userId,
                                         @RequestBody UpdateUserRequest request) {
        UUID adminId = getCurrentUserId(authHeader);
        
        try {
            User updatedUser = userManagementService.updateUser(
                userId,
                request.getName(),
                request.getEmail(),
                request.getPhone(),
                adminId
            );
            return ResponseEntity.ok(updatedUser);
        } catch (RuntimeException e) {
            if (e.getMessage().contains("Only admins can update users")) {
                return ResponseEntity.status(403).build();
            } else if (e.getMessage().contains("User not found")) {
                return ResponseEntity.status(404).build();
            } else {
                return ResponseEntity.status(500).build();
            }
        }
    }
    
    @Operation(summary = "Update a caretaker", description = "Update information for a caretaker assigned to the current caregiver")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Caretaker updated successfully"),
        @ApiResponse(responseCode = "403", description = "Forbidden - caretaker not managed by current user"),
        @ApiResponse(responseCode = "404", description = "Caretaker not found"),
        @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    @PutMapping("/caretakers/{caretakerId}")
    public ResponseEntity<User> updateCaretaker(@RequestHeader("Authorization") String authHeader,
                                              @PathVariable UUID caretakerId,
                                              @RequestBody UpdateCaretakerRequest request) {
        UUID caregiverId = getCurrentUserId(authHeader);
        
        try {
            User updatedCaretaker = userManagementService.updateCaretaker(
                caretakerId,
                request.getName(),
                request.getEmail(),
                request.getPhone(),
                caregiverId
            );
            return ResponseEntity.ok(updatedCaretaker);
        } catch (RuntimeException e) {
            if (e.getMessage().contains("Caregiver is not assigned to this caretaker")) {
                return ResponseEntity.status(403).build();
            } else if (e.getMessage().contains("Caretaker not found")) {
                return ResponseEntity.status(404).build();
            } else {
                return ResponseEntity.status(500).build();
            }
        }
    }
    
    @Operation(summary = "Update own profile", description = "Update the currently authenticated user's own profile information")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Profile updated successfully"),
        @ApiResponse(responseCode = "404", description = "User not found"),
        @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    @PutMapping("/profile")
    public ResponseEntity<User> updateProfile(@RequestHeader("Authorization") String authHeader,
                                            @RequestBody UpdateProfileRequest request) {
        UUID userId = getCurrentUserId(authHeader);
        
        try {
            User updatedUser = userManagementService.updateProfile(
                userId,
                request.getName(),
                request.getEmail(),
                request.getPhone()
            );
            return ResponseEntity.ok(updatedUser);
        } catch (RuntimeException e) {
            if (e.getMessage().contains("User not found")) {
                return ResponseEntity.status(404).build();
            } else {
                return ResponseEntity.status(500).build();
            }
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
        private String phone;
        
        // Getters and setters
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getPhone() { return phone; }
        public void setPhone(String phone) { this.phone = phone; }
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
        private String phone;
        private UserType userType;
        
        // Getters and setters
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getPhone() { return phone; }
        public void setPhone(String phone) { this.phone = phone; }
        public UserType getUserType() { return userType; }
        public void setUserType(UserType userType) { this.userType = userType; }
    }
    
    public static class UpdateUserRequest {
        private String name;
        private String email;
        private String phone;
        
        // Getters and setters
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getPhone() { return phone; }
        public void setPhone(String phone) { this.phone = phone; }
    }
    
    public static class UpdateCaretakerRequest {
        private String name;
        private String email;
        private String phone;
        
        // Getters and setters
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getPhone() { return phone; }
        public void setPhone(String phone) { this.phone = phone; }
    }
    
    public static class UpdateProfileRequest {
        private String name;
        private String email;
        private String phone;
        
        // Getters and setters
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getPhone() { return phone; }
        public void setPhone(String phone) { this.phone = phone; }
    }
}
