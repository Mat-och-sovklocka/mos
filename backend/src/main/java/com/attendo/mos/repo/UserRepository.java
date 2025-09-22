package com.attendo.mos.repo;

import com.attendo.mos.entity.User;
import com.attendo.mos.dto.UserType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByEmail(String email);
    Optional<User> findByEmailAndIsActiveTrue(String email);
    List<User> findByUserTypeAndIsActiveTrue(UserType userType);
    List<User> findByIsActiveTrue();
}
