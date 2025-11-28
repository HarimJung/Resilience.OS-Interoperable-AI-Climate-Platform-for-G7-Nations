#!/bin/bash
# Start backend
cd /Users/harimgemmajung/Documents/GitHub/g7-project/backend
python3 main.py &
BACKEND_PID=$!
echo "Backend started with PID: $BACKEND_PID"

# Wait for backend
sleep 30

# Start frontend
cd /Users/harimgemmajung/Documents/GitHub/g7-project/frontend
export PATH="/usr/local/bin:$PATH"
npm run dev &
FRONTEND_PID=$!
echo "Frontend started with PID: $FRONTEND_PID"

echo ""
echo "=========================="
echo "✅ 백엔드: http://localhost:8000"
echo "✅ 프론트엔드: http://localhost:5173"
echo "=========================="
echo ""
echo "종료하려면: kill $BACKEND_PID $FRONTEND_PID"

wait
