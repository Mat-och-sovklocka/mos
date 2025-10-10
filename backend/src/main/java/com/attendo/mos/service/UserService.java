package com.attendo.mos.service;

import com.attendo.mos.dto.UserInfoResponse;
import com.attendo.mos.dto.UserType;
import com.attendo.mos.entity.User;
import com.attendo.mos.repo.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class UserService {
    
    private final UserRepository userRepository;
    
    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }
    
    public UserInfoResponse getUserById(UUID userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new IllegalArgumentException("User not found"));
        
        return new UserInfoResponse(
            user.getId(),
            user.getEmail(),
            user.getDisplayName(),
            user.getPhone(),
            user.getUserType(),
            user.isActive(),
            user.getLastLoginAt(),
            user.getCreatedAt()
        );
    }
    
    public List<UserInfoResponse> getAllUsers() {
        return userRepository.findAll().stream()
            .map(user -> new UserInfoResponse(
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
    
    public User findUserByEmail(String email) {
        return userRepository.findByEmail(email)
            .orElseThrow(() -> new IllegalArgumentException("User not found"));
    }
    
    public User findUserById(UUID userId) {
        return userRepository.findById(userId)
            .orElseThrow(() -> new IllegalArgumentException("User not found"));
    }
}
