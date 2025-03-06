#!/bin/bash
set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Default values with timestamps to ensure uniqueness
TIMESTAMP=$(date +%s)
STACK_NAME="solana-traders-stack"
ENVIRONMENT="dev"
S3_BUCKET_NAME="solana-traders-dashboard-$TIMESTAMP"  # Making bucket name unique
ECR_REPOSITORY_NAME="solana-traders-api"

echo -e "${YELLOW}Using unique S3 bucket name: $S3_BUCKET_NAME${NC}"

# Check if the stack exists in ROLLBACK_COMPLETE state (failed creation)
if aws cloudformation describe-stacks --stack-name $STACK_NAME 2>/dev/null | grep -q "ROLLBACK_COMPLETE"; then
    echo -e "${RED}Found stack in ROLLBACK_COMPLETE state. Deleting it before proceeding...${NC}"
    aws cloudformation delete-stack --stack-name $STACK_NAME
    echo -e "${YELLOW}Waiting for stack deletion to complete...${NC}"
    aws cloudformation wait stack-delete-complete --stack-name $STACK_NAME
fi

# Function to get error details from CloudFormation events
function get_failure_reason() {
    echo -e "${RED}Stack creation/update failed. Checking for errors...${NC}"
    
    # Get the recent errors from CloudFormation events
    aws cloudformation describe-stack-events --stack-name $STACK_NAME \
        --query "StackEvents[?ResourceStatus=='CREATE_FAILED' || ResourceStatus=='UPDATE_FAILED'].{Resource:LogicalResourceId,Reason:ResourceStatusReason}" \
        --output table
    
    echo -e "${YELLOW}For more details, check the CloudFormation console or run:${NC}"
    echo -e "aws cloudformation describe-stack-events --stack-name $STACK_NAME"
}

echo -e "${GREEN}Creating CloudFormation stack...${NC}"

# Create the stack with detailed error checking
if ! aws cloudformation create-stack \
    --stack-name $STACK_NAME \
    --template-body file://solana-traders-stack.yaml \
    --parameters \
        ParameterKey=Environment,ParameterValue=$ENVIRONMENT \
        ParameterKey=S3BucketName,ParameterValue=$S3_BUCKET_NAME \
        ParameterKey=ECRRepositoryName,ParameterValue=$ECR_REPOSITORY_NAME \
    --capabilities CAPABILITY_NAMED_IAM; then
    
    echo -e "${RED}Failed to create stack. See above for errors.${NC}"
    exit 1
fi

echo -e "${YELLOW}Waiting for stack creation to complete (this may take a few minutes)...${NC}"

# Wait for the stack creation with error handling
if ! aws cloudformation wait stack-create-complete --stack-name $STACK_NAME; then
    get_failure_reason
    exit 1
fi

echo -e "${GREEN}Stack creation complete. Resources created successfully!${NC}"

# Get and display important outputs
echo -e "${YELLOW}Stack outputs:${NC}"
aws cloudformation describe-stacks --stack-name $STACK_NAME \
    --query "Stacks[0].Outputs[*].{Key:OutputKey,Value:OutputValue}" \
    --output table

echo -e "${GREEN}Deployment completed successfully!${NC}"
echo -e "${YELLOW}Note: To clean up all resources, run:${NC}"
echo -e "aws cloudformation delete-stack --stack-name $STACK_NAME"