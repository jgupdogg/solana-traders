// src/pages/SolanaTraders.tsx
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
  },
  {
    NOTIFICATION_ID: 3,
    TIMESTAMP: new Date(Date.now() - 7200000).toISOString(),
    ADDRESS: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
    SYMBOL: 'JUP',
    NAME: 'Jupiter',
    TIME_INTERVAL: '1h',
    NUM_USERS_BOUGHT: 312,
    NUM_USERS_SOLD: 98,
    INSERTED_AT: new Date(Date.now() - 7200000).toISOString()
  }
];

const SolanaTraders: React.FC = () => {
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

  // Calculate summary metrics
  const uniqueTokens = loading ? 0 : [...new Set(whaleData.map(item => item.SYMBOL))].length;
  const totalBuys = loading ? 0 : whaleData.reduce((sum, item) => sum + item.NUM_USERS_BOUGHT, 0);
  const totalSells = loading ? 0 : whaleData.reduce((sum, item) => sum + item.NUM_USERS_SOLD, 0);
  const netActivity = totalBuys - totalSells;

  // Format timestamp
  const formatDate = (timestamp: string): string => {
    const date = new Date(timestamp);
    return date.toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Format address
  const formatAddress = (address: string): string => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  return (
    <div className="min-h-screen bg-lightBg dark:bg-darkBg transition-colors duration-300">
      {/* Theme Toggle Button */}
      <button 
        onClick={toggleTheme}
        className="fixed top-4 right-4 z-50 p-2 bg-gray-200 dark:bg-gray-700 rounded-full shadow-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
        aria-label="Toggle dark mode"
      >
        {theme === 'dark' ? '☀️' : '🌙'}
      </button>
      
      {/* Header */}
      <header className="bg-oddBlock dark:bg-oddBlockDark p-8 mb-8 transition-colors duration-300">
        <h1 className="text-3xl md:text-4xl font-bold text-center text-textDark dark:text-textLight">
          Solana Traders Dashboard
        </h1>
        <p className="text-center mt-2 text-textDark dark:text-textLight opacity-80">
          Monitor whale activity and trading patterns on Solana
        </p>
      </header>
      
      {/* Main Content */}
      <main className="container mx-auto px-4 pb-12">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-pulse flex space-x-4">
              <div className="rounded-full bg-oddBlock dark:bg-oddBlockDark h-12 w-12"></div>
              <div className="flex-1 space-y-4 py-1">
                <div className="h-4 bg-oddBlock dark:bg-oddBlockDark rounded w-3/4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-oddBlock dark:bg-oddBlockDark rounded"></div>
                  <div className="h-4 bg-oddBlock dark:bg-oddBlockDark rounded w-5/6"></div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Dashboard Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-oddBlock dark:bg-oddBlockDark p-6 rounded-lg shadow-md card-hover transition-colors duration-300">
                <h2 className="font-bold text-textDark dark:text-textLight">Tracked Tokens</h2>
                <p className="text-3xl mt-2 font-semibold text-textDark dark:text-textLight">{uniqueTokens}</p>
              </div>
              
              <div className="bg-evenBlock dark:bg-evenBlockDark p-6 rounded-lg shadow-md card-hover transition-colors duration-300">
                <h2 className="font-bold text-textDark dark:text-textLight">Buy Transactions</h2>
                <p className="text-3xl mt-2 font-semibold text-textDark dark:text-textLight">{totalBuys}</p>
              </div>
              
              <div className="bg-oddBlock dark:bg-oddBlockDark p-6 rounded-lg shadow-md card-hover transition-colors duration-300">
                <h2 className="font-bold text-textDark dark:text-textLight">Sell Transactions</h2>
                <p className="text-3xl mt-2 font-semibold text-textDark dark:text-textLight">{totalSells}</p>
              </div>
              
              <div className="bg-evenBlock dark:bg-evenBlockDark p-6 rounded-lg shadow-md card-hover transition-colors duration-300">
                <h2 className="font-bold text-textDark dark:text-textLight">Net Activity</h2>
                <p className="text-3xl mt-2 font-semibold text-textDark dark:text-textLight">
                  {netActivity > 0 ? `+${netActivity}` : netActivity}
                </p>
              </div>
            </div>
            
            {/* Whale Activity Table */}
            <div className="bg-evenBlock dark:bg-evenBlockDark p-6 rounded-lg shadow-md mb-8 transition-colors duration-300">
              <h2 className="text-xl font-bold mb-4 text-textDark dark:text-textLight">
                Recent Whale Activity
              </h2>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-600">
                      <th className="py-2 px-4 text-left text-textDark dark:text-textLight">Time</th>
                      <th className="py-2 px-4 text-left text-textDark dark:text-textLight">Token</th>
                      <th className="py-2 px-4 text-left text-textDark dark:text-textLight">Address</th>
                      <th className="py-2 px-4 text-left text-textDark dark:text-textLight">Buyers</th>
                      <th className="py-2 px-4 text-left text-textDark dark:text-textLight">Sellers</th>
                      <th className="py-2 px-4 text-left text-textDark dark:text-textLight">Net</th>
                    </tr>
                  </thead>
                  <tbody>
                    {whaleData.map((item) => {
                      const netActivity = item.NUM_USERS_BOUGHT - item.NUM_USERS_SOLD;
                      return (
                        <tr key={item.NOTIFICATION_ID} className="border-b border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                          <td className="py-2 px-4 text-textDark dark:text-textLight">{formatDate(item.TIMESTAMP)}</td>
                          <td className="py-2 px-4 text-textDark dark:text-textLight font-medium">{item.NAME} <span className="text-gray-500 dark:text-gray-400 text-sm ml-1">{item.SYMBOL}</span></td>
                          <td className="py-2 px-4 text-textDark dark:text-textLight font-mono text-sm">{formatAddress(item.ADDRESS)}</td>
                          <td className="py-2 px-4 text-textDark dark:text-textLight">{item.NUM_USERS_BOUGHT}</td>
                          <td className="py-2 px-4 text-textDark dark:text-textLight">{item.NUM_USERS_SOLD}</td>
                          <td className="py-2 px-4">
                            <span className={`px-2 py-1 rounded ${netActivity > 0 ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}>
                              {netActivity > 0 ? `+${netActivity}` : netActivity}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
            
            {/* About This Dashboard */}
            <div className="bg-oddBlock dark:bg-oddBlockDark p-6 rounded-lg shadow-md mb-8 transition-colors duration-300">
              <h2 className="text-xl font-bold mb-4 text-textDark dark:text-textLight">
                About This Dashboard
              </h2>
              <p className="text-textDark dark:text-textLight mb-4">
                This dashboard monitors whale trading activity on the Solana blockchain. We track significant buy and sell transactions 
                for popular Solana tokens to identify market trends and potential price movements. The data is collected 
                in real-time and stored in our Snowflake database for analysis.
              </p>
              <p className="text-textDark dark:text-textLight">
                Use this information to identify which tokens are attracting trading activity from large wallets, 
                which can sometimes foreshadow broader market movements. This dashboard is part of our comprehensive 
                blockchain analytics suite at Agent Alpha.
              </p>
            </div>
          </>
        )}
      </main>
      
      {/* Footer */}
      <footer className="bg-oddBlock dark:bg-oddBlockDark py-4 px-6 text-center text-textDark dark:text-textLight transition-colors duration-300">
        <p className="opacity-70 text-sm">© 2025 Agent Alpha. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default SolanaTraders;
