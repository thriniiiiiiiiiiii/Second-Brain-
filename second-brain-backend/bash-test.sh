#!/bin/bash

# Quick API Health Check Script
# Tests your Second Brain API endpoints

echo "🏥 Second Brain Quick Health Check"
echo "===================================="
echo ""

BASE_URL=${1:-http://localhost:3000}

echo "Testing API endpoints at: $BASE_URL"
echo ""

# Test 1: GET /api/knowledge
echo "📋 Test 1: GET /api/knowledge"
response=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/knowledge")
if [ "$response" -eq 200 ]; then
  echo "✅ PASS - Status: $response"
else
  echo "❌ FAIL - Status: $response"
fi
echo ""

# Test 2: Public Brain Query API
echo "🧠 Test 2: GET /api/public/brain/query"
response=$(curl -s -w "\n%{http_code}" "$BASE_URL/api/public/brain/query?q=test")
status=$(echo "$response" | tail -n1)
body=$(echo "$response" | head -n-1)

if [ "$status" -eq 200 ]; then
  echo "✅ PASS - Status: $status"
  echo "Response: $body" | head -c 100
  echo "..."
else
  echo "❌ FAIL - Status: $status"
fi
echo ""

# Test 3: Health endpoint (if exists)
echo "🔍 Test 3: Root endpoint"
response=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL")
if [ "$response" -eq 200 ]; then
  echo "✅ PASS - Status: $response (Landing page working)"
else
  echo "⚠️  Status: $response"
fi
echo ""

echo "===================================="
echo "💡 Tips:"
echo "• If tests fail, make sure 'npm run dev' is running"
echo "• Check .env file has DATABASE_URL and ANTHROPIC_API_KEY"
echo "• Visit http://localhost:51212 for Prisma Studio"
echo ""