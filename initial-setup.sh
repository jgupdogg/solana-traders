#!/bin/bash
set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print header
echo -e "${BLUE}"
echo "============================================================="
echo "       Solana Traders Dashboard - Complete Setup Script      "
echo "============================================================="
echo -e "${NC}"

# Get environment from parameter or default to dev
ENVIRONMENT=${1:-dev}
echo -e "${YELLOW}Setting up environment: ${ENVIRONMENT}${NC}"

# Set stack name
STACK_NAME="solana-traders-stack-${ENVIRONMENT}"

# Get AWS account ID and region
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query "Account" --output text)
AWS_REGION=$(aws configure get region)
if [ -z "$AWS_REGION" ]; then
  AWS_REGION="us-east-1"
  echo -e "${YELLOW}No AWS region found, defaulting to: ${AWS_REGION}${NC}"
fi

# Get bucket prefix from user
echo -e "${YELLOW}Enter an S3 bucket prefix (a unique suffix will be added automatically):${NC}"
read -p "Bucket prefix [solana-traders]: " S3_BUCKET_PREFIX
S3_BUCKET_PREFIX=${S3_BUCKET_PREFIX:-solana-traders}

# Check if CloudFormation template exists
CF_TEMPLATE="container-cloudformation.yaml"
if [ ! -f "$CF_TEMPLATE" ]; then
  echo -e "${RED}CloudFormation template $CF_TEMPLATE not found!${NC}"
  exit 1
fi

# Create the CloudFormation stack
echo -e "${YELLOW}Creating CloudFormation stack: ${STACK_NAME}...${NC}"
aws cloudformation create-stack \
  --stack-name "$STACK_NAME" \
  --template-body "file://$CF_TEMPLATE" \
  --parameters ParameterKey=Environment,ParameterValue="$ENVIRONMENT" \
               ParameterKey=S3BucketPrefix,ParameterValue="$S3_BUCKET_PREFIX" \
  --capabilities CAPABILITY_NAMED_IAM \
  --region "$AWS_REGION"

echo -e "${GREEN}CloudFormation stack creation initiated. Waiting for stack to complete...${NC}"
echo -e "${YELLOW}This may take 5-10 minutes. Please be patient.${NC}"

# Wait for stack creation to complete with better error handling
if ! aws cloudformation wait stack-create-complete --stack-name "$STACK_NAME" --region "$AWS_REGION"; then
  echo -e "${RED}Stack creation failed.${NC}"
  
  # Show the failed resources
  echo -e "${YELLOW}Failed resources:${NC}"
  aws cloudformation describe-stack-events \
    --stack-name "$STACK_NAME" \
    --query "StackEvents[?ResourceStatus=='CREATE_FAILED'].[LogicalResourceId,ResourceStatusReason]" \
    --output table
    
  exit 1
fi

echo -e "${GREEN}CloudFormation stack created successfully!${NC}"

# Function to retrieve CloudFormation outputs
get_cf_output() {
  local output_key=$1
  local output_value=$(aws cloudformation describe-stacks --stack-name "$STACK_NAME" \
    --query "Stacks[0].Outputs[?OutputKey=='$output_key'].OutputValue" \
    --output text --region "$AWS_REGION")
  
  if [ -z "$output_value" ] || [ "$output_value" == "None" ]; then
    echo -e "${RED}Failed to get $output_key from CloudFormation stack.${NC}" >&2
    return 1
  fi
  
  echo "$output_value"
}

# Get resources from the stack
S3_BUCKET=$(get_cf_output "S3BucketName")
CLOUDFRONT_ID=$(get_cf_output "CloudFrontDistributionId")
LAMBDA_FUNCTION_NAME=$(get_cf_output "LambdaFunctionName")
ECR_REPOSITORY=$(get_cf_output "ECRRepositoryName")
ECR_REPOSITORY_URI=$(get_cf_output "ECRRepositoryUri")
API_ENDPOINT=$(get_cf_output "ApiEndpoint")

# Display resources
echo -e "${GREEN}CloudFormation resources created:${NC}"
echo -e "  ${YELLOW}Frontend S3 Bucket:${NC} $S3_BUCKET"
echo -e "  ${YELLOW}CloudFront Distribution:${NC} $CLOUDFRONT_ID"
echo -e "  ${YELLOW}Lambda Function:${NC} $LAMBDA_FUNCTION_NAME"
echo -e "  ${YELLOW}ECR Repository:${NC} $ECR_REPOSITORY"
echo -e "  ${YELLOW}API Endpoint:${NC} $API_ENDPOINT"

