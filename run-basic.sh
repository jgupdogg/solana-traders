#!/bin/bash
set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}Setting up a very basic Solana Traders Dashboard...${NC}"

# Save original files with .backup extension if they're not yet backed up
if [ -f "src/main.tsx" ] && [ ! -f "src/main.tsx.backup" ]; then
  echo -e "${YELLOW}Backing up original main.tsx...${NC}"
  cp src/main.tsx src/main.tsx.backup
fi

# Create/update index.css
echo -e "${YELLOW}Creating basic index.css...${NC}"
cat > src/index.css << 'EOL'
@tailwind base;
@tailwind components;
@tailwind utilities;
EOL

# Copy the simplest main file
echo -e "${YELLOW}Using simplest main entry point...${NC}"
cp src/simplest-main.tsx src/main.tsx

# Make sure all necessary packages are installed
echo -e "${YELLOW}Installing required packages...${NC}"
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# Update tailwind.config.js
echo -e "${YELLOW}Creating tailwind config...${NC}"
cat > tailwind.config.js << 'EOL'
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Background colors
        lightBg: '#F9FAFB',
        darkBg: '#3E442B',
        
        // Content block colors
        oddBlock: '#AAADC4',
        evenBlock: '#D6EEFF',
        oddBlockDark: '#6A7062',
        evenBlockDark: '#8D909B',
        
        // Text colors
        textDark: '#3E442B',
        textLight: '#D6EEFF',
      }
    },
  },
  plugins: [],
}
EOL

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