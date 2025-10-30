#!/bin/bash

# Quick API Testing Script
BASE_URL="http://localhost:8080/api"

echo "🚀 Quick API Test Suite"
echo "======================="

# 1. Login and get tokens
echo "1. Logging in as admin..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@mos.test","password":"admin123"}')
ADMIN_TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^\"]*"' | cut -d'"' -f4)
echo "✅ Admin token: ${ADMIN_TOKEN:0:20}..."

echo "1b. Logging in as caregiver..."
CARE_LOGIN=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"caregiver1@mos.test","password":"password123"}')
CAREGIVER_TOKEN=$(echo "$CARE_LOGIN" | grep -o '"token":"[^\"]*"' | cut -d'"' -f4)
echo "✅ Caregiver token: ${CAREGIVER_TOKEN:0:20}..."

RESIDENT_ID="550e8400-e29b-41d4-a716-446655440001"

# 2. Current user info (admin)
echo "2. Getting current user (admin)..."
ME_RESPONSE=$(curl -s -X GET "$BASE_URL/auth/me" \
  -H "Authorization: Bearer $ADMIN_TOKEN")
echo "✅ /auth/me: $ME_RESPONSE"

# 3. Create reminder (caregiver for resident)
echo "3. Creating reminder (caregiver → resident)..."
REMINDER_RESPONSE=$(curl -s -X POST "$BASE_URL/users/$RESIDENT_ID/reminders" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $CAREGIVER_TOKEN" \
  -d '{
    "type": "once",
    "category": "medication",
    "dateTime": "2025-01-20T10:00:00Z",
    "note": "Quick test reminder"
  }')
echo "✅ Reminder created: $REMINDER_RESPONSE"

# Try to extract reminderId with jq if available
if command -v jq >/dev/null 2>&1; then
  REMINDER_ID=$(echo "$REMINDER_RESPONSE" | jq -r '.id // empty')
else
  REMINDER_ID=""
fi

# 4. Get reminders (caregiver)
echo "4. Getting reminders (caregiver)..."
GET_RESPONSE=$(curl -s -X GET "$BASE_URL/users/$RESIDENT_ID/reminders" \
  -H "Authorization: Bearer $CAREGIVER_TOKEN")
echo "✅ Reminders: $GET_RESPONSE"

# 5. Update reminder (if id available)
if [ -n "$REMINDER_ID" ] && [ "$REMINDER_ID" != "null" ]; then
  echo "5. Updating reminder $REMINDER_ID..."
  UPDATE_RESPONSE=$(curl -s -X PUT "$BASE_URL/users/$RESIDENT_ID/reminders/$REMINDER_ID" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $CAREGIVER_TOKEN" \
    -d '{
      "type": "once",
      "category": "medication",
      "dateTime": "2025-01-20T11:00:00Z",
      "note": "Updated reminder note"
    }')
  echo "✅ Reminder updated: $UPDATE_RESPONSE"
else
  echo "ℹ️  Skipping update: could not parse reminder id (install jq to enable)."
fi

# 6. Meal requirements (POST + GET)
echo "6. Setting meal requirements (caregiver)..."
MEAL_SET=$(curl -s -X POST "$BASE_URL/users/$RESIDENT_ID/meal-requirements" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $CAREGIVER_TOKEN" \
  -d '{
    "requirements": ["Vegetarisk", "Glutenfri", "Custom requirement"]
  }')
echo "✅ Meal requirements set: $MEAL_SET"

echo "6b. Getting meal requirements..."
MEAL_GET=$(curl -s -X GET "$BASE_URL/users/$RESIDENT_ID/meal-requirements" \
  -H "Authorization: Bearer $CAREGIVER_TOKEN")
echo "✅ Meal requirements: $MEAL_GET"

echo "🎉 All tests completed!"
