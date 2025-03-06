// src/minimal-starter.tsx - A minimal working version to debug issues
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

// Simple component to test rendering
const App = () => {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Solana Traders Dashboard</h1>
      <p>If you can see this, React is rendering correctly.</p>
    </div>
  );
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);