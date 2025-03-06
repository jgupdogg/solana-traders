#!/bin/bash
set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query "Account" --output text)
AWS_REGION="us-east-1"
ECR_REPOSITORY="solana-traders-api"
ECR_IMAGE_TAG="latest"
LAMBDA_FUNCTION_NAME="solana-traders-api"

# API Gateway Configuration - now as environment variables with defaults
REST_API_ID="${REST_API_ID:-b6erx3uy97}"
RESOURCE_ID="${RESOURCE_ID:-eef9sr}"
API_STAGE_NAME="${API_STAGE_NAME:-prod}"

echo -e "${YELLOW}Building and deploying Lambda container...${NC}"

# Create ECR repository if it doesn't exist
if ! aws ecr describe-repositories --repository-names $ECR_REPOSITORY > /dev/null 2>&1; then
    echo -e "${YELLOW}Creating ECR repository...${NC}"
    aws ecr create-repository --repository-name $ECR_REPOSITORY
fi

# Get ECR login password
echo -e "${GREEN}Logging in to ECR...${NC}"
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com

# Build the Docker image
echo -e "${GREEN}Building Docker image...${NC}"
cd docker
docker build -t $ECR_REPOSITORY:$ECR_IMAGE_TAG .

# Tag the image
echo -e "${GREEN}Tagging Docker image...${NC}"
docker tag $ECR_REPOSITORY:$ECR_IMAGE_TAG $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPOSITORY:$ECR_IMAGE_TAG

# Push the image to ECR
echo -e "${GREEN}Pushing Docker image to ECR...${NC}"
docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPOSITORY:$ECR_IMAGE_TAG

# Check if Lambda function exists and delete it if it does
if aws lambda get-function --function-name $LAMBDA_FUNCTION_NAME > /dev/null 2>&1; then
    echo -e "${YELLOW}Deleting existing Lambda function...${NC}"
    aws lambda delete-function --function-name $LAMBDA_FUNCTION_NAME
    
    # Wait a bit for deletion to complete
    echo -e "${YELLOW}Waiting for function deletion to complete...${NC}"
    sleep 10
fi

# Check if role exists
if ! aws iam get-role --role-name solana-traders-lambda-role &> /dev/null; then
    echo -e "${YELLOW}Creating IAM role...${NC}"
    aws iam create-role \
        --role-name solana-traders-lambda-role \
        --assume-role-policy-document '{
            "Version": "2012-10-17",
            "Statement": [
                {
                    "Effect": "Allow",
                    "Principal": {
                        "Service": "lambda.amazonaws.com"
                    },
                    "Action": "sts:AssumeRole"
                }
            ]
        }'

    echo -e "${YELLOW}Attaching policies to role...${NC}"
    aws iam attach-role-policy \
        --role-name solana-traders-lambda-role \
        --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole

    aws iam attach-role-policy \
        --role-name solana-traders-lambda-role \
        --policy-arn arn:aws:iam::aws:policy/AmazonSSMReadOnlyAccess
    
    # Wait for role to propagate
    echo -e "${YELLOW}Waiting for role to propagate...${NC}"
    sleep 10
fi

# Get role ARN
ROLE_ARN=$(aws iam get-role --role-name solana-traders-lambda-role --query "Role.Arn" --output text)

# Create new Lambda function with container image
echo -e "${GREEN}Creating new Lambda function with container image...${NC}"
aws lambda create-function \
    --function-name $LAMBDA_FUNCTION_NAME \
    --package-type Image \
    --code ImageUri=$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPOSITORY:$ECR_IMAGE_TAG \
    --role $ROLE_ARN \
    --timeout 30 \
    --memory-size 256

echo -e "${GREEN}Lambda container deployment complete!${NC}"

# Add these lines after Lambda function creation
echo -e "${GREEN}Configuring API Gateway Lambda integration...${NC}"

# Validate REST_API_ID and RESOURCE_ID
if [[ -z "$REST_API_ID" || -z "$RESOURCE_ID" ]]; then
    echo -e "${RED}Error: REST_API_ID or RESOURCE_ID is not set.${NC}"
    echo -e "${YELLOW}Set these using environment variables:${NC}"
    echo -e "  export REST_API_ID=your-api-id"
    echo -e "  export RESOURCE_ID=your-resource-id"
    exit 1
fi

# Update the integration method to match GET
aws apigateway update-integration \
    --rest-api-id "$REST_API_ID" \
    --resource-id "$RESOURCE_ID" \
    --http-method GET \
    --patch-operations op=replace,path=/httpMethod,value=GET

# Add Lambda permission to API Gateway if not already exists
aws lambda add-permission \
    --function-name "$LAMBDA_FUNCTION_NAME" \
    --statement-id apigateway-test-1 \
    --action lambda:InvokeFunction \
    --principal apigateway.amazonaws.com \
    --source-arn "arn:aws:execute-api:$AWS_REGION:$AWS_ACCOUNT_ID:$REST_API_ID/*/GET/api/whale-notifications"

# Create a new deployment
aws apigateway create-deployment \
    --rest-api-id "$REST_API_ID" \
    --stage-name "$API_STAGE_NAME"

echo -e "${GREEN}API Gateway integration updated and redeployed!${NC}"

# Show the function details
echo -e "${GREEN}Lambda function details:${NC}"
aws lambda get-function --function-name "$LAMBDA_FUNCTION_NAME" --query 'Configuration.[FunctionName,State,LastUpdateStatus]'