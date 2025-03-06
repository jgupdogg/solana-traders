#!/bin/bash
set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}Progressive debugging for Solana Traders Dashboard${NC}"

# Step 1: Try minimal starter
echo -e "${YELLOW}Step 1: Testing with minimal React component${NC}"
cp src/minimal-starter.tsx src/main.tsx
echo -e "${GREEN}Running minimal starter...${NC}"
echo -e "${YELLOW}Press Ctrl+C when ready to move to step 2${NC}"
npm run dev

# Step 2: Try basic dashboard
echo -e "${YELLOW}Step 2: Testing with basic dashboard component${NC}"
cp src/basic-main.tsx src/main.tsx
echo -e "${GREEN}Running basic dashboard...${NC}"
echo -e "${YELLOW}Press Ctrl+C when ready for final step${NC}"
npm run dev

# Save the original files
echo -e "${YELLOW}Saving your original files...${NC}"
if [ -f "src/main.tsx.original" ]; then
  echo -e "${RED}Original files already exist. Please delete them first to avoid overwriting.${NC}"
  exit 1
fi

mv src/main.tsx src/main.tsx.original

# Step 3: Create a standalone version with no external dependencies
echo -e "${YELLOW}Step 3: Creating standalone version with clean dependencies${NC}"
cat > src/main.tsx << 'EOL'
import React from 'react';
import ReactDOM from 'react-dom/client';
import SolanaTraders from './pages/SolanaTraders-basic';
import './index.css';

// Simple theme provider that only manages dark/light mode
const SimpleThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = React.useState<string>(
    localStorage.getItem('theme') || 'light'
  );
  
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    localStorage.setItem('theme', newTheme);
    setTheme(newTheme);
  };
  
  // Apply dark class to document
  React.useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);
  
  return (
    <div className={theme === 'dark' ? 'dark' : 'light'}>
      <button 
        onClick={toggleTheme}
        className="fixed top-4 right-4 bg-gray-200 dark:bg-gray-700 p-2 rounded-full"
      >
        {theme === 'dark' ? '☀️' : '🌙'}
      </button>
      {children}
    </div>
  );
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <SimpleThemeProvider>
      <SolanaTraders />
    </SimpleThemeProvider>
  </React.StrictMode>
);
EOL

echo -e "${GREEN}Running final simplified version...${NC}"
npm run dev

echo -e "${YELLOW}To restore your original files:${NC}"
echo -e "mv src/main.tsx.original src/main.tsx"