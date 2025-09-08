package com.attendo.mos.entity;

import java.time.OffsetDateTime;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Table(name = "reminder")
@Data
public class Reminder {
    @Id
    @GeneratedValue
    private UUID id;
    private OffsetDateTime time;
    @Column(name = "category_code")
    private String categoryCode; // TEXT in DB
    @Column(length = 280)
    private String note;
    private OffsetDateTime createdAt;
}
