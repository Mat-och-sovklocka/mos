#!/bin/bash

# Quick API Testing Script
BASE_URL="http://localhost:8080/api"

echo "🚀 Quick API Test Suite"
echo "======================="

# 1. Login and get token
echo "1. Logging in as admin..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@mos.test","password":"admin123"}')

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
echo "✅ Token: ${TOKEN:0:20}..."

# 2. Test create reminder
echo "2. Creating reminder..."
REMINDER_RESPONSE=$(curl -s -X POST "$BASE_URL/users/550e8400-e29b-41d4-a716-446655440001/reminders" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "type": "once",
    "category": "meal",
    "dateTime": "2024-01-25T12:00:00Z",
    "note": "Quick test reminder"
  }')

echo "✅ Reminder created: $REMINDER_RESPONSE"

# 3. Test get reminders
echo "3. Getting reminders..."
GET_RESPONSE=$(curl -s -X GET "$BASE_URL/users/550e8400-e29b-41d4-a716-446655440001/reminders" \
  -H "Authorization: Bearer $TOKEN")

echo "✅ Reminders: $GET_RESPONSE"

echo "🎉 All tests completed!"
