# RAG Implementation AWS Architecture Diagrams

## Overview
Generated AWS architecture diagrams for the RAG (Retrieval-Augmented Generation) implementation project based on the technical design specifications.

## Generated Diagrams

### 1. RAG Architecture Overview (`rag_architecture.png`)
**Purpose**: High-level system architecture showing all major components and their relationships.

**Components**:
- **User**: End user interacting with the system
- **React Frontend**: Local development frontend application
- **API Gateway**: AWS API Gateway for HTTP endpoint management
- **Lambda Function**: Node.js backend processing logic
- **Amazon Kendra**: Document indexing and semantic search service
- **Amazon Bedrock**: Claude 4 LLM for response generation
- **S3 Bucket**: Document storage repository
- **DynamoDB**: Metadata and configuration storage

**Key Features**:
- Left-to-right flow showing user interaction path
- Clear separation of frontend, API, backend, and storage layers
- Document sync flow from S3 to Kendra

### 2. RAG Data Flow Architecture (`rag_data_flow.png`)
**Purpose**: Detailed data flow showing the complete question processing workflow.

**Data Flow Steps**:
1. User submits question through React frontend
2. HTTP POST request to API Gateway
3. API Gateway invokes Lambda function
4. Lambda performs search query against Kendra
5. Kendra retrieves relevant context for Bedrock
6. Bedrock generates AI response using Claude 4
7. Response returned through Lambda to API Gateway
8. JSON response sent back to React frontend
9. Result displayed to user

**Additional Flows**:
- Document ingestion: S3 auto-sync to Kendra (blue dashed line)
- Metadata storage: Lambda to DynamoDB (green dotted line)

### 3. RAG Deployment Architecture (`rag_deployment.png`)
**Purpose**: Infrastructure deployment view showing development and AWS cloud components.

**Local Development**:
- Developer machine with CDK deployment capabilities
- React development server running on localhost:3000

**AWS Infrastructure**:
- **Network & Security**: IAM roles and policies
- **API & Compute**: API Gateway and Lambda function
- **AI/ML Platform**: Kendra index and Bedrock Claude 4
- **Data Storage**: S3 bucket and DynamoDB table
- **Monitoring**: CloudWatch for logs and metrics

**Deployment Flow**:
- CDK deployment from developer machine to AWS
- API calls from React dev server to API Gateway
- Security policies applied via IAM roles
- Monitoring through CloudWatch integration

## Architecture Highlights

### Serverless Design
- Fully serverless architecture using AWS Lambda
- Auto-scaling capabilities for variable workloads
- Pay-per-use pricing model

### AI/ML Integration
- Amazon Kendra for intelligent document search
- Amazon Bedrock with Claude 4 for advanced language understanding
- Seamless integration between search and generation services

### Data Storage Strategy
- S3 for document repository with automatic Kendra sync
- DynamoDB for application metadata and configuration
- No authentication required for prototype implementation

### Development Approach
- Local React development with AWS backend
- CDK for infrastructure as code
- CloudWatch for monitoring and debugging

## File Locations
All diagrams are stored in:
`/home/pandson/echo-architect-artifacts/rag-implementation-112820251503/generated-diagrams/generated-diagrams/`

- `rag_architecture.png` - Main architecture overview
- `rag_data_flow.png` - Detailed data flow diagram  
- `rag_deployment.png` - Deployment architecture view

## Technical Specifications Compliance
- Uses DynamoDB as the primary backend data store (as required)
- Excludes SageMaker, CloudFront, Amplify, and Cognito (as specified)
- No authentication implementation (prototype requirement)
- React frontend instead of CloudFront (as specified)
- Excludes Amazon Forecast service (as required)
