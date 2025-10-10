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
    
    public User createCaretaker(String name, String email, UUID caregiverId) {
        User caretaker = new User();
        caretaker.setDisplayName(name);
        caretaker.setEmail(email);
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
    public User createUser(String name, String email, UserType userType, UUID createdBy) {
        // Verify the creator is an admin
        User creator = userRepository.findById(createdBy)
            .orElseThrow(() -> new RuntimeException("Creator not found"));
        
        if (creator.getUserType() != UserType.ADMIN) {
            throw new RuntimeException("Only admins can create users");
        }
        
        User newUser = new User();
        newUser.setDisplayName(name);
        newUser.setEmail(email);
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
                // Residents get basic view permissions
                userPermissionService.grantPermission(user.getId(), "VIEW_REMINDERS", grantedBy);
                break;
        }
    }
}