# Check if Dockerfile exists in backend directory
if [ ! -f "backend/Dockerfile" ]; then
  echo -e "${YELLOW}Creating Dockerfile in backend directory...${NC}"
  mkdir -p backend
  cat > backend/Dockerfile << 'EOF'
FROM public.ecr.aws/lambda/python:3.9

# Copy requirements file
COPY requirements.txt ${LAMBDA_TASK_ROOT}

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application files
COPY app.py ${LAMBDA_TASK_ROOT}
COPY lambda_adapter.py ${LAMBDA_TASK_ROOT}

# Set the handler
CMD [ "lambda_adapter.lambda_handler" ]
EOF
  echo -e "${GREEN}Dockerfile created in backend directory.${NC}"
fi

# Build and deploy frontend
echo -e "\n${YELLOW}Building the frontend application...${NC}"
npm install
npm run build

if [ $? -ne 0 ]; then
  echo -e "${RED}Frontend build failed.${NC}"
  echo -e "${YELLOW}This doesn't affect your infrastructure, which was still created successfully.${NC}"
  echo -e "${YELLOW}Fix the build issues and deploy manually later.${NC}"
else
  echo -e "${YELLOW}Deploying frontend to S3 bucket...${NC}"
  aws s3 sync dist/ s3://$S3_BUCKET --delete --region $AWS_REGION
fi

# Build and deploy backend Docker image
echo -e "\n${YELLOW}Building and deploying backend Docker image...${NC}"

# Get ECR login password
echo -e "${GREEN}Logging in to ECR...${NC}"
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com

# Build the Docker image
echo -e "${GREEN}Building Docker image...${NC}"
cd backend
docker build -t $ECR_REPOSITORY:latest .

# Tag the image
echo -e "${GREEN}Tagging Docker image...${NC}"
docker tag $ECR_REPOSITORY:latest $ECR_REPOSITORY_URI:latest

# Push the image to ECR
echo -e "${GREEN}Pushing Docker image to ECR...${NC}"
docker push $ECR_REPOSITORY_URI:latest

# Update Lambda function to use the new container image
echo -e "${GREEN}Updating Lambda function to use the new container image...${NC}"
aws lambda update-function-code \
  --function-name $LAMBDA_FUNCTION_NAME \
  --image-uri $ECR_REPOSITORY_URI:latest \
  --region $AWS_REGION

# Wait for the Lambda update to complete
echo -e "${YELLOW}Waiting for Lambda update to complete...${NC}"
aws lambda wait function-updated-v2 \
  --function-name $LAMBDA_FUNCTION_NAME \
  --region $AWS_REGION

cd ..

# Invalidate CloudFront cache
echo -e "${YELLOW}Invalidating CloudFront cache...${NC}"
aws cloudfront create-invalidation \
  --distribution-id $CLOUDFRONT_ID \
  --paths "/*" \
  --region $AWS_REGION

# Create deployment script for future updates
echo -e "\n${YELLOW}Creating deployment script for future updates...${NC}"
cat > deploy.sh << EOF
#!/bin/bash
set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print header
echo -e "\${BLUE}"
echo "============================================================="
echo "       Solana Traders Dashboard - Deployment Script          "
echo "============================================================="
echo -e "\${NC}"

# Get environment from parameter or default to dev
ENVIRONMENT=\${1:-$ENVIRONMENT}
echo -e "\${YELLOW}Deploying to environment: \${ENVIRONMENT}\${NC}"

# Set stack name
STACK_NAME="solana-traders-stack-\${ENVIRONMENT}"

# Get AWS account ID
AWS_ACCOUNT_ID=\$(aws sts get-caller-identity --query "Account" --output text)
AWS_REGION=\$(aws configure get region)
if [ -z "\$AWS_REGION" ]; then
  AWS_REGION="$AWS_REGION"
fi

# Hardcoded resource values from initial setup
S3_BUCKET="$S3_BUCKET"
CLOUDFRONT_ID="$CLOUDFRONT_ID"
LAMBDA_FUNCTION_NAME="$LAMBDA_FUNCTION_NAME"
ECR_REPOSITORY="$ECR_REPOSITORY"
ECR_REPOSITORY_URI="$ECR_REPOSITORY_URI"
API_ENDPOINT="$API_ENDPOINT"

# Build and deploy frontend
echo -e "\n\${YELLOW}Building the frontend application...\${NC}"
npm install
npm run build

