#!/bin/bash
set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}Setting up the complete Solana Traders Dashboard...${NC}"

# Save original files with .backup extension if they're not yet backed up
if [ -f "src/main.tsx" ] && [ ! -f "src/main.tsx.backup" ]; then
  echo -e "${YELLOW}Backing up original main.tsx...${NC}"
  cp src/main.tsx src/main.tsx.backup
fi

# Copy the standalone main file
echo -e "${YELLOW}Using standalone main entry point...${NC}"
cp src/main-standalone.tsx src/main.tsx

# Make sure all necessary packages are installed
echo -e "${YELLOW}Checking for required packages...${NC}"
if ! npm list tailwindcss >/dev/null 2>&1; then
  echo -e "${YELLOW}Installing Tailwind CSS...${NC}"
  npm install -D tailwindcss postcss autoprefixer
fi

if ! npm list tailwindcss-plugin >/dev/null 2>&1; then
  echo -e "${YELLOW}Installing Tailwind plugins...${NC}"
  npm install -D tailwindcss-plugin
fi

# Clean any previous build artifacts
echo -e "${YELLOW}Cleaning previous build artifacts...${NC}"
rm -rf node_modules/.vite || true

# Start the development server
echo -e "${GREEN}Starting the development server...${NC}"
echo -e "${YELLOW}Press Ctrl+C when done...${NC}"
npm run dev

# Restore the original main file if requested
echo
echo -e "${YELLOW}To restore your original files:${NC}"
echo -e "cp src/main.tsx.backup src/main.tsx"