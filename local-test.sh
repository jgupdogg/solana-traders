#!/bin/bash
set -e

echo "Building Docker image for local testing..."
cd backend
docker build -t solana-traders-local-test .

echo "Running Docker container with local environment variables..."
docker run -p 8000:8000 \
  -e SNOWFLAKE_ACCOUNT="dhpplkl-fxb50377" \
  -e SNOWFLAKE_USER="AIRFLOW_USER" \
  -e SNOWFLAKE_PASSWORD="RESU_WOLFRIA" \
  -e SNOWFLAKE_WAREHOUSE="DEV_WH" \
  -e SNOWFLAKE_DATABASE="DEV" \
  -e SNOWFLAKE_SCHEMA="BRONZE" \
  -e SNOWFLAKE_ROLE="AIRFLOW_ROLE" \
  -v "$(pwd):/app" \
  solana-traders-local-test