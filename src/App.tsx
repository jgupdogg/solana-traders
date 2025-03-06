import React, { useContext } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ThemeContext } from './contexts/ThemeContext';
import SolanaTraders from './pages/SolanaTraders';

const App: React.FC = () => {
  const { theme } = useContext(ThemeContext);
  
  return (
    <div className={`app ${theme === 'dark' ? 'dark' : 'light'}`}>
      <Routes>
        <Route path="/" element={<SolanaTraders />} />
        <Route path="/solana-traders" element={<SolanaTraders />} />
      </Routes>
    </div>
  );
};

export default App;