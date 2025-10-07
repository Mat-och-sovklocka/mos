# Caretaker Login and Offline Strategy

## Overview

This document outlines strategies for handling app usage by caretakers who may have limited capabilities for traditional email/password authentication, and addresses offline functionality requirements for the PWA.

## Practical Login Solutions for Limited-Capability Users

### 1. QR Code Login (Recommended) 📱

**How it works:**
- Caregiver generates QR code with embedded login token
- Caretaker scans QR code with device camera
- Automatic login without typing anything
- Time-limited tokens (e.g., 24 hours) for security

**Implementation:**
```javascript
// Caregiver generates QR code
const qrData = {
  userId: caretakerId,
  token: generateTemporaryToken(caretakerId, 24), // 24 hour expiry
  permissions: userPermissions
};

// Caretaker scans QR code
// App automatically logs in with embedded token
```

**Advantages:**
- ✅ No typing required
- ✅ Works with any device with camera
- ✅ Time-limited for security
- ✅ Easy for caregivers to generate

### 2. Simple PIN System 🔢

**How it works:**
- 4-6 digit PIN instead of complex passwords
- Caregiver sets PIN for each caretaker
- Easy to remember and input
- Can be changed by caregiver when needed

**Implementation:**
```javascript
// Simple PIN login endpoint
POST /api/auth/pin-login
{
  "userId": "uuid",
  "pin": "1234"
}
```

**Advantages:**
- ✅ Simple to remember
- ✅ Quick to input
- ✅ Familiar concept
- ✅ Easy to change

### 3. Proximity-Based Login 📡

**How it works:**
- NFC tags or Bluetooth beacons in the room
- Automatic login when device is near the tag
- Good for fixed locations (bedroom, kitchen, etc.)

**Advantages:**
- ✅ Completely hands-free
- ✅ Good for fixed locations
- ✅ No memorization needed

### 4. Biometric Login (Future) 👆

**How it works:**
- Fingerprint or face recognition
- Most user-friendly but requires mobile app
- Very secure and no memorization needed

**Advantages:**
- ✅ Most user-friendly
- ✅ Very secure
- ✅ No memorization needed

## QR Code Login Persistence Strategy

### Session Management

**Challenge:** How to ensure caretaker stays logged in after QR code scan?

**Solution:**
```javascript
// When QR code is scanned:
1. Generate long-lived refresh token (30 days)
2. Store in secure browser storage (not localStorage)
3. Auto-refresh access tokens in background
4. Graceful logout only when refresh token expires

// Implementation:
const loginWithQR = (qrData) => {
  // Store refresh token securely
  sessionStorage.setItem('mos_refresh_token', qrData.refreshToken);
  
  // Set up auto-refresh
  setInterval(refreshAccessToken, 30 * 60 * 1000); // Every 30 minutes
  
  // Handle offline/online sync
  setupOfflineSync();
};
```

### Security Considerations

- **Refresh tokens** expire after 30 days (caregiver can regenerate QR)
- **Access tokens** expire every 2-4 hours (auto-refreshed)
- **Device binding** (tie token to device fingerprint)
- **Caregiver can revoke** access remotely

## PWA Offline Strategy

### Data Storage Options

```javascript
// 1. IndexedDB for complex data
const offlineDB = {
  reminders: [],
  mealRequirements: [],
  userProfile: {},
  lastSync: timestamp
};

// 2. Service Worker for caching
// 3. Background sync when online
```

### Sync Strategy

```javascript
// When online:
- Sync pending changes to server
- Download latest data
- Resolve conflicts (server wins for now)

// When offline:
- Store changes locally
- Show "offline mode" indicator
- Queue actions for later sync
```

## Implementation Phases

### Phase 1: QR Code System (Immediate)
- Implement QR code generation for caregivers
- Add QR code scanning for caretakers
- Long-lived refresh tokens (30 days)
- Auto-refresh mechanism

### Phase 2: PIN System (Backup)
- Simple PIN login endpoint
- PIN management for caregivers
- Fallback when QR code fails

### Phase 3: Offline Functionality
- IndexedDB for local storage
- Service Worker for caching
- Background sync when online
- Offline mode indicators

### Phase 4: Advanced Features (Future)
- Biometric authentication
- NFC/Bluetooth proximity login
- Advanced conflict resolution
- Real-time sync

## Technical Requirements

### Backend Changes Needed
- QR code generation endpoint
- PIN-based authentication
- Long-lived refresh tokens
- Device binding for security
- Offline sync endpoints

### Frontend Changes Needed
- QR code scanner integration
- PIN input interface
- Offline storage (IndexedDB)
- Service Worker implementation
- Background sync logic

### PWA Configuration
- Service Worker registration
- Offline caching strategies
- Background sync API
- Push notifications for sync status

## Questions for Stakeholders

### Technical Infrastructure
1. **Server Access**: Do they have cloud infrastructure or on-premise?
2. **Data Sync**: How critical is real-time sync vs. eventual consistency?
3. **Offline Duration**: How long might users be offline?
4. **Conflict Resolution**: What happens if data changes offline and online?

### User Experience
1. **Device Access**: Do caretakers have smartphones/tablets?
2. **Physical Capabilities**: What are their typical limitations?
3. **Location**: Are they in fixed locations or mobile?
4. **Security Level**: How sensitive is the data?
5. **Caregiver Availability**: How often can caregivers assist with login?

### Business Requirements
1. **Compliance**: Any specific security/compliance requirements?
2. **Scalability**: How many users need offline access?
3. **Maintenance**: Who will manage QR code generation?
4. **Training**: How will caregivers learn the new system?

## Recommended Approach

### Hybrid Strategy
- **Primary**: QR code login (most accessible)
- **Backup**: Simple PIN system
- **Emergency**: Caregiver can log in remotely
- **Offline**: Local storage with background sync

### Implementation Priority
1. **QR Code System** - Solves immediate accessibility needs
2. **Basic Offline Storage** - Essential for PWA functionality
3. **PIN Backup System** - Provides fallback option
4. **Advanced Offline Sync** - Enhances user experience

## Security Considerations

### Token Management
- Short-lived access tokens (2-4 hours)
- Long-lived refresh tokens (30 days)
- Secure token storage (sessionStorage, not localStorage)
- Device fingerprinting for additional security

### Access Control
- Caregiver can revoke access remotely
- QR codes expire automatically
- PIN can be changed by caregiver
- Audit trail for all login attempts

### Data Protection
- Encrypted local storage
- Secure transmission (HTTPS)
- Minimal data stored offline
- Automatic cleanup of expired data

## Success Metrics

### User Experience
- Login success rate > 95%
- Time to login < 30 seconds
- Offline functionality availability > 90%
- User satisfaction scores

### Technical Performance
- App load time < 3 seconds
- Sync success rate > 99%
- Offline data accuracy > 95%
- Battery usage optimization

---

*This document should be reviewed and updated based on stakeholder feedback and technical requirements.*
