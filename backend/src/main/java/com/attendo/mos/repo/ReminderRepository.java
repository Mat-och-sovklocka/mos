package com.attendo.mos.repo;

import com.attendo.mos.entity.Reminder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.UUID;

public interface ReminderRepository extends JpaRepository<Reminder, UUID> {
    @Query("select r from Reminder r " +
            "where r.user.id = :userId " +
            "order by coalesce(r.time, r.createdAt) asc")
    List<Reminder> listForUser(UUID userId);
    void deleteByIdAndUser_Id(UUID id, UUID userId);
}
