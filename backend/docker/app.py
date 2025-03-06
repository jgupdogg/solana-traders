import os
import logging
from typing import List, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy import create_engine, text
from urllib.parse import quote_plus
from datetime import datetime
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = FastAPI(title="Solana Traders API", description="API for Solana Traders Dashboard")

# Configure CORS - explicitly allow localhost domains
# Update CORS middleware to include API Gateway domain
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",  # Vite dev server
        "http://127.0.0.1:5173",
        "https://b6erx3uy97.execute-api.us-east-1.amazonaws.com",  # Add your API Gateway domain
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"]
)
# Pydantic models for data validation and serialization
class WhaleNotification(BaseModel):
    NOTIFICATION_ID: int
    TIMESTAMP: datetime
    ADDRESS: str
    SYMBOL: str
    NAME: str
    TIME_INTERVAL: str
    NUM_USERS_BOUGHT: int
    NUM_USERS_SOLD: int
    INSERTED_AT: datetime

def get_snowflake_connection_string():
    """
    Construct Snowflake connection string from environment variables
    """
    # Retrieve connection parameters
    account = os.getenv('SNOWFLAKE_ACCOUNT', '')
    user = os.getenv('SNOWFLAKE_USER', '')
    password = os.getenv('SNOWFLAKE_PASSWORD', '')
    warehouse = os.getenv('SNOWFLAKE_WAREHOUSE', 'DEV_WH')
    database = os.getenv('SNOWFLAKE_DATABASE', 'DEV')
    schema = os.getenv('SNOWFLAKE_SCHEMA', 'BRONZE')
    role = os.getenv('SNOWFLAKE_ROLE', 'AIRFLOW_ROLE')

    # Validate inputs
    if not all([account, user, password]):
        raise ValueError("Missing required Snowflake connection parameters")

    # Ensure inputs are strings
    account = str(account)
    user = str(user)
    password = str(password)

    # Construct connection string
    connection_string = (
        f"snowflake://{quote_plus(user)}:{quote_plus(password)}@"
        f"{quote_plus(account)}/{database}/{schema}?warehouse={warehouse}&role={role}"
    )
    
    return connection_string

def get_snowflake_engine():
    """
    Create a SQLAlchemy engine for Snowflake
    """
    connection_string = get_snowflake_connection_string()
    return create_engine(
        connection_string, 
        pool_size=5,  # Minimal connection pool
        max_overflow=0  # Prevent creating additional connections
    )

@app.get("/api/health")
def health_check():
    """
    Health check endpoint
    """
    return {"status": "ok", "timestamp": datetime.now().isoformat()}

@app.get("/api/debug")
async def debug_info():
    """
    Debug endpoint that returns information about the environment and configuration
    """
    # Get environment info
    env_info = {
        "SNOWFLAKE_ACCOUNT": os.getenv("SNOWFLAKE_ACCOUNT", "").replace("*", "*****"),
        "SNOWFLAKE_USER": os.getenv("SNOWFLAKE_USER", "").replace("*", "*****"),
        "SNOWFLAKE_PASSWORD": "******" if os.getenv("SNOWFLAKE_PASSWORD") else "Not set",
        "SNOWFLAKE_WAREHOUSE": os.getenv("SNOWFLAKE_WAREHOUSE", ""),
        "SNOWFLAKE_DATABASE": os.getenv("SNOWFLAKE_DATABASE", ""),
        "SNOWFLAKE_SCHEMA": os.getenv("SNOWFLAKE_SCHEMA", ""),
        "SNOWFLAKE_ROLE": os.getenv("SNOWFLAKE_ROLE", ""),
    }
    
    # Test database connection
    connection_status = "Not tested"
    try:
        engine = get_snowflake_engine()
        with engine.connect() as connection:
            result = connection.execute(text("SELECT CURRENT_WAREHOUSE()"))
            warehouse = result.scalar()
            connection_status = f"Connected to warehouse: {warehouse}"
    except Exception as e:
        connection_status = f"Connection failed: {str(e)}"
    
    # Attempt to get CORS settings safely
    cors_settings = {}
    try:
        # Look for the CORSMiddleware in the middleware stack
        cors_middleware = next(
            (mw for mw in app.user_middleware if mw.cls == CORSMiddleware),
            None
        )
        if cors_middleware:
            # Use getattr to safely access attributes; fallback to known defaults if not present.
            options = getattr(cors_middleware, "options", {})
            cors_settings["allow_origins"] = options.get("allow_origins", [])
            cors_settings["allow_methods"] = options.get("allow_methods", [])
        else:
            cors_settings = "CORS middleware not found"
    except Exception as e:
        cors_settings = f"Error retrieving CORS settings: {str(e)}"
    
    return {
        "timestamp": datetime.now().isoformat(),
        "environment": env_info,
        "connection_status": connection_status,
        "cors_settings": cors_settings
    }


