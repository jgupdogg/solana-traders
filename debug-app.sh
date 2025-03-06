#!/bin/bash
set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}Setting up debug environment...${NC}"

# Create a minimal main.tsx for testing
echo -e "${YELLOW}Creating a minimal test starter...${NC}"
cp src/minimal-starter.tsx src/main.tsx

# Create a .env.local if it doesn't exist
if [ ! -f ".env.local" ]; then
  echo -e "${YELLOW}Creating .env.local file...${NC}"
  cat > .env.local << EOL
# Local development environment variables
VITE_API_BASE_URL=http://localhost:8000/api
EOL
fi

# Clear any previous build artifacts
echo -e "${YELLOW}Clearing previous build artifacts...${NC}"
rm -rf dist

# Start Vite in debug mode
echo -e "${GREEN}Starting Vite in debug mode...${NC}"
echo -e "${YELLOW}Check your browser console for error messages!${NC}"
npm run dev -- --debug