// src/main-standalone.tsx - Simplified standalone entry point
import React from 'react';
import ReactDOM from 'react-dom/client';
import { ThemeProvider } from './contexts/ThemeContext';
import SolanaTraders from './pages/SolanaTradersComplete';
import './index.css';
import './theme-variables.css';
import './App.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <SolanaTraders />
    </ThemeProvider>
  </React.StrictMode>
);