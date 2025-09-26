#!/bin/bash

# Test UPDATE Reminder Functionality
# Make sure the backend is running on localhost:8080

BASE_URL="http://localhost:8080"
ADMIN_EMAIL="admin@mos.test"
ADMIN_PASSWORD="password123"
USER_ID="550e8400-e29b-41d4-a716-446655440001"

echo "🔐 Logging in as admin..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$ADMIN_EMAIL\",\"password\":\"$ADMIN_PASSWORD\"}")

TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.token')
echo "✅ Login successful, token: ${TOKEN:0:20}..."

echo ""
echo "📋 Getting existing reminders..."
REMINDERS_RESPONSE=$(curl -s -X GET "$BASE_URL/api/users/$USER_ID/reminders" \
  -H "Authorization: Bearer $TOKEN")

echo "Current reminders:"
echo "$REMINDERS_RESPONSE" | jq '.'

# Extract first reminder ID if any exist
REMINDER_ID=$(echo "$REMINDERS_RESPONSE" | jq -r '.[0].id // empty')

if [ -z "$REMINDER_ID" ] || [ "$REMINDER_ID" = "null" ]; then
  echo ""
  echo "📝 No reminders found, creating a test reminder..."
  CREATE_RESPONSE=$(curl -s -X POST "$BASE_URL/api/users/$USER_ID/reminders" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
      "type": "once",
      "category": "måltider",
      "dateTime": "2025-09-27T15:00:00Z",
      "note": "Test reminder for update"
    }')
  
  REMINDER_ID=$(echo "$CREATE_RESPONSE" | jq -r '.id')
  echo "✅ Created reminder with ID: $REMINDER_ID"
else
  echo "✅ Found existing reminder with ID: $REMINDER_ID"
fi

echo ""
echo "🔄 Testing full update..."
UPDATE_RESPONSE=$(curl -s -X PUT "$BASE_URL/api/users/$USER_ID/reminders/$REMINDER_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "once",
    "category": "medicin",
    "dateTime": "2025-09-27T16:30:00Z",
    "note": "Updated medication reminder"
  }')

echo "Update response:"
echo "$UPDATE_RESPONSE" | jq '.'

echo ""
echo "🔄 Testing partial update (note only)..."
PARTIAL_UPDATE_RESPONSE=$(curl -s -X PUT "$BASE_URL/api/users/$USER_ID/reminders/$REMINDER_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "note": "Just updating the note field"
  }')

echo "Partial update response:"
echo "$PARTIAL_UPDATE_RESPONSE" | jq '.'

echo ""
echo "🔄 Testing update to recurring reminder..."
RECURRING_UPDATE_RESPONSE=$(curl -s -X PUT "$BASE_URL/api/users/$USER_ID/reminders/$REMINDER_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "recurring",
    "category": "måltider",
    "days": ["Mon", "Wed", "Fri"],
    "times": ["08:00", "12:00", "18:00"],
    "note": "Recurring meal reminders"
  }')

echo "Recurring update response:"
echo "$RECURRING_UPDATE_RESPONSE" | jq '.'

echo ""
echo "❌ Testing error case (non-existent reminder)..."
ERROR_RESPONSE=$(curl -s -X PUT "$BASE_URL/api/users/$USER_ID/reminders/00000000-0000-0000-0000-000000000000" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "note": "This should fail"
  }')

echo "Error response:"
echo "$ERROR_RESPONSE" | jq '.'

echo ""
echo "✅ UPDATE reminder functionality test completed!"
