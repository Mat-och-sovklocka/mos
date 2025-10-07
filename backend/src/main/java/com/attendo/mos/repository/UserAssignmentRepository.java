package com.attendo.mos.repository;

import com.attendo.mos.entity.UserAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserAssignmentRepository extends JpaRepository<UserAssignment, UUID> {
    
    List<UserAssignment> findByCaregiverId(UUID caregiverId);
    
    List<UserAssignment> findByCaretakerId(UUID caretakerId);
    
    Optional<UserAssignment> findByCaregiverIdAndCaretakerId(UUID caregiverId, UUID caretakerId);
    
    @Query("SELECT ua.caretaker FROM UserAssignment ua WHERE ua.caregiver.id = :caregiverId")
    List<com.attendo.mos.entity.User> findCaretakersByCaregiverId(@Param("caregiverId") UUID caregiverId);
    
    @Query("SELECT ua.caregiver FROM UserAssignment ua WHERE ua.caretaker.id = :caretakerId")
    Optional<com.attendo.mos.entity.User> findCaregiverByCaretakerId(@Param("caretakerId") UUID caretakerId);
    
    boolean existsByCaregiverIdAndCaretakerId(UUID caregiverId, UUID caretakerId);
    
    void deleteByCaregiverIdAndCaretakerId(UUID caregiverId, UUID caretakerId);
}
