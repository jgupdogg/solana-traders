#!/bin/bash
set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Make sure environment is set
if [ -z "$ENVIRONMENT" ]; then
  # Default to prod if not specified
  ENVIRONMENT="prod"
fi

echo -e "${GREEN}Building Solana Traders Dashboard for ${YELLOW}${ENVIRONMENT}${GREEN} environment...${NC}"

# Build the application
echo -e "${YELLOW}Building the application...${NC}"
npm run build

# Get S3 bucket name from CloudFormation stack
echo -e "${YELLOW}Getting S3 bucket name from CloudFormation stack...${NC}"
STACK_NAME="solana-traders-stack"
S3_BUCKET=$(aws cloudformation describe-stacks --stack-name $STACK_NAME \
  --query "Stacks[0].Outputs[?OutputKey=='S3BucketName'].OutputValue" \
  --output text)

if [ -z "$S3_BUCKET" ]; then
  echo -e "${RED}Failed to get S3 bucket name from CloudFormation stack.${NC}"
  echo -e "${YELLOW}Please specify the S3 bucket name manually:${NC}"
  read -p "S3 bucket name: " S3_BUCKET
fi

# Get CloudFront distribution ID
echo -e "${YELLOW}Getting CloudFront distribution ID from CloudFormation stack...${NC}"
CLOUDFRONT_ID=$(aws cloudformation describe-stacks --stack-name $STACK_NAME \
  --query "Stacks[0].Outputs[?OutputKey=='CloudFrontDistributionId'].OutputValue" \
  --output text)

if [ -z "$CLOUDFRONT_ID" ]; then
  echo -e "${RED}Failed to get CloudFront distribution ID from CloudFormation stack.${NC}"
  echo -e "${YELLOW}Please specify the CloudFront distribution ID manually:${NC}"
  read -p "CloudFront distribution ID: " CLOUDFRONT_ID
fi

# Deploy to S3
echo -e "${YELLOW}Deploying to S3 bucket: ${S3_BUCKET}...${NC}"
aws s3 sync dist/ s3://$S3_BUCKET --delete

# Invalidate CloudFront cache
echo -e "${YELLOW}Invalidating CloudFront cache for distribution: ${CLOUDFRONT_ID}...${NC}"
aws cloudfront create-invalidation \
  --distribution-id $CLOUDFRONT_ID \
  --paths "/*"

echo -e "${GREEN}Deployment complete!${NC}"
echo -e "${YELLOW}Your application is now available.${NC}"

# If the CloudFormation stack URL is available, display it
FRONTEND_URL=$(aws cloudformation describe-stacks --stack-name $STACK_NAME \
  --query "Stacks[0].Outputs[?OutputKey=='FrontendURL'].OutputValue" \
  --output text)

if [ -n "$FRONTEND_URL" ]; then
  echo -e "${GREEN}You can access your application at:${NC}"
  echo -e "${YELLOW}${FRONTEND_URL}${NC}"
fi