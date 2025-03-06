// src/pages/SolanaTraders.tsx
import React, { useState, useEffect, useContext } from 'react';
import { Typography, Box, Grid, Card, CardContent } from '@mui/material';
import { FaExchangeAlt, FaChartLine, FaWallet } from 'react-icons/fa';
import { ThemeContext } from '../contexts/ThemeContext';
import { motion } from 'framer-motion';
import SummaryCard from '../components/dashboard/SummaryCard';
import ActivityTable from '../components/dashboard/ActivityTable';
import SnowflakeClient, { WhaleNotification } from '../services/SnowflakeClient';

const SolanaTraders: React.FC = () => {
  const { theme } = useContext(ThemeContext);
  const [loading, setLoading] = useState<boolean>(true);
  const [whaleData, setWhaleData] = useState<WhaleNotification[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Define theme-based classes using Tailwind color names
  const textColor = theme === 'dark' ? 'text-textLight' : 'text-textDark';
  const secondaryTextColor = theme === 'dark' ? 'text-gray-300' : 'text-gray-600';
  const bgColor1 = theme === 'dark' ? 'bg-darkBg' : 'bg-lightBg';
  const oddBlockBg = theme === 'dark' ? 'bg-oddBlockDark' : 'bg-oddBlock';
  const evenBlockBg = theme === 'dark' ? 'bg-evenBlockDark' : 'bg-evenBlock';

  // Define gradient classes based on the theme
  const gradientClasses = theme === 'dark'
    ? 'from-oddBlockDark to-evenBlockDark'
    : 'from-oddBlock to-evenBlock';

  const gradientTextColor = theme === 'dark' ? 'text-white' : 'text-textDark';

  // Fetch data from Snowflake (mock service for now)
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
    <div className={`relative min-h-screen flex flex-col items-center ${bgColor1}`}>
      {/* Hero Section */}
      <section className={`w-full flex flex-col items-center justify-center py-24 bg-gradient-to-r ${gradientClasses} ${gradientTextColor} mb-8`}>
        <Typography variant="h2" className="font-bold mb-4">
          Solana Traders Tracking
        </Typography>
        <Typography variant="h6">
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
              icon={<FaWallet className={textColor} />}
              className={oddBlockBg}
              textColor={textColor}
            />
          </Grid>
          
          <Grid item xs={12} md={3}>
            <SummaryCard
              title="Buy Transactions"
              value={totalBuys}
              loading={loading}
              icon={<FaChartLine className={textColor} />}
              className={evenBlockBg}
              textColor={textColor}
            />
          </Grid>
          
          <Grid item xs={12} md={3}>
            <SummaryCard
              title="Sell Transactions"
              value={totalSells}
              loading={loading}
              icon={<FaExchangeAlt className={textColor} />}
              className={oddBlockBg}
              textColor={textColor}
            />
          </Grid>
          
          <Grid item xs={12} md={3}>
            <SummaryCard
              title="Net Activity"
              value={netActivity > 0 ? `+${netActivity}` : netActivity}
              loading={loading}
              icon={<FaChartLine className={textColor} />}
              className={evenBlockBg}
              textColor={textColor}
            />
          </Grid>
        </Grid>

        {/* Whale Activity Table */}
        <Box className={`p-6 rounded-lg shadow-lg ${evenBlockBg} mb-8`}>
          <Typography variant="h4" className={`font-semibold mb-4 ${textColor}`}>
            Recent Whale Activity
          </Typography>
          
          <ActivityTable
            data={whaleData}
            loading={loading}
            error={error}
            textColor={textColor}
            secondaryTextColor={secondaryTextColor}
          />
        </Box>

        {/* Description Section */}
        <Box className={`p-6 rounded-lg shadow-lg ${oddBlockBg} mb-8`}>
          <Typography variant="h4" className={`font-semibold mb-4 ${textColor}`}>
            About This Dashboard
          </Typography>
          <Typography variant="body1" className={secondaryTextColor}>
            This dashboard monitors whale trading activity on the Solana blockchain. We track significant buy and sell transactions 
            for popular Solana tokens to identify market trends and potential price movements. The data is collected 
            in real-time and stored in our Snowflake database for analysis.
          </Typography>
          <Typography variant="body1" className={`mt-4 ${secondaryTextColor}`}>
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