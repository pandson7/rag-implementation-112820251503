# Technical Design Document

## Architecture Overview

The RAG implementation follows a serverless architecture using AWS services for document processing, indexing, and AI-powered response generation. The system consists of a React frontend hosted locally and a Node.js backend deployed on AWS Lambda, with Amazon Kendra for document indexing and Amazon Bedrock for response generation.

## System Components

### Frontend Layer
- **Technology**: React.js (hosted locally)
- **Purpose**: Provides user interface for question input, sample questions display, and response visualization
- **Key Features**:
  - Question input field with natural language support
  - Sample questions selection interface
  - Response display area with formatted output
  - Real-time interaction with backend API

### Backend Layer
- **Technology**: Node.js runtime on AWS Lambda
- **Purpose**: Handles API requests, orchestrates document retrieval and AI response generation
- **Key Components**:
  - API Gateway for HTTP endpoint exposure
  - Lambda functions for business logic
  - Integration with Amazon Kendra and Bedrock

### Document Processing Layer
- **Technology**: Amazon Kendra
- **Purpose**: Document indexing, vector embedding generation, and semantic search
- **Key Features**:
  - Automatic document ingestion from S3 bucket
  - Built-in vector embedding generation
  - Semantic search capabilities
  - Content ranking and relevance scoring

### AI Response Generation Layer
- **Technology**: Amazon Bedrock with Claude 4 LLM
- **Purpose**: Generate comprehensive, contextually accurate responses
- **Key Features**:
  - Natural language understanding
  - Context-aware response generation
  - Integration with retrieved document content

### Data Storage Layer
- **Technology**: Amazon DynamoDB
- **Purpose**: Store application metadata, user sessions, and system configuration
- **Key Features**:
  - Sample questions storage
  - System configuration management
  - Performance metrics tracking

## System Architecture Diagram

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   React Frontend│    │   API Gateway    │    │  Lambda Backend │
│   (Local Host)  │◄──►│                  │◄──►│   (Node.js)     │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                                         │
                                                         ▼
                       ┌─────────────────┐    ┌─────────────────┐
                       │  Amazon Kendra  │    │ Amazon Bedrock  │
                       │   (Document     │◄──►│  (Claude 4 LLM) │
                       │   Indexing)     │    │                 │
                       └─────────────────┘    └─────────────────┘
                                │                        │
                                ▼                        ▼
                       ┌─────────────────┐    ┌─────────────────┐
                       │   Amazon S3     │    │   DynamoDB      │
                       │  (Documents)    │    │  (Metadata)     │
                       └─────────────────┘    └─────────────────┘
```

## Data Flow

### Document Ingestion Flow
1. Documents from ~/ea_sample_docs/rag_docs are uploaded to S3 bucket
2. S3 triggers Kendra data source sync
3. Kendra processes documents and generates vector embeddings
4. Indexed content is stored in Kendra index for retrieval

### Question Processing Flow
1. User submits question through React frontend
2. API Gateway receives HTTP request
3. Lambda function processes the question
4. Kendra performs semantic search on indexed documents
5. Retrieved content is sent to Bedrock Claude 4 LLM
6. AI generates comprehensive response based on document context
7. Response is returned to frontend for display

## API Design

### Endpoints

#### POST /api/ask
**Purpose**: Process user questions and return AI-generated responses

**Request Body**:
```json
{
  "question": "string",
  "sessionId": "string (optional)"
}
```

**Response**:
```json
{
  "answer": "string",
  "sources": [
    {
      "documentName": "string",
      "excerpt": "string",
      "confidence": "number"
    }
  ],
  "sessionId": "string"
}
```

#### GET /api/sample-questions
**Purpose**: Retrieve predefined sample questions

**Response**:
```json
{
  "questions": [
    {
      "id": "string",
      "text": "string",
      "category": "string"
    }
  ]
}
```

## Security Considerations

### Authentication and Authorization
- No authentication required for prototype implementation
- API Gateway configured with appropriate CORS settings
- Lambda functions use IAM roles with minimal required permissions

### Data Protection
- Documents stored in S3 with server-side encryption
- API communications over HTTPS
- No sensitive data logging in CloudWatch

## Performance Considerations

### Scalability
- Lambda functions auto-scale based on demand
- Kendra index supports high query throughput
- DynamoDB configured with on-demand billing

### Optimization
- Kendra query results cached for common questions
- Lambda function warm-up strategies implemented
- Frontend implements loading states for better UX

## Infrastructure as Code

### CDK Implementation
- All AWS resources defined using AWS CDK
- Separate stacks for different environments
- Automated deployment pipeline excluded per requirements

### Resource Configuration
- Kendra index with appropriate capacity units
- Lambda functions with optimized memory allocation
- DynamoDB tables with appropriate read/write capacity

## Monitoring and Logging

### CloudWatch Integration
- Lambda function logs and metrics
- API Gateway access logs
- Kendra query performance metrics
- Custom application metrics for response accuracy

### Error Handling
- Comprehensive error handling in Lambda functions
- User-friendly error messages in frontend
- Automatic retry mechanisms for transient failures

## Development and Testing Strategy

### Local Development
- Frontend runs on local development server
- Backend deployed to AWS for integration testing
- Mock data for offline development

### Testing Approach
- Unit tests for Lambda functions
- Integration tests for API endpoints
- End-to-end tests for complete user workflows
- Performance testing for response times

## Deployment Strategy

### Simple CDK Deployment
- Single CDK deployment command
- No CI/CD pipeline implementation
- Manual verification of deployment success
- Environment-specific configuration management