if [ \$? -ne 0 ]; then
  echo -e "\${RED}Frontend build failed.\${NC}"
  exit 1
fi

echo -e "\${YELLOW}Deploying frontend to S3 bucket...\${NC}"
aws s3 sync dist/ s3://\$S3_BUCKET --delete --region \$AWS_REGION

# Build and deploy backend Docker image
echo -e "\n\${YELLOW}Building and deploying backend Docker image...\${NC}"

# Get ECR login password
echo -e "\${GREEN}Logging in to ECR...\${NC}"
aws ecr get-login-password --region \$AWS_REGION | docker login --username AWS --password-stdin \$AWS_ACCOUNT_ID.dkr.ecr.\$AWS_REGION.amazonaws.com

# Build the Docker image
echo -e "\${GREEN}Building Docker image...\${NC}"
cd backend
docker build -t \$ECR_REPOSITORY:latest .

# Tag the image
echo -e "\${GREEN}Tagging Docker image...\${NC}"
docker tag \$ECR_REPOSITORY:latest \$ECR_REPOSITORY_URI:latest

# Push the image to ECR
echo -e "\${GREEN}Pushing Docker image to ECR...\${NC}"
docker push \$ECR_REPOSITORY_URI:latest

# Update Lambda function to use the new container image
echo -e "\${GREEN}Updating Lambda function to use the new container image...\${NC}"
aws lambda update-function-code \\
  --function-name \$LAMBDA_FUNCTION_NAME \\
  --image-uri \$ECR_REPOSITORY_URI:latest \\
  --region \$AWS_REGION

# Wait for the Lambda update to complete
echo -e "\${YELLOW}Waiting for Lambda update to complete...\${NC}"
aws lambda wait function-updated-v2 \\
  --function-name \$LAMBDA_FUNCTION_NAME \\
  --region \$AWS_REGION

cd ..

# Invalidate CloudFront cache
echo -e "\${YELLOW}Invalidating CloudFront cache...\${NC}"
aws cloudfront create-invalidation \\
  --distribution-id \$CLOUDFRONT_ID \\
  --paths "/*" \\
  --region \$AWS_REGION

echo -e "\n\${GREEN}=====\${NC}"
echo -e "\${GREEN}Solana Traders Dashboard has been successfully deployed!\${NC}"
echo -e "\${GREEN}=====\${NC}"
echo -e "\n\${YELLOW}Frontend URL:\${NC} https://\$(aws cloudformation describe-stacks --stack-name \$STACK_NAME \\
  --query "Stacks[0].Outputs[?OutputKey=='FrontendURL'].OutputValue" --output text | sed 's|https://||')"
echo -e "\${YELLOW}API Endpoint:\${NC} \$API_ENDPOINT"

# Test the Lambda function
echo -e "\n\${YELLOW}Testing Lambda function...\${NC}"
echo -e "\${BLUE}Invoking health check endpoint...\${NC}"
HEALTH_CHECK_RESPONSE=\$(curl -s "\$API_ENDPOINT/health")
echo -e "\${GREEN}Health check response:\${NC} \$HEALTH_CHECK_RESPONSE"

echo -e "\n\${GREEN}Deployment complete!\${NC}"
EOF

chmod +x deploy.sh

echo -e "\n${GREEN}=====================================================${NC}"
echo -e "${GREEN}Solana Traders Dashboard has been successfully set up!${NC}"
echo -e "${GREEN}=====================================================${NC}"
echo -e "\n${YELLOW}Frontend URL:${NC} https://$(aws cloudformation describe-stacks --stack-name $STACK_NAME \
  --query "Stacks[0].Outputs[?OutputKey=='FrontendURL'].OutputValue" --output text | sed 's|https://||')"
echo -e "${YELLOW}API Endpoint:${NC} $API_ENDPOINT"
echo -e "\n${GREEN}You should be able to access your application in a few minutes.${NC}"
echo -e "${YELLOW}Note: DNS propagation and CloudFront distribution may take up to 15 minutes.${NC}"
echo -e "\n${BLUE}For future deployments, simply run:${NC}"
echo -e "${YELLOW}./deploy.sh${NC}"

# Test the Lambda function
echo -e "\n${YELLOW}Testing Lambda function...${NC}"
echo -e "${BLUE}Invoking health check endpoint...${NC}"
HEALTH_CHECK_RESPONSE=$(curl -s "$API_ENDPOINT/health")
echo -e "${GREEN}Health check response:${NC} $HEALTH_CHECK_RESPONSE"

echo -e "\n${GREEN}Setup complete!${NC}"