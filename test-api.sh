#!/bin/bash

# Script para probar los endpoints de la API

API_URL="http://localhost:3100"
TOKEN=""

echo "🧪 Probando API del Restaurante"
echo "=================================="
echo ""

# 1. Health check
echo "1️⃣  Health Check"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
curl -s "$API_URL/health" | jq
echo ""

# 2. Login
echo "2️⃣  Login (admin)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}')

echo "$LOGIN_RESPONSE" | jq
TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.data.token')
echo ""
echo "Token: $TOKEN"
echo ""

# 3. Get current user
echo "3️⃣  Get Current User"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
curl -s "$API_URL/api/auth/me" \
  -H "Authorization: Bearer $TOKEN" | jq
echo ""

# 4. Get categories
echo "4️⃣  Get Categories"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
curl -s "$API_URL/api/categories" | jq '.data.categories[] | {name, description, order}'
echo ""

# 5. Get products
echo "5️⃣  Get Products (first 5)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
curl -s "$API_URL/api/products?limit=5" | jq '.data.products[] | {name, price, category: .category.name, available}'
echo ""

# 6. Get tables
echo "6️⃣  Get Tables"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
curl -s "$API_URL/api/tables" \
  -H "Authorization: Bearer $TOKEN" | jq '.data.tables[] | {number, capacity, location, status}'
echo ""

# 7. Create an order (as waiter)
echo "7️⃣  Login as Waiter"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
WAITER_LOGIN=$(curl -s -X POST "$API_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"mesero1","password":"mesero123"}')

WAITER_TOKEN=$(echo "$WAITER_LOGIN" | jq -r '.data.token')
echo "Waiter token: $WAITER_TOKEN"
echo ""

# Get first product and table
PRODUCT_ID=$(curl -s "$API_URL/api/products?limit=1" | jq -r '.data.products[0]._id')
TABLE_ID=$(curl -s "$API_URL/api/tables" -H "Authorization: Bearer $WAITER_TOKEN" | jq -r '.data.tables[0]._id')

echo "8️⃣  Create Order"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Product ID: $PRODUCT_ID"
echo "Table ID: $TABLE_ID"
echo ""

ORDER_RESPONSE=$(curl -s -X POST "$API_URL/api/orders" \
  -H "Authorization: Bearer $WAITER_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"tableId\": \"$TABLE_ID\",
    \"items\": [
      {
        \"productId\": \"$PRODUCT_ID\",
        \"quantity\": 2,
        \"notes\": \"Sin cebolla\"
      }
    ],
    \"notes\": \"Mesa para 2 personas\"
  }")

echo "$ORDER_RESPONSE" | jq
ORDER_ID=$(echo "$ORDER_RESPONSE" | jq -r '.data.order._id')
echo ""

# 9. Get orders
echo "9️⃣  Get Orders"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
curl -s "$API_URL/api/orders" \
  -H "Authorization: Bearer $WAITER_TOKEN" | jq '.data.orders[] | {orderNumber, status, total, table: .table.number}'
echo ""

# 10. Dashboard stats (as cashier)
echo "🔟 Dashboard Stats (as cashier)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
CASHIER_LOGIN=$(curl -s -X POST "$API_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"cajero1","password":"cajero123"}')

CASHIER_TOKEN=$(echo "$CASHIER_LOGIN" | jq -r '.data.token')

curl -s "$API_URL/api/dashboard/stats" \
  -H "Authorization: Bearer $CASHIER_TOKEN" | jq '.data.today'
echo ""

echo "✅ Pruebas completadas!"
