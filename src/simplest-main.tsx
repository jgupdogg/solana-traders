// src/simplest-main.tsx - Absolute minimum configuration
import React from 'react';
import ReactDOM from 'react-dom/client';
import { ThemeProvider } from './contexts/ThemeContext';
import SolanaTradersBasic from './pages/SolanaTradersBasic';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <SolanaTradersBasic />
    </ThemeProvider>
  </React.StrictMode>
);