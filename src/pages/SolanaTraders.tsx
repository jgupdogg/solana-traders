// src/pages/SolanaTraders.tsx
import React, { useState, useEffect, useContext } from 'react';
import { Typography, Box, Grid } from '@mui/material';
import { FaExchangeAlt, FaChartLine, FaWallet } from 'react-icons/fa';
import { ThemeContext } from '../contexts/ThemeContext';
import { motion } from 'framer-motion';
import SummaryCard from '../components/dashboard/SummaryCard';
import ActivityTable from '../components/dashboard/ActivityTable';
import SnowflakeClient, { WhaleNotification } from '../services/SnowflakeClient';

const SolanaTraders: React.FC = () => {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';
  const [loading, setLoading] = useState<boolean>(true);
  const [whaleData, setWhaleData] = useState<WhaleNotification[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Fetch data from Snowflake
  useEffect(() => {
    const fetchWhaleData = async () => {
      setLoading(true);
      try {
        const data = await SnowflakeClient.getWhaleNotifications();
        setWhaleData(data);
        setLoading(false);
      } catch (err) {
        setError('Error fetching data. Please try again later.');
        setLoading(false);
        console.error('Error fetching whale data:', err);
      }
    };

    fetchWhaleData();
  }, []);

  // Calculate summary metrics
  const uniqueTokens = loading ? 0 : whaleData.reduce((acc, curr) => {
    if (!acc.includes(curr.SYMBOL)) acc.push(curr.SYMBOL);
    return acc;
  }, [] as string[]).length;

  const totalBuys = loading ? 0 : whaleData.reduce((sum, curr) => sum + curr.NUM_USERS_BOUGHT, 0);
  const totalSells = loading ? 0 : whaleData.reduce((sum, curr) => sum + curr.NUM_USERS_SOLD, 0);
  const netActivity = totalBuys - totalSells;

  return (
    <div className={`relative min-h-screen flex flex-col items-center ${isDark ? 'bg-drab-brown' : 'bg-light-bg'}`}>
      {/* Hero Section */}
      <section className={`w-full flex flex-col items-center justify-center py-24 ${isDark ? 'bg-gradient-to-r from-ebony to-cool-gray' : 'bg-gradient-to-r from-cool-gray-light to-columbia-blue'} mb-8`}>
        <Typography variant="h2" className="font-bold mb-4 text-white">
          Solana Traders Tracking
        </Typography>
        <Typography variant="h6" className="text-white">
          Monitor whale activity and trading patterns on Solana
        </Typography>
      </section>

      {/* Main Content */}
      <motion.section 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-5xl px-4 mb-12"
      >
        {/* Dashboard Summary Cards */}
        <Grid container spacing={4} className="mb-8">
          <Grid item xs={12} md={3}>
            <SummaryCard
              title="Tracked Tokens"
              value={uniqueTokens}
              loading={loading}
              icon={<FaWallet className={isDark ? 'text-columbia-blue' : 'text-drab-brown'} />}
              className={isDark ? 'bg-ebony' : 'bg-cool-gray-light'}
              textColor={isDark ? 'text-columbia-blue' : 'text-drab-brown'}
            />
          </Grid>
          
          <Grid item xs={12} md={3}>
            <SummaryCard
              title="Buy Transactions"
              value={totalBuys}
              loading={loading}
              icon={<FaChartLine className={isDark ? 'text-columbia-blue' : 'text-drab-brown'} />}
              className={isDark ? 'bg-cool-gray' : 'bg-columbia-blue'}
              textColor={isDark ? 'text-columbia-blue' : 'text-drab-brown'}
            />
          </Grid>
          
          <Grid item xs={12} md={3}>
            <SummaryCard
              title="Sell Transactions"
              value={totalSells}
              loading={loading}
              icon={<FaExchangeAlt className={isDark ? 'text-columbia-blue' : 'text-drab-brown'} />}
              className={isDark ? 'bg-ebony' : 'bg-cool-gray-light'}
              textColor={isDark ? 'text-columbia-blue' : 'text-drab-brown'}
            />
          </Grid>
          
          <Grid item xs={12} md={3}>
            <SummaryCard
              title="Net Activity"
              value={netActivity > 0 ? `+${netActivity}` : netActivity}
              loading={loading}
              icon={<FaChartLine className={isDark ? 'text-columbia-blue' : 'text-drab-brown'} />}
              className={isDark ? 'bg-cool-gray' : 'bg-columbia-blue'}
              textColor={isDark ? 'text-columbia-blue' : 'text-drab-brown'}
            />
          </Grid>
        </Grid>

        {/* Whale Activity Table */}
        <Box className={`p-6 rounded-lg shadow-lg mb-8 ${isDark ? 'bg-cool-gray' : 'bg-columbia-blue'}`}>
          <Typography variant="h4" className={`font-semibold mb-4 ${isDark ? 'text-columbia-blue' : 'text-drab-brown'}`}>
            Recent Whale Activity
          </Typography>
          
          <ActivityTable
            data={whaleData}
            loading={loading}
            error={error}
            textColor={isDark ? 'text-columbia-blue' : 'text-drab-brown'}
            secondaryTextColor={isDark ? 'text-gray-300' : 'text-gray-600'}
          />
        </Box>

        {/* Description Section */}
        <Box className={`p-6 rounded-lg shadow-lg mb-8 ${isDark ? 'bg-ebony' : 'bg-cool-gray-light'}`}>
          <Typography variant="h4" className={`font-semibold mb-4 ${isDark ? 'text-columbia-blue' : 'text-drab-brown'}`}>
            About This Dashboard
          </Typography>
          <Typography variant="body1" className={isDark ? 'text-gray-300' : 'text-gray-600'}>
            This dashboard monitors whale trading activity on the Solana blockchain. We track significant buy and sell transactions 
            for popular Solana tokens to identify market trends and potential price movements. The data is collected 
            in real-time and stored in our Snowflake database for analysis.
          </Typography>
          <Typography variant="body1" className={`mt-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            Use this information to identify which tokens are attracting trading activity from large wallets, 
            which can sometimes foreshadow broader market movements. This dashboard is part of our comprehensive 
            blockchain analytics suite at Agent Alpha.
          </Typography>
        </Box>
      </motion.section>
    </div>
  );
};

export default SolanaTraders;