@app.get("/api/whale-notifications", response_model=List[WhaleNotification])
async def get_whale_notifications(limit: Optional[int] = 100, symbol: Optional[str] = None):
    """
    Get whale notifications from Snowflake
    """
    try:
        engine = get_snowflake_engine()
        
        # Base query - explicitly use uppercase column names in the query
        query = """
            SELECT 
                NOTIFICATION_ID, TIMESTAMP, ADDRESS, SYMBOL, NAME, 
                TIME_INTERVAL, NUM_USERS_BOUGHT, NUM_USERS_SOLD, INSERTED_AT
            FROM DEV.BRONZE.WHALE_NOTIFICATIONS
        """
        
        # Add symbol filter if provided
        if symbol:
            query += f" WHERE SYMBOL = '{symbol}'"
        
        # Add ordering and limit
        query += " ORDER BY TIMESTAMP DESC LIMIT :limit"
        
        # Execute query
        with engine.connect() as connection:
            result = connection.execute(text(query), {"limit": limit})
            rows = result.fetchall()
            
            # Convert SQLAlchemy Row objects to dictionaries with uppercase keys
            notifications = []
            for row in rows:
                # Convert all field names to uppercase for consistency
                notification = {}
                for i, column in enumerate(result.keys()):
                    # Ensure field names are uppercase
                    notification[column.upper()] = row[i]
                notifications.append(notification)
            
            return notifications
            
    except Exception as e:
        logger.error(f"Error fetching whale notifications: {e}")
        # Log full traceback
        import traceback
        logger.error(traceback.format_exc())
        
        # Return a more detailed error response for debugging
        error_detail = {
            "message": str(e),
            "type": type(e).__name__,
            "traceback": traceback.format_exc().split("\n")
        }
        raise HTTPException(status_code=500, detail=error_detail)

@app.get("/api/token-stats")
async def get_token_stats():
    """
    Get aggregate statistics by token
    """
    try:
        engine = get_snowflake_engine()
        
        query = """
            SELECT 
                SYMBOL,
                NAME,
                COUNT(*) AS NOTIFICATION_COUNT,
                SUM(NUM_USERS_BOUGHT) AS TOTAL_BUYS,
                SUM(NUM_USERS_SOLD) AS TOTAL_SELLS,
                SUM(NUM_USERS_BOUGHT - NUM_USERS_SOLD) AS NET_ACTIVITY,
                MAX(TIMESTAMP) AS LATEST_ACTIVITY
            FROM DEV.BRONZE.WHALE_NOTIFICATIONS
            GROUP BY SYMBOL, NAME
            ORDER BY NET_ACTIVITY DESC
        """
        
        with engine.connect() as connection:
            result = connection.execute(text(query))
            rows = result.fetchall()
            
            # Convert SQLAlchemy Row objects to dictionaries with uppercase keys
            stats = []
            for row in rows:
                # Convert all field names to uppercase for consistency
                stat = {}
                for i, column in enumerate(result.keys()):
                    # Ensure field names are uppercase
                    stat[column.upper()] = row[i]
                stats.append(stat)
            
            return stats
            
    except Exception as e:
        logger.error(f"Error fetching token stats: {e}")
        import traceback
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    # Use environment variable for port or default to 8000
    port = int(os.getenv("PORT", 8000))
    # Start server
    uvicorn.run("app:app", host="0.0.0.0", port=port, reload=True)