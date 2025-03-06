// src/services/SnowflakeClient.production.ts
// (Replace SnowflakeClient.ts with this file when deploying to production)

// Types for the whale notification data
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
  
  /**
   * API base URL should be set in your environment variables
   * It will point to your FastAPI backend service
   */
  // Use environment variable if available, otherwise fallback to localhost
  const API_BASE_URL = typeof import.meta.env !== 'undefined' 
    ? (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api')
    : 'http://localhost:8000/api';
  
  /**
   * Client for the Snowflake data API.
   * This makes calls to your FastAPI backend service which connects to Snowflake.
   */
  class SnowflakeClient {
    /**
     * Fetches whale notification data from the API
     * @param {number} limit Optional number of records to limit the response to
     * @returns {Promise<WhaleNotification[]>} A promise that resolves to an array of whale notifications
     */
    static async getWhaleNotifications(limit = 100): Promise<WhaleNotification[]> {
      try {
        console.log(`Fetching data from: ${API_BASE_URL}/whale-notifications?limit=${limit}`);
        const response = await fetch(`${API_BASE_URL}/whale-notifications?limit=${limit}`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          mode: 'cors',
          credentials: 'same-origin'
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
        console.log(`Received ${data.length} whale notifications`);
        return data;
      } catch (error) {
        console.error('Error fetching whale notifications:', error);
        
        // If it's a CORS error, suggest checking the backend CORS settings
        if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
          console.error('This could be a CORS issue. Make sure the backend allows requests from this origin.');
        }
        
        throw error;
      }
    }
    
    /**
     * Fetches a specific number of recent whale notifications
     * @param {number} limit The number of notifications to fetch
     * @returns {Promise<WhaleNotification[]>} A promise that resolves to an array of whale notifications
     */
    static async getRecentWhaleNotifications(limit: number): Promise<WhaleNotification[]> {
      return this.getWhaleNotifications(limit);
    }
    
    /**
     * Fetches token-specific whale notifications
     * @param {string} symbol The token symbol to filter by
     * @param {number} limit Optional number of records to limit the response to
     * @returns {Promise<WhaleNotification[]>} A promise that resolves to an array of whale notifications
     */
    static async getTokenWhaleNotifications(symbol: string, limit = 100): Promise<WhaleNotification[]> {
      try {
        const response = await fetch(`${API_BASE_URL}/whale-notifications?symbol=${symbol}&limit=${limit}`);
        
        if (!response.ok) {
          throw new Error(`API request failed with status: ${response.status}`);
        }
        
        const data = await response.json();
        return data;
      } catch (error) {
        console.error(`Error fetching whale notifications for token ${symbol}:`, error);
        throw error;
      }
    }
    
    /**
     * Fetches token statistics with aggregated metrics
     * @returns {Promise<any[]>} A promise that resolves to token statistics
     */
    static async getTokenStats(): Promise<any[]> {
      try {
        const response = await fetch(`${API_BASE_URL}/token-stats`);
        
        if (!response.ok) {
          throw new Error(`API request failed with status: ${response.status}`);
        }
        
        const data = await response.json();
        return data;
      } catch (error) {
        console.error('Error fetching token stats:', error);
        throw error;
      }
    }
  }
  
  export default SnowflakeClient;