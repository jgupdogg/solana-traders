// src/basic-main.tsx - Simple version with minimal dependencies
import React from 'react';
import ReactDOM from 'react-dom/client';
import SolanaTraders from './pages/SolanaTraders-basic';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <SolanaTraders />
  </React.StrictMode>
);