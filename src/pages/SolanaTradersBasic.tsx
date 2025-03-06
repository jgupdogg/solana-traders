// src/pages/SolanaTradersBasic.tsx
import React, { useState, useEffect, useContext } from 'react';
import { ThemeContext } from '../contexts/ThemeContext';

// Mock data interface
interface WhaleNotification {
  NOTIFICATION_ID: number;
  TIMESTAMP: string;
  ADDRESS: string;
  SYMBOL: string;
  NAME: string;
  TIME_INTERVAL: string;
  NUM_USERS_BOUGHT: number;
  NUM_USERS_SOLD: number;
  INSERTED_AT: string;
}

// Mock data
const mockWhaleData: WhaleNotification[] = [
  {
    NOTIFICATION_ID: 1,
    TIMESTAMP: new Date().toISOString(),
    ADDRESS: '0x7a250d5630b4cf539739df2c5dacb4c659f2488d',
    SYMBOL: 'SOL',
    NAME: 'Solana',
    TIME_INTERVAL: '1h',
    NUM_USERS_BOUGHT: 245,
    NUM_USERS_SOLD: 124,
    INSERTED_AT: new Date().toISOString()
  },
  {
    NOTIFICATION_ID: 2,
    TIMESTAMP: new Date(Date.now() - 3600000).toISOString(),
    ADDRESS: '0x6b175474e89094c44da98b954eedeac495271d0f',
    SYMBOL: 'BONK',
    NAME: 'Bonk',
    TIME_INTERVAL: '1h',
    NUM_USERS_BOUGHT: 187,
    NUM_USERS_SOLD: 203,
    INSERTED_AT: new Date(Date.now() - 3600000).toISOString()
  }
];

const SolanaTradersBasic: React.FC = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const [whaleData, setWhaleData] = useState<WhaleNotification[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Simulate API call with setTimeout
    const timer = setTimeout(() => {
      setWhaleData(mockWhaleData);
      setLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-lightBg dark:bg-darkBg">
      {/* Theme Toggle Button */}
      <button 
        onClick={toggleTheme}
        className="fixed top-4 right-4 z-50 p-2 bg-gray-200 dark:bg-gray-700 rounded-full shadow-md"
        aria-label="Toggle dark mode"
      >
        {theme === 'dark' ? '☀️' : '🌙'}
      </button>
      
      {/* Header */}
      <header className="bg-oddBlock dark:bg-oddBlockDark p-8 mb-8">
        <h1 className="text-3xl font-bold text-center text-textDark dark:text-textLight">
          Solana Traders Dashboard
        </h1>
      </header>
      
      {/* Main Content */}
      <main className="container mx-auto px-4 pb-12">
        {loading ? (
          <div className="flex justify-center">
            <p className="text-textDark dark:text-textLight">Loading...</p>
          </div>
        ) : (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-oddBlock dark:bg-oddBlockDark p-4 rounded-lg">
                <h2 className="font-bold text-textDark dark:text-textLight">Tokens</h2>
                <p className="text-2xl text-textDark dark:text-textLight">
                  {[...new Set(whaleData.map(item => item.SYMBOL))].length}
                </p>
              </div>
              
              <div className="bg-evenBlock dark:bg-evenBlockDark p-4 rounded-lg">
                <h2 className="font-bold text-textDark dark:text-textLight">Total Buys</h2>
                <p className="text-2xl text-textDark dark:text-textLight">
                  {whaleData.reduce((sum, item) => sum + item.NUM_USERS_BOUGHT, 0)}
                </p>
              </div>
              
              <div className="bg-oddBlock dark:bg-oddBlockDark p-4 rounded-lg">
                <h2 className="font-bold text-textDark dark:text-textLight">Total Sells</h2>
                <p className="text-2xl text-textDark dark:text-textLight">
                  {whaleData.reduce((sum, item) => sum + item.NUM_USERS_SOLD, 0)}
                </p>
              </div>
              
              <div className="bg-evenBlock dark:bg-evenBlockDark p-4 rounded-lg">
                <h2 className="font-bold text-textDark dark:text-textLight">Net Activity</h2>
                <p className="text-2xl text-textDark dark:text-textLight">
                  {whaleData.reduce((sum, item) => sum + item.NUM_USERS_BOUGHT - item.NUM_USERS_SOLD, 0)}
                </p>
              </div>
            </div>
            
            <div className="bg-evenBlock dark:bg-evenBlockDark p-4 rounded-lg">
              <h2 className="text-xl font-bold mb-4 text-textDark dark:text-textLight">Recent Activity</h2>
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="text-left p-2 text-textDark dark:text-textLight">Token</th>
                    <th className="text-left p-2 text-textDark dark:text-textLight">Symbol</th>
                    <th className="text-left p-2 text-textDark dark:text-textLight">Buys</th>
                    <th className="text-left p-2 text-textDark dark:text-textLight">Sells</th>
                    <th className="text-left p-2 text-textDark dark:text-textLight">Net</th>
                  </tr>
                </thead>
                <tbody>
                  {whaleData.map(item => (
                    <tr key={item.NOTIFICATION_ID}>
                      <td className="p-2 text-textDark dark:text-textLight">{item.NAME}</td>
                      <td className="p-2 text-textDark dark:text-textLight">{item.SYMBOL}</td>
                      <td className="p-2 text-textDark dark:text-textLight">{item.NUM_USERS_BOUGHT}</td>
                      <td className="p-2 text-textDark dark:text-textLight">{item.NUM_USERS_SOLD}</td>
                      <td className="p-2 text-textDark dark:text-textLight">{item.NUM_USERS_BOUGHT - item.NUM_USERS_SOLD}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default SolanaTradersBasic;