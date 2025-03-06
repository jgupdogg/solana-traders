#!/bin/bash
set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}Starting development environment...${NC}"

# Create .env.local if it doesn't exist
if [ ! -f ".env.local" ]; then
  echo -e "${YELLOW}Creating .env.local file...${NC}"
  cat > .env.local << EOL
# Local development environment variables
VITE_API_BASE_URL=http://localhost:8000/api
EOL
fi

# Check if backend server is already running on port 8000
if lsof -Pi :8000 -sTCP:LISTEN -t >/dev/null ; then
  echo -e "${YELLOW}Backend server already running on port 8000${NC}"
else
  echo -e "${GREEN}Starting backend server...${NC}"
  # Start backend in background
  cd backend
  python -m uvicorn app:app --reload --host 0.0.0.0 --port 8000 &
  BACKEND_PID=$!
  cd ..
  echo -e "${GREEN}Backend started with PID: ${BACKEND_PID}${NC}"
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
  echo -e "${YELLOW}Installing frontend dependencies...${NC}"
  npm install
fi

# Start frontend development server with .env.local
echo -e "${GREEN}Starting frontend development server...${NC}"
VITE_USER_NODE_ENV=development npm run dev

# When frontend exits, kill backend if we started it
if [ -n "$BACKEND_PID" ]; then
  echo -e "${YELLOW}Shutting down backend server...${NC}"
  kill $BACKEND_PID
fi

echo -e "${GREEN}Development environment stopped.${NC}"