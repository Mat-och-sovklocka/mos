# Frontend Authentication Integration Guide

## 🔐 **Authentication Endpoints**

### **Base URL**: `http://localhost:8080/api/auth`

---

## 📡 **API Endpoints**

### **1. Login**
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Success Response (200)**:
```json
{
  "token": "eyJhbGciOiJIUzUxMiJ9...",
  "tokenType": "Bearer",
  "userId": "550e8400-e29b-41d4-a716-446655440001",
  "email": "user@example.com",
  "displayName": "User Name",
  "userType": "ADMIN",
  "expiresAt": "2024-09-23T13:15:00Z"
}
```

**Error Response (401)**:
```json
"Invalid email or password"
```

### **2. Get Current User Info**
```http
GET /api/auth/me
Authorization: Bearer <jwt_token>
```

**Success Response (200)**:
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440001",
  "email": "user@example.com",
  "displayName": "User Name",
  "userType": "ADMIN",
  "isActive": true,
  "lastLoginAt": "2024-09-22T13:15:00Z",
  "createdAt": "2024-09-01T10:00:00Z"
}
```

### **3. Logout**
```http
POST /api/auth/logout
Authorization: Bearer <jwt_token>
```

**Success Response (200)**:
```json
"Logout successful"
```

---

## 👥 **User Types**

| Type | Description |
|------|-------------|
| `ADMIN` | Full system access |
| `CAREGIVER` | Can manage assigned residents |
| `RESIDENT` | Limited access, read-only |

---

## 🧪 **Test Users Available**

| Email | Password | Type | Display Name |
|-------|----------|------|--------------|
| `admin@mos.test` | `password123` | ADMIN | System Administrator |
| `caregiver1@mos.test` | `password123` | CAREGIVER | Anna Andersson |
| `caregiver2@mos.test` | `password123` | CAREGIVER | Erik Eriksson |
| `resident1@mos.test` | `password123` | RESIDENT | Maria Svensson |
| `resident2@mos.test` | `password123` | RESIDENT | Lars Larsson |
| `resident3@mos.test` | `password123` | RESIDENT | Ingrid Johansson |

---

## 💻 **Frontend Implementation Example**

### **Login Form Component**
```javascript
const handleLogin = async (email, password) => {
  try {
    const response = await fetch('http://localhost:8080/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (response.ok) {
      const data = await response.json();
      
      // Store token in localStorage or secure storage
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('userInfo', JSON.stringify({
        userId: data.userId,
        email: data.email,
        displayName: data.displayName,
        userType: data.userType
      }));
      
      // Redirect to dashboard or main app
      navigate('/dashboard');
    } else {
      const error = await response.text();
      setError(error); // "Invalid email or password"
    }
  } catch (error) {
    setError('Login failed. Please try again.');
  }
};
```

### **API Request Helper**
```javascript
const apiRequest = async (url, options = {}) => {
  const token = localStorage.getItem('authToken');
  
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  };

  return fetch(`http://localhost:8080${url}`, config);
};
```

### **Get Current User**
```javascript
const getCurrentUser = async () => {
  try {
    const response = await apiRequest('/api/auth/me');
    
    if (response.ok) {
      return await response.json();
    } else {
      // Token might be expired, redirect to login
      localStorage.removeItem('authToken');
      localStorage.removeItem('userInfo');
      navigate('/login');
    }
  } catch (error) {
    console.error('Failed to get user info:', error);
  }
};
```

### **Logout**
```javascript
const handleLogout = async () => {
  try {
    await apiRequest('/api/auth/logout', { method: 'POST' });
  } catch (error) {
    console.error('Logout request failed:', error);
  } finally {
    // Always clear local storage
    localStorage.removeItem('authToken');
    localStorage.removeItem('userInfo');
    navigate('/login');
  }
};
```

---

## 🔒 **Security Notes**

1. **Token Storage**: Store JWT tokens securely (consider using httpOnly cookies in production)
2. **Token Expiration**: Tokens expire after 24 hours
3. **Authorization**: Include `Authorization: Bearer <token>` header for protected endpoints
4. **CORS**: Backend is configured for `http://localhost:3000` (React dev server)

---

## 🚨 **Error Handling**

| Status Code | Description | Action |
|-------------|-------------|---------|
| 200 | Success | Proceed with response data |
| 401 | Unauthorized | Redirect to login page |
| 400 | Bad Request | Show validation errors |
| 500 | Server Error | Show generic error message |

---

## 📝 **Next Steps**

1. Create login form with email/password fields
2. Implement token storage and management
3. Add authentication context/state management
4. Create protected route components
5. Add logout functionality
6. Implement user role-based UI restrictions

---

*Last updated: September 22, 2024*
