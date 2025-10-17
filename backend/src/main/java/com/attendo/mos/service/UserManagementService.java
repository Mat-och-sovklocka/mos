package com.attendo.mos.service;

import com.attendo.mos.entity.User;
import com.attendo.mos.entity.UserAssignment;
import com.attendo.mos.dto.UserType;
import com.attendo.mos.repository.UserAssignmentRepository;
import com.attendo.mos.repo.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@Transactional
public class UserManagementService {
    
    private final UserRepository userRepository;
    private final UserAssignmentRepository userAssignmentRepository;
    private final UserPermissionService userPermissionService;
    private final PasswordEncoder passwordEncoder;
    
    public UserManagementService(UserRepository userRepository, 
                                UserAssignmentRepository userAssignmentRepository,
                                UserPermissionService userPermissionService,
                                PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.userAssignmentRepository = userAssignmentRepository;
        this.userPermissionService = userPermissionService;
        this.passwordEncoder = passwordEncoder;
    }
    
    public User createCaretaker(String name, String email, String phone, UUID caregiverId) {
        User caretaker = new User();
        caretaker.setDisplayName(name);
        caretaker.setEmail(email);
        caretaker.setPhone(phone);
        caretaker.setUserType(UserType.RESIDENT); // Caretakers are residents
        caretaker.setPasswordHash(passwordEncoder.encode("defaultPassword123")); // TODO: Generate secure password
        
        User savedCaretaker = userRepository.save(caretaker);
        
        // Create assignment
        User caregiver = userRepository.findById(caregiverId)
            .orElseThrow(() -> new RuntimeException("Caregiver not found"));
        
        UserAssignment assignment = new UserAssignment(caregiver, savedCaretaker);
        userAssignmentRepository.save(assignment);
        
        return savedCaretaker;
    }
    
    public List<User> getCaretakersByCaregiver(UUID caregiverId) {
        return userAssignmentRepository.findCaretakersByCaregiverId(caregiverId);
    }
    
    public Optional<User> getCaregiverByCaretaker(UUID caretakerId) {
        return userAssignmentRepository.findCaregiverByCaretakerId(caretakerId);
    }
    
    public void assignCaretakerToCaregiver(UUID caregiverId, UUID caretakerId) {
        if (userAssignmentRepository.existsByCaregiverIdAndCaretakerId(caregiverId, caretakerId)) {
            throw new RuntimeException("Assignment already exists");
        }
        
        User caregiver = userRepository.findById(caregiverId)
            .orElseThrow(() -> new RuntimeException("Caregiver not found"));
        User caretaker = userRepository.findById(caretakerId)
            .orElseThrow(() -> new RuntimeException("Caretaker not found"));
        
        UserAssignment assignment = new UserAssignment(caregiver, caretaker);
        userAssignmentRepository.save(assignment);
    }
    
    public void removeCaretakerFromCaregiver(UUID caregiverId, UUID caretakerId) {
        userAssignmentRepository.deleteByCaregiverIdAndCaretakerId(caregiverId, caretakerId);
    }
    
    public void deleteCaretaker(UUID caretakerId) {
        // Remove all assignments
        userAssignmentRepository.findByCaretakerId(caretakerId)
            .forEach(assignment -> userAssignmentRepository.delete(assignment));
        
        // Remove all permissions
        userPermissionService.deleteAllUserPermissions(caretakerId);
        
        // Delete the user
        userRepository.deleteById(caretakerId);
    }
    
    public void setCaretakerPermissions(UUID caretakerId, List<String> permissionNames, UUID grantedBy) {
        userPermissionService.setUserPermissions(caretakerId, permissionNames, grantedBy);
    }
    
    public List<String> getCaretakerPermissions(UUID caretakerId) {
        return userPermissionService.getUserPermissions(caretakerId);
    }
    
    /**
     * Admin-only method to create any type of user with automatic permission assignment
     */
    public User createUser(String name, String email, String phone, UserType userType, UUID createdBy) {
        // Verify the creator is an admin
        User creator = userRepository.findById(createdBy)
            .orElseThrow(() -> new RuntimeException("Creator not found"));
        
        System.out.println("DEBUG: Creator user type: " + creator.getUserType());
        System.out.println("DEBUG: Expected ADMIN type: " + UserType.ADMIN);
        System.out.println("DEBUG: Are they equal? " + (creator.getUserType() == UserType.ADMIN));
        
        if (creator.getUserType() != UserType.ADMIN) {
            throw new RuntimeException("Only admins can create users. Creator type: " + creator.getUserType());
        }
        
        User newUser = new User();
        newUser.setDisplayName(name);
        newUser.setEmail(email);
        newUser.setPhone(phone);
        newUser.setUserType(userType);
        newUser.setPasswordHash(passwordEncoder.encode("defaultPassword123")); // TODO: Generate secure password
        
        User savedUser = userRepository.save(newUser);
        
        // Assign default permissions based on user type
        assignDefaultPermissions(savedUser, createdBy);
        
        return savedUser;
    }
    
    private void assignDefaultPermissions(User user, UUID grantedBy) {
        switch (user.getUserType()) {
            case ADMIN:
                // Admins get all permissions
                userPermissionService.grantPermission(user.getId(), "VIEW_REMINDERS", grantedBy);
                userPermissionService.grantPermission(user.getId(), "CREATE_REMINDERS", grantedBy);
                userPermissionService.grantPermission(user.getId(), "MEAL_REQUIREMENTS", grantedBy);
                break;
            case CAREGIVER:
                // Caregivers get permissions to manage reminders and meal requirements
                userPermissionService.grantPermission(user.getId(), "VIEW_REMINDERS", grantedBy);
                userPermissionService.grantPermission(user.getId(), "CREATE_REMINDERS", grantedBy);
                userPermissionService.grantPermission(user.getId(), "MEAL_REQUIREMENTS", grantedBy);
                break;
            case RESIDENT:
                // Residents get permissions to view and manage their own reminders
                userPermissionService.grantPermission(user.getId(), "VIEW_REMINDERS", grantedBy);
                userPermissionService.grantPermission(user.getId(), "CREATE_REMINDERS", grantedBy);
                break;
        }
    }
    
