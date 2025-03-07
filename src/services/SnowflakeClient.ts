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

class SnowflakeClient {
  // Make baseUrl public so it can be accessed for debugging
  public baseUrl: string;

  constructor() {
    // Get API base URL from environment variables
    const envBaseUrl = import.meta.env?.VITE_API_BASE_URL;
    this.baseUrl = envBaseUrl || 'https://vu3lnp4rzl.execute-api.us-east-1.amazonaws.com/dev/api';
    console.log('API Base URL configured as:', this.baseUrl);
  }

  // Get whale notifications
  async getWhaleNotifications(limit: number = 100, symbol?: string): Promise<WhaleNotification[]> {
    try {
      let url = `${this.baseUrl}/whale-notifications?limit=${limit}`;
      if (symbol) {
        url += `&symbol=${encodeURIComponent(symbol)}`;
      }

      console.log('Fetching whale notifications from URL:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        mode: 'cors' // Important for cross-domain requests
      });
      
      if (!response.ok) {
        // Try to get error details from the response
        let errorDetail;
        try {
          errorDetail = await response.json();
        } catch (e) {
          errorDetail = await response.text();
        }
        
        throw new Error(`API request failed with status: ${response.status}, details: ${JSON.stringify(errorDetail)}`);
      }
      
      const data = await response.json();
      console.log(`Received ${data.length} whale notifications from API`);
      return data;
    } catch (error) {
      console.error('Error fetching whale notifications:', error);
      
      // Check for CORS errors
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        console.error('This could be a CORS issue. Make sure the backend allows requests from this origin.');
      }
      
      throw error;
    }
  }

  // Get token statistics
  async getTokenStats(): Promise<TokenStats[]> {
    try {
      console.log('Fetching token stats from URL:', `${this.baseUrl}/token-stats`);
      
      const response = await fetch(`${this.baseUrl}/token-stats`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        mode: 'cors'
      });
      
      if (!response.ok) {
        // Try to get error details from the response
        let errorDetail;
        try {
          errorDetail = await response.json();
        } catch (e) {
          errorDetail = await response.text();
        }
        
        throw new Error(`API request failed with status: ${response.status}, details: ${JSON.stringify(errorDetail)}`);
      }
      
      const data = await response.json();
      console.log(`Received ${data.length} token stats from API`);
      return data;
    } catch (error) {
      console.error('Error fetching token stats:', error);
      throw error;
    }
  }
}

// Create singleton instance
const snowflakeClient = new SnowflakeClient();
export default snowflakeClient;