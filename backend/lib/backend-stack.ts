import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as kendra from 'aws-cdk-lib/aws-kendra';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';

export class RagImplementationStack112820251503 extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const suffix = '112820251503';

    // S3 bucket for documents
    const documentsBucket = new s3.Bucket(this, `DocumentsBucket${suffix}`, {
      bucketName: `rag-documents-${suffix}`,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      cors: [{
        allowedMethods: [s3.HttpMethods.GET, s3.HttpMethods.PUT, s3.HttpMethods.POST],
        allowedOrigins: ['*'],
        allowedHeaders: ['*'],
      }],
    });

    // DynamoDB table for sample questions
    const questionsTable = new dynamodb.Table(this, `QuestionsTable${suffix}`, {
      tableName: `rag-questions-${suffix}`,
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PROVISIONED,
      readCapacity: 5,
      writeCapacity: 5,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    questionsTable.autoScaleReadCapacity({
      minCapacity: 1,
      maxCapacity: 10,
    });

    questionsTable.autoScaleWriteCapacity({
      minCapacity: 1,
      maxCapacity: 10,
    });

    // Kendra index
    const kendraRole = new iam.Role(this, `KendraRole${suffix}`, {
      assumedBy: new iam.ServicePrincipal('kendra.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('CloudWatchLogsFullAccess'),
      ],
    });

    documentsBucket.grantRead(kendraRole);

    const kendraIndex = new kendra.CfnIndex(this, `KendraIndex${suffix}`, {
      name: `rag-index-${suffix}`,
      roleArn: kendraRole.roleArn,
      edition: 'DEVELOPER_EDITION',
    });

    // Kendra data source
    const dataSourceRole = new iam.Role(this, `DataSourceRole${suffix}`, {
      assumedBy: new iam.ServicePrincipal('kendra.amazonaws.com'),
    });

    documentsBucket.grantRead(dataSourceRole);
    dataSourceRole.addToPolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: ['kendra:BatchPutDocument', 'kendra:BatchDeleteDocument'],
      resources: [kendraIndex.attrArn],
    }));

    const kendraDataSource = new kendra.CfnDataSource(this, `KendraDataSource${suffix}`, {
      indexId: kendraIndex.attrId,
      name: `rag-datasource-${suffix}`,
      type: 'S3',
      roleArn: dataSourceRole.roleArn,
      dataSourceConfiguration: {
        s3Configuration: {
          bucketName: documentsBucket.bucketName,
        },
      },
    });

    kendraDataSource.addDependency(kendraIndex);

    // Lambda function
    const ragLambda = new lambda.Function(this, `RagLambda${suffix}`, {
      functionName: `rag-function-${suffix}`,
      runtime: lambda.Runtime.NODEJS_22_X,
      handler: 'index.handler',
      timeout: cdk.Duration.seconds(30),
      memorySize: 512,
      environment: {
        KENDRA_INDEX_ID: kendraIndex.attrId,
        QUESTIONS_TABLE: questionsTable.tableName,
      },
      code: lambda.Code.fromAsset('./lambda'),
    });

    // Grant permissions to Lambda
    questionsTable.grantReadWriteData(ragLambda);
    
    ragLambda.addToRolePolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: ['kendra:Retrieve', 'kendra:Query'],
      resources: [kendraIndex.attrArn],
    }));

    ragLambda.addToRolePolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: ['bedrock:InvokeModel'],
      resources: [
        'arn:aws:bedrock:*:*:inference-profile/global.anthropic.claude-sonnet-4-20250514-v1:0',
        'arn:aws:bedrock:*::foundation-model/anthropic.claude-sonnet-4-20250514-v1:0'
      ],
    }));

    // API Gateway
    const api = new apigateway.RestApi(this, `RagApi${suffix}`, {
      restApiName: `rag-api-${suffix}`,
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
      },
    });

    const apiResource = api.root.addResource('api');
    const askResource = apiResource.addResource('ask');
    const questionsResource = apiResource.addResource('sample-questions');

    const lambdaIntegration = new apigateway.LambdaIntegration(ragLambda);
    
    askResource.addMethod('POST', lambdaIntegration);
    questionsResource.addMethod('GET', lambdaIntegration);

    // Outputs
    new cdk.CfnOutput(this, 'ApiUrl', {
      value: api.url,
      description: 'API Gateway URL',
    });

    new cdk.CfnOutput(this, 'BucketName', {
      value: documentsBucket.bucketName,
      description: 'S3 Bucket for documents',
    });

    new cdk.CfnOutput(this, 'KendraIndexId', {
      value: kendraIndex.attrId,
      description: 'Kendra Index ID',
    });
  }
}
