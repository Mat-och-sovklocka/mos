package com.attendo.mos.repo;

import com.attendo.mos.entity.Reminder;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ReminderRepository extends JpaRepository<Reminder, UUID> {
    List<Reminder> findByUser_IdOrderByTimeAsc(UUID userId);
    void deleteByIdAndUser_Id(UUID id, UUID userId);
}