    /**
     * Admin-only method to delete any user with proper protection checks
     */
    public void deleteUser(UUID userId, UUID deletedBy) {
        // Verify the deleter is an admin
        User deleter = userRepository.findById(deletedBy)
            .orElseThrow(() -> new RuntimeException("Deleter not found"));
        
        if (deleter.getUserType() != UserType.ADMIN) {
            throw new RuntimeException("Only admins can delete users. Deleter type: " + deleter.getUserType());
        }
        
        // Get the user to be deleted
        User userToDelete = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Check if user can be deleted
        if (!canDeleteUser(userId)) {
            throw new RuntimeException("Cannot delete user: " + userToDelete.getDisplayName() + 
                " (ID: " + userId + ") - user has active assignments or dependencies");
        }
        
        // Delete the user and clean up all related data
        performUserDeletion(userId);
    }
    
    /**
     * Check if a user can be safely deleted
     */
    public boolean canDeleteUser(UUID userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Check if caregiver has assigned caretakers
        if (user.getUserType() == UserType.CAREGIVER) {
            List<User> assignedCaretakers = userAssignmentRepository.findCaretakersByCaregiverId(userId);
            if (!assignedCaretakers.isEmpty()) {
                return false; // Cannot delete caregiver with assigned caretakers
            }
        }
        
        // Check if user has any reminders (optional - you might want to allow deletion with reminders)
        // This is commented out for now, but you can uncomment if needed
        // long reminderCount = reminderRepository.countByUserId(userId);
        // if (reminderCount > 0) {
        //     return false;
        // }
        
        return true;
    }
    
    /**
     * Admin-only method to update any user
     */
    public User updateUser(UUID userId, String name, String email, String phone, UUID updatedBy) {
        // Verify the updater is an admin
        User updater = userRepository.findById(updatedBy)
            .orElseThrow(() -> new RuntimeException("Updater not found"));
        
        if (updater.getUserType() != UserType.ADMIN) {
            throw new RuntimeException("Only admins can update users. Updater type: " + updater.getUserType());
        }
        
        // Get the user to be updated
        User userToUpdate = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Update the user fields
        if (name != null && !name.trim().isEmpty()) {
            userToUpdate.setDisplayName(name);
        }
        if (email != null && !email.trim().isEmpty()) {
            userToUpdate.setEmail(email);
        }
        if (phone != null) {
            userToUpdate.setPhone(phone);
        }
        
        return userRepository.save(userToUpdate);
    }
    
    /**
     * Caregiver can update their assigned caretakers
     */
    public User updateCaretaker(UUID caretakerId, String name, String email, String phone, UUID caregiverId) {
        // Verify the caregiver manages this caretaker
        List<User> assignedCaretakers = userAssignmentRepository.findCaretakersByCaregiverId(caregiverId);
        if (assignedCaretakers.stream().noneMatch(caretaker -> caretaker.getId().equals(caretakerId))) {
            throw new RuntimeException("Caregiver is not assigned to this caretaker");
        }
        
        // Get the caretaker to be updated
        User caretakerToUpdate = userRepository.findById(caretakerId)
            .orElseThrow(() -> new RuntimeException("Caretaker not found"));
        
        // Update the caretaker fields
        if (name != null && !name.trim().isEmpty()) {
            caretakerToUpdate.setDisplayName(name);
        }
        if (email != null && !email.trim().isEmpty()) {
            caretakerToUpdate.setEmail(email);
        }
        if (phone != null) {
            caretakerToUpdate.setPhone(phone);
        }
        
        return userRepository.save(caretakerToUpdate);
    }
    
    /**
     * User can update their own profile
     */
    public User updateProfile(UUID userId, String name, String email, String phone) {
        // Get the user to be updated
        User userToUpdate = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Update the user fields
        if (name != null && !name.trim().isEmpty()) {
            userToUpdate.setDisplayName(name);
        }
        if (email != null && !email.trim().isEmpty()) {
            userToUpdate.setEmail(email);
        }
        if (phone != null) {
            userToUpdate.setPhone(phone);
        }
        
        return userRepository.save(userToUpdate);
    }
    
    /**
     * Get all users (admin only)
     */
    public List<com.attendo.mos.dto.UserInfoResponse> getAllUsers() {
        return userRepository.findAll().stream()
            .map(user -> new com.attendo.mos.dto.UserInfoResponse(
                user.getId(),
                user.getEmail(),
                user.getDisplayName(),
                user.getPhone(),
                user.getUserType(),
                user.isActive(),
                user.getLastLoginAt(),
                user.getCreatedAt()
            ))
            .toList();
    }
    
    /**
     * Find user by ID
     */
    public User findUserById(UUID userId) {
        return userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
    }
    
    /**
     * Perform the actual user deletion with cleanup
     */
    private void performUserDeletion(UUID userId) {
        // Remove all assignments where this user is a caregiver
        userAssignmentRepository.findByCaregiverId(userId)
            .forEach(assignment -> userAssignmentRepository.delete(assignment));
        
        // Remove all assignments where this user is a caretaker
        userAssignmentRepository.findByCaretakerId(userId)
            .forEach(assignment -> userAssignmentRepository.delete(assignment));
        
        // Remove all permissions
        userPermissionService.deleteAllUserPermissions(userId);
        
        // Delete the user
        userRepository.deleteById(userId);
    }
}
