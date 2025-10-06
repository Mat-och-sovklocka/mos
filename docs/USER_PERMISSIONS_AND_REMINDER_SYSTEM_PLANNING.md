# User Permissions and Reminder System Planning

## Overview
This document outlines the proposed changes to implement granular user permissions and a comprehensive reminder delivery/tracking system. These changes will significantly impact the current system architecture and require careful planning with stakeholders.

## 🎯 Path of Minimal Resistance for Permissions

### Phase 1: Quick & Dirty (Get it working)
**Database Changes:**
- Add `assigned_caregiver_id` to users table
- Add `feature_permissions` JSON column to users table
  ```json
  {
    "reminders": true,
    "meal_requirements": false,
    "statistics": true
  }
  ```

**Backend Changes:**
- Add permission checks in services (not controllers)
- Simple logic: "Can this user access this feature for this resident?"
- Filter data based on user relationships

**Frontend Changes:**
- Hide/show UI elements based on permissions
- Route guards for different user types
- Role-based navigation

### Phase 2: Proper Admin Interface (Later)
- User management UI
- Permission assignment interface
- Bulk operations
- System configuration

## 🔔 Reminder Delivery & Tracking System

### Reminder States
```
- PENDING (not yet due)
- SENT (delivered, waiting for response)
- COMPLETED (user confirmed)
- MISSED (timeout without response)
- CANCELLED (user cancelled)
```

### Delivery Options
1. **Push notifications** (mobile app) - Future implementation
2. **Email** (simple but not real-time)
3. **SMS** (expensive but reliable)
4. **In-app notifications** (only when app is open)
5. **Dashboard alerts** (for caregivers)

### Completion Tracking
- **Simple timeout**: 30 minutes after due time = MISSED
- **Smart timeout**: Different timeouts per reminder type
- **Escalation**: Missed reminders notify caregiver

### Key Questions for Stakeholders
1. **Who gets the reminder?** Resident? Caregiver? Both?
2. **How do they respond?** Mobile app? Web interface?
3. **What if they don't respond?** Escalate to caregiver?
4. **What if they're offline?** Queue for when they're back?

### Minimal Resistance Approach
Start with **in-app notifications only** - no external delivery. Just show reminders in the UI when users log in. Much simpler to implement and test!

## 🔐 Login/Account Management for Limited Users

### The Problem
If a resident can only tap "OK" on reminders, how do they even log in? Current email/password system may not be suitable for users with limited capabilities.

### Proposed Solutions

#### 1. QR Code Login (Recommended)
- Caregiver generates QR code → Resident scans → Auto-login
- No typing required
- Secure (time-limited codes)
- Easy for residents with limited mobility

#### 2. Simple PIN System
- Resident gets assigned a 4-6 digit PIN
- Much easier than email/password
- Can be written down or memorized
- Still secure enough for limited access

#### 3. Caregiver-Assisted Login
- Caregiver logs in → "Switch to resident view" → Select resident
- No resident login needed
- Caregiver manages everything
- Resident just sees their reminders

#### 4. Device-Based Login
- Tablet/device stays logged in for specific resident
- No login required
- Device is "resident's device"
- Caregiver can switch users if needed

#### 5. Biometric Login
- Fingerprint/face recognition
- No typing at all
- Very user-friendly
- But requires hardware support

### Key Question for Stakeholders
**Who is the primary user of the resident interface?**
- The resident themselves?
- A caregiver helping the resident?
- A family member?

## 📊 Current vs. Proposed User Types

### Current (Simple)
- **ADMIN** - Full access to everything
- **CAREGIVER** - Care staff access
- **RESIDENT** - Resident access

### Proposed (Granular)
- **ADMIN** - Admin features only (no reminder/meal management)
- **CAREGIVER** - Assigned to specific residents with configurable permissions
- **RESIDENT** - Access controlled by their assigned caregiver

## 🔄 Data Access Model

### Admin
- System configuration data
- User management
- System-wide statistics
- **No access to personal resident data**

### Caregiver
- All assigned residents' data
- Permission management for assigned residents
- Reminder management for assigned residents
- Meal requirements for assigned residents

### Resident
- Only their own data
- Limited to features enabled by caregiver
- Simple interface (reminders, meal requirements if enabled)

## 🚀 Implementation Phases

### Phase 1: Basic Permissions (2-3 weeks)
- Database schema changes
- Basic permission checking
- UI hiding/showing based on permissions
- Simple login alternatives

### Phase 2: Reminder System (3-4 weeks)
- Reminder state management
- In-app notifications
- Completion tracking
- Timeout handling

### Phase 3: Admin Interface (2-3 weeks)
- User management UI
- Permission assignment interface
- System configuration

### Phase 4: Advanced Features (4-6 weeks)
- Push notifications
- Email/SMS delivery
- Mobile app integration
- Advanced reporting

## 💰 Resource Requirements

### Development Time
- **Total estimated**: 11-16 weeks
- **Critical path**: Permission system → Reminder system → Admin interface

### Technical Dependencies
- Mobile app development (for push notifications)
- Email/SMS service integration
- Biometric hardware (if chosen)

### Testing Requirements
- User acceptance testing with actual residents
- Caregiver workflow testing
- Security testing for permission system

## 🎯 Success Criteria

### Phase 1 Success
- Caregivers can assign permissions to residents
- Residents can only access enabled features
- Simple login methods work for limited users

### Phase 2 Success
- Reminders are delivered and tracked
- Completion status is recorded
- Timeout handling works correctly

### Overall Success
- System is usable by all user types
- Caregivers can effectively manage residents
- Residents have appropriate access to features
- Admin can manage system configuration

## 📋 Questions for Stakeholder Discussion

### User Experience
1. Who will primarily use the resident interface?
2. What level of technical capability do residents have?
3. How should login work for users with limited capabilities?

### Permissions
1. What specific features should caregivers be able to enable/disable?
2. Should permissions be per-feature or per-resident?
3. How should permission changes be communicated to residents?

### Reminders
1. Who should receive reminder notifications?
2. How should missed reminders be handled?
3. What timeout periods make sense for different reminder types?

### Technical
1. Is a mobile app required for the initial release?
2. What devices will residents primarily use?
3. What level of offline functionality is needed?

## 🔧 Technical Considerations

### Database Changes
- User assignment tables
- Permission configuration
- Reminder state tracking
- Audit logging

### Security
- Permission validation at API level
- Secure QR code generation
- Session management for different user types

### Performance
- Efficient permission checking
- Scalable reminder delivery
- Optimized queries for filtered data

### Maintenance
- Permission audit trails
- Reminder delivery logs
- User activity monitoring

---

**Note**: This is a significant architectural change that will affect the entire system. The current service layer architecture provides a solid foundation for implementing these changes cleanly.
