package com.attendo.mos.entity;

import com.attendo.mos.dto.Category;
import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.Map;
import java.util.UUID;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.UuidGenerator;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "reminder")
public class Reminder {
    @Id
    @GeneratedValue
    @UuidGenerator

    private UUID id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "time_at", nullable = false)
    private OffsetDateTime time;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 40)
    private Category category;

    private String note;

    private OffsetDateTime createdAt = OffsetDateTime.now(ZoneOffset.UTC);

    @Column(nullable = false, length = 20)
    private String type = "once"; // "once" | "recurring"

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private Map<String, Object> recurrence; // null for once

    // getters/setters
    public String getType() {
        return type;
    }
    
    public void setType(String type) {
        this.type = type;
    }

    public Map<String, Object> getRecurrence() {
        return recurrence;
    }

    public void setRecurrence(Map<String, Object> recurrence) {
        this.recurrence = recurrence;
    }

    public UUID getId() {
        return id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public OffsetDateTime getTime() {
        return time;
    }

    public void setTime(OffsetDateTime time) {
        this.time = time;
    }

    public Category getCategory() {
        return category;
    }

    public void setCategory(Category category) {
        this.category = category;
    }

    public String getNote() {
        return note;
    }

    public void setNote(String note) {
        this.note = note;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(OffsetDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
