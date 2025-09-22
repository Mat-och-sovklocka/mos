package com.attendo.mos.controller;

import com.attendo.mos.config.JwtUtil;
import com.attendo.mos.dto.LoginRequest;
import com.attendo.mos.dto.LoginResponse;
import com.attendo.mos.dto.UserInfoResponse;
import com.attendo.mos.entity.User;
import com.attendo.mos.repo.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.OffsetDateTime;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:3000")
@Tag(name = "Authentication", description = "Authentication endpoints")
public class AuthenticationController {

    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;
    private final BCryptPasswordEncoder passwordEncoder;

    public AuthenticationController(UserRepository userRepository, JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.jwtUtil = jwtUtil;
        this.passwordEncoder = new BCryptPasswordEncoder();
    }

    @PostMapping("/login")
    @Operation(summary = "User login", description = "Authenticate user and return JWT token")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Login successful"),
        @ApiResponse(responseCode = "401", description = "Invalid credentials"),
        @ApiResponse(responseCode = "400", description = "Invalid request")
    })
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest loginRequest) {
        try {
            // Find user by email
            User user = userRepository.findByEmailAndIsActiveTrue(loginRequest.email())
                .orElse(null);

            if (user == null || !passwordEncoder.matches(loginRequest.password(), user.getPasswordHash())) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Invalid email or password");
            }

            // Update last login time
            user.setLastLoginAt(OffsetDateTime.now());
            userRepository.save(user);

            // Generate JWT token
            String token = jwtUtil.generateToken(user.getId(), user.getEmail(), user.getUserType());
            OffsetDateTime expiresAt = jwtUtil.getExpirationFromToken(token);

            LoginResponse response = LoginResponse.of(
                token,
                "Bearer",
                user.getId(),
                user.getEmail(),
                user.getDisplayName(),
                user.getUserType(),
                expiresAt
            );

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Login failed: " + e.getMessage());
        }
    }

    @GetMapping("/me")
    @Operation(summary = "Get current user info", description = "Get information about the currently authenticated user")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "User info retrieved successfully"),
        @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<?> getCurrentUser(@RequestHeader("Authorization") String authHeader) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Missing or invalid authorization header");
            }

            String token = authHeader.substring(7);
            
            if (!jwtUtil.validateToken(token)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Invalid token");
            }

            UUID userId = jwtUtil.getUserIdFromToken(token);
            User user = userRepository.findById(userId).orElse(null);

            if (user == null || !user.isActive()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("User not found or inactive");
            }

            UserInfoResponse response = new UserInfoResponse(
                user.getId(),
                user.getEmail(),
                user.getDisplayName(),
                user.getUserType(),
                user.isActive(),
                user.getLastLoginAt(),
                user.getCreatedAt()
            );

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Failed to get user info: " + e.getMessage());
        }
    }

    @PostMapping("/logout")
    @Operation(summary = "User logout", description = "Logout user (client-side token removal)")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Logout successful")
    })
    public ResponseEntity<String> logout() {
        // For JWT, logout is handled client-side by removing the token
        // Server-side logout would require token blacklisting (not implemented here)
        return ResponseEntity.ok("Logout successful");
    }
}
