// src/services/SnowflakeClient.ts
export interface WhaleNotification {
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

export interface TokenStats {
  SYMBOL: string;
  NAME: string;
  NOTIFICATION_COUNT: number;
  TOTAL_BUYS: number;
  TOTAL_SELLS: number;
  NET_ACTIVITY: number;
  LATEST_ACTIVITY: string;
}

// Mock data for testing/development
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

class SnowflakeClient {
  private baseUrl: string;
  private useMockData: boolean;

  constructor() {
    // Safely access environment variables
    const envBaseUrl = import.meta.env?.VITE_API_BASE_URL;
    this.baseUrl = envBaseUrl || 'http://localhost:8000/api';
    console.log('API Base URL:', this.baseUrl);
    
    // Set to true to use mock data, false to use actual API
    this.useMockData = true; // Change to false when API is ready
  }

  // Get whale notifications
  async getWhaleNotifications(limit: number = 100, symbol?: string): Promise<WhaleNotification[]> {
    // Use mock data if enabled
    if (this.useMockData) {
      let data = [...mockWhaleData];
      
      if (symbol) {
        data = data.filter(notification => notification.SYMBOL === symbol);
      }
      
      return data.slice(0, limit);
    }
    
    try {
      let url = `${this.baseUrl}/whale-notifications?limit=${limit}`;
      if (symbol) {
        url += `&symbol=${encodeURIComponent(symbol)}`;
      }

      console.log('Fetching from URL:', url);
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`API request failed with status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching whale notifications:', error);
      throw error;
    }
  }

  // Get token statistics
  async getTokenStats(): Promise<TokenStats[]> {
    // Generate mock stats if mock data is enabled
    if (this.useMockData) {
      const stats: TokenStats[] = [
        {
          SYMBOL: "SOL",
          NAME: "Solana",
          NOTIFICATION_COUNT: 12,
          TOTAL_BUYS: 1245,
          TOTAL_SELLS: 824,
          NET_ACTIVITY: 421,
          LATEST_ACTIVITY: new Date().toISOString()
        },
        {
          SYMBOL: "BONK",
          NAME: "Bonk",
          NOTIFICATION_COUNT: 8,
          TOTAL_BUYS: 987,
          TOTAL_SELLS: 1103,
          NET_ACTIVITY: -116,
          LATEST_ACTIVITY: new Date(Date.now() - 3600000).toISOString()
        },
        {
          SYMBOL: "JUP",
          NAME: "Jupiter",
          NOTIFICATION_COUNT: 10,
          TOTAL_BUYS: 1512,
          TOTAL_SELLS: 698,
          NET_ACTIVITY: 814,
          LATEST_ACTIVITY: new Date(Date.now() - 7200000).toISOString()
        }
      ];
      
      return stats;
    }
    
    try {
      const response = await fetch(`${this.baseUrl}/token-stats`);
      if (!response.ok) {
        throw new Error(`API request failed with status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching token stats:', error);
      throw error;
    }
  }
}

// Create singleton instance
const snowflakeClient = new SnowflakeClient();
export default snowflakeClient;
