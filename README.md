# Solana Traders Dashboard

A modern, standalone dashboard for monitoring whale trading activity on the Solana blockchain. This application provides real-time insights into significant trading patterns that can indicate future price movements.

![Solana Traders Dashboard](https://i.imgur.com/placeholder.png)

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [AWS Deployment Strategy](#aws-deployment-strategy)
  - [Deployment Architecture](#deployment-architecture)
  - [Why This Approach](#why-this-approach)
  - [Avoided Pitfalls](#avoided-pitfalls)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Local Development](#local-development)
  - [Deployment](#deployment)
- [Maintenance and Updates](#maintenance-and-updates)
- [Troubleshooting](#troubleshooting)

## Overview

Solana Traders Dashboard monitors and visualizes whale trading activity by tracking significant buy and sell transactions for popular Solana tokens. The data is sourced from Snowflake warehouses to identify market trends and potential price movements.

## Features

- **Real-time Monitoring**: Track whale trading activity on the Solana blockchain
- **Dark/Light Mode**: Supports both dark and light themes with system preference detection
- **Responsive Design**: Works on desktop and mobile devices
- **Interactive UI**: Clean, modern design with hover effects and clear data visualization
- **Serverless Architecture**: Deployed on AWS using modern cloud-native patterns
- **Container-based Backend**: FastAPI backend deployed as a containerized Lambda function

## Architecture

The application consists of the following components:

### Frontend
- **React** SPA built with **Vite** and **TypeScript**
- **TailwindCSS** for styling
- **React Context API** for state management
- Hosted on **S3** and distributed via **CloudFront**

### Backend
- **FastAPI** REST API for data access
- **Snowflake** database integration for blockchain data
- Packaged as a **Docker container** and deployed to AWS Lambda
- API Gateway triggers for HTTP access

### Infrastructure
- **AWS CloudFormation** for infrastructure as code
- **S3** for static frontend hosting
- **CloudFront** for global content distribution
- **Lambda** (container-based) for serverless backend
- **API Gateway** for RESTful API endpoints
- **ECR** for Docker image storage
- **CloudWatch** for logging and monitoring

## AWS Deployment Strategy

### Deployment Architecture

Our deployment approach uses AWS CloudFormation to create a production-ready infrastructure stack:

1. **Frontend**: Static React files hosted in S3, distributed through CloudFront for global caching
2. **Backend**: Container-based Lambda functions triggered by API Gateway, pulling data from Snowflake

The container-based Lambda approach allows us to package complex dependencies (FastAPI, Snowflake client) without dealing with Lambda layers.

### Why This Approach

We chose this specific deployment pattern for several reasons:

1. **Serverless Benefits**: No servers to manage, auto-scaling, and pay-per-use pricing
2. **Container Simplicity**: Using containers eliminates dependency complexities that often plague Python Lambda functions
3. **CloudFormation for IaC**: Infrastructure as code ensures consistency and repeatability
4. **Separation of Concerns**: Two-step deployment process resolves circular dependencies in CloudFormation
5. **Cost Effective**: Serverless + S3/CloudFront is extremely cost-effective for this type of application

### Avoided Pitfalls

During deployment, we successfully navigated several common pitfalls:

1. **Circular Dependencies**: Traditional CloudFormation approaches often fail when Lambda images depend on ECR repositories created by the same stack. We solved this by creating a bootstrap process that creates the ECR repository and uploads images before CloudFormation execution.

2. **Cold Start Performance**: Container-based Lambdas can have longer cold starts. We addressed this by optimizing our base image and setting appropriate memory settings.

3. **CORS Issues**: Frontend-to-backend communication can be blocked by CORS. We implemented comprehensive CORS settings in our FastAPI application to allow CloudFront origins.

4. **Environment Configuration**: We created separate environment configurations for development and production to ensure the right API endpoints are used.

5. **CloudFront Caching**: Frontend updates can be delayed by CloudFront caching. We integrated cache invalidation into our deployment process.

## Getting Started

### Prerequisites

- Node.js 18+
- Python 3.9+
- Docker
- AWS CLI configured with appropriate credentials
- Snowflake account and credentials (for data access)

### Local Development

1. Clone the repository:
```bash
git clone https://github.com/yourusername/solana-traders-dashboard.git
cd solana-traders-dashboard
```

2. Install frontend dependencies:
```bash
npm install
```

3. Set up backend:
```bash
cd backend
pip install -r requirements.txt
```

4. Create a `.env` file with your Snowflake credentials:
```
SNOWFLAKE_ACCOUNT=your_account
SNOWFLAKE_USER=your_user
SNOWFLAKE_PASSWORD=your_password
SNOWFLAKE_WAREHOUSE=your_warehouse
SNOWFLAKE_DATABASE=your_database
SNOWFLAKE_SCHEMA=your_schema
SNOWFLAKE_ROLE=your_role
```

5. Start the backend:
```bash
uvicorn app:app --reload
```

6. Start the frontend (in a separate terminal):
```bash
npm run dev
```

7. Open your browser to http://localhost:5173

### Deployment

We've created two scripts to simplify deployment:

#### Initial Deployment

For first-time setup:

```bash
chmod +x bootstrap.sh
./bootstrap.sh

# Follow the instructions at the end of bootstrap.sh output
```

This script:
1. Creates the ECR repository
2. Builds and pushes the initial Docker image
3. Creates the CloudFormation template with the correct image URI
4. Provides the command to create the CloudFormation stack

#### Subsequent Updates

For ongoing updates:

```bash
chmod +x deploy.sh
./deploy.sh
```

This script:
1. Builds and pushes a new Docker image
2. Updates the Lambda function
3. Builds and deploys frontend changes
4. Invalidates the CloudFront cache

## Maintenance and Updates

To update the application:

1. Make your code changes
2. Run the deployment script:
```bash
./deploy.sh
```

To monitor the application:

1. View CloudWatch logs for Lambda:
```bash
aws logs filter-log-events --log-group-name /aws/lambda/solana-traders-stack-dev-function
```

2. Check CloudFront distribution status:
```bash
aws cloudfront get-distribution --id YOUR_DISTRIBUTION_ID
```

## Troubleshooting

If you encounter issues with the deployment:

1. **CORS Errors**: Ensure the CloudFront domain is listed in the CORS middleware configuration in `app.py`

2. **API Connection Issues**: Check environment variables in the frontend build. Make sure `.env.production` contains the correct API URL.

3. **Lambda Errors**: Examine CloudWatch logs for detailed error messages

4. **Container Build Issues**: Make sure Docker is running and properly configured

5. **Database Connection**: Verify Snowflake credentials are correctly stored in AWS Parameter Store

For more troubleshooting help, see the detailed error logs in CloudWatch or reach out to the development team.

---

Built with ❤️ by Your Team