# Reminder API Integration Guide

## 🔔 **Reminder Endpoints**

### **Base URL**: `http://localhost:8080/api/users/{userId}/reminders`

---

## 📡 **API Endpoints**

### **1. Create Reminder**
```http
POST /api/users/{userId}/reminders
Content-Type: application/json
Authorization: Bearer <jwt_token>

{
  "type": "once",
  "category": "meal",
  "dateTime": "2024-09-23T12:00:00Z",
  "note": "Lunch reminder"
}
```

**Success Response (201)**:
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440001",
  "time": "2024-09-23T12:00:00Z",
  "category": "MEAL",
  "note": "Lunch reminder",
  "createdAt": "2024-09-22T13:15:00Z",
  "type": "once",
  "recurrence": null
}
```

**Error Response (400)**:
```json
{
  "error": "Bad Request",
  "message": "dateTime required for type=once"
}
```

### **2. Create Recurring Reminder**
```http
POST /api/users/{userId}/reminders
Content-Type: application/json
Authorization: Bearer <jwt_token>

{
  "type": "recurring",
  "category": "medication",
  "days": ["Mon", "Wed", "Fri"],
  "times": ["08:00", "20:00"],
  "note": "Morning and evening medication"
}
```

### **3. Get User's Reminders**
```http
GET /api/users/{userId}/reminders
Authorization: Bearer <jwt_token>
```

**Success Response (200)**:
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "type": "once",
    "category": "MEAL",
    "note": "Lunch reminder",
    "dateTime": "2024-09-23T12:00:00Z",
    "days": null,
    "times": null,
    "createdAt": "2024-09-22T13:15:00Z"
  },
  {
    "id": "550e8400-e29b-41d4-a716-446655440002",
    "type": "recurring",
    "category": "MEDICATION",
    "note": "Morning medication",
    "dateTime": null,
    "days": ["Mon", "Wed", "Fri"],
    "times": ["08:00"],
    "createdAt": "2024-09-22T13:15:00Z"
  }
]
```

### **4. Delete Reminder**
```http
DELETE /api/users/{userId}/reminders/{reminderId}
Authorization: Bearer <jwt_token>
```

**Success Response (204)**: No content

---

## 📋 **Request Fields**

### **CreateReminderRequest**

| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `type` | String | ✅ | "once" or "recurring" | "once" |
| `category` | String | ✅ | Category name (see below) | "meal" |
| `dateTime` | OffsetDateTime | ⚠️ | Required for type="once" | "2024-09-23T12:00:00Z" |
| `days` | String[] | ⚠️ | Required for type="recurring" | ["Mon", "Wed", "Fri"] |
| `times` | String[] | ⚠️ | Required for type="recurring" | ["08:00", "20:00"] |
| `note` | String | ❌ | Optional note | "Lunch reminder" |

---

## 🏷️ **Valid Categories**

| Category | Description | Valid Values |
|----------|-------------|--------------|
| **MEAL** | Meal reminders | `"meal"`, `"meals"`, `"måltider"`, `"maltdier"` |
| **MEDICATION** | Medication reminders | `"medication"`, `"medicine"`, `"medicin"` |
| **OTHER** | Other reminders | `"other"` |

---

## 💻 **Frontend Implementation Examples**

### **Create Once Reminder**
```javascript
const createOnceReminder = async (userId, reminderData) => {
  try {
    const response = await fetch(`http://localhost:8080/api/users/${userId}/reminders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      },
      body: JSON.stringify({
        type: 'once',
        category: 'meal',
        dateTime: reminderData.dateTime, // ISO string
        note: reminderData.note
      })
    });

    if (response.ok) {
      const reminder = await response.json();
      console.log('Reminder created:', reminder);
      return reminder;
    } else {
      const error = await response.json();
      console.error('Error creating reminder:', error.message);
      throw new Error(error.message);
    }
  } catch (error) {
    console.error('Failed to create reminder:', error);
    throw error;
  }
};
```

### **Create Recurring Reminder**
```javascript
const createRecurringReminder = async (userId, reminderData) => {
  try {
    const response = await fetch(`http://localhost:8080/api/users/${userId}/reminders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      },
      body: JSON.stringify({
        type: 'recurring',
        category: 'medication',
        days: reminderData.days, // ["Mon", "Wed", "Fri"]
        times: reminderData.times, // ["08:00", "20:00"]
        note: reminderData.note
      })
    });

    if (response.ok) {
      const reminder = await response.json();
      console.log('Recurring reminder created:', reminder);
      return reminder;
    } else {
      const error = await response.json();
      console.error('Error creating reminder:', error.message);
      throw new Error(error.message);
    }
  } catch (error) {
    console.error('Failed to create reminder:', error);
    throw error;
  }
};
```

### **Get User's Reminders**
```javascript
const getUserReminders = async (userId) => {
  try {
    const response = await fetch(`http://localhost:8080/api/users/${userId}/reminders`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      }
    });

    if (response.ok) {
      const reminders = await response.json();
      return reminders;
    } else {
      console.error('Failed to fetch reminders');
      return [];
    }
  } catch (error) {
    console.error('Error fetching reminders:', error);
    return [];
  }
};
```

### **Delete Reminder**
```javascript
const deleteReminder = async (userId, reminderId) => {
  try {
    const response = await fetch(`http://localhost:8080/api/users/${userId}/reminders/${reminderId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      }
    });

    if (response.status === 204) {
      console.log('Reminder deleted successfully');
      return true;
    } else {
      console.error('Failed to delete reminder');
      return false;
    }
  } catch (error) {
    console.error('Error deleting reminder:', error);
    return false;
  }
};
```

---

## 🚨 **Common Issues & Solutions**

### **1. "User not found" Error**
- **Cause**: Invalid `userId` in URL
- **Solution**: Ensure you're using a valid UUID for the user

### **2. "dateTime required for type=once" Error**
- **Cause**: Missing `dateTime` field for once-type reminders
- **Solution**: Always include `dateTime` when `type` is "once"

### **3. "category is required" Error**
- **Cause**: Missing or empty `category` field
- **Solution**: Use one of the valid category values (see table above)

### **4. Authentication Errors**
- **Cause**: Missing or invalid JWT token
- **Solution**: Ensure user is logged in and token is included in Authorization header

---

## 📝 **Date/Time Format**

- **Input**: ISO 8601 format with timezone
- **Example**: `"2024-09-23T12:00:00Z"` (UTC)
- **JavaScript**: Use `new Date().toISOString()` to generate

---

## 🔄 **Recurring Reminder Rules**

- **Days**: Use abbreviated day names: `["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]`
- **Times**: Use 24-hour format: `["08:00", "14:30", "20:00"]`
- **Combination**: Each time applies to all selected days

---

*Last updated: September 22, 2024*
