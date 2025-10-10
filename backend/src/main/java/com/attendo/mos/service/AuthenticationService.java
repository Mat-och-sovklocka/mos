package com.attendo.mos.service;

import com.attendo.mos.config.JwtUtil;
import com.attendo.mos.dto.LoginRequest;
import com.attendo.mos.dto.LoginResponse;
import com.attendo.mos.dto.UserInfoResponse;
import com.attendo.mos.dto.UserType;
import com.attendo.mos.entity.User;
import com.attendo.mos.repo.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.util.UUID;

@Service
public class AuthenticationService {
    
    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;
    private final PasswordEncoder passwordEncoder;
    
    public AuthenticationService(UserRepository userRepository, 
                               JwtUtil jwtUtil, 
                               PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.jwtUtil = jwtUtil;
        this.passwordEncoder = passwordEncoder;
    }
    
    public LoginResponse authenticate(LoginRequest loginRequest) {
        User user = userRepository.findByEmail(loginRequest.email())
            .orElseThrow(() -> new IllegalArgumentException("Invalid email or password"));
        
        if (!passwordEncoder.matches(loginRequest.password(), user.getPasswordHash())) {
            throw new IllegalArgumentException("Invalid email or password");
        }
        
        // Update last login
        user.setLastLoginAt(OffsetDateTime.now());
        userRepository.save(user);
        
        // Generate JWT token
        String token = jwtUtil.generateToken(user.getId(), user.getEmail(), user.getUserType());
        OffsetDateTime expiresAt = jwtUtil.getExpirationFromToken(token);
        
        return LoginResponse.of(
            token,
            "Bearer",
            user.getId(),
            user.getEmail(),
            user.getDisplayName(),
            user.getUserType(),
            expiresAt
        );
    }
    
    public UserInfoResponse getUserInfo(UUID userId) {
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
}
