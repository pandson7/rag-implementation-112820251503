#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { RagImplementationStack112820251503 } from '../lib/backend-stack';

const app = new cdk.App();
new RagImplementationStack112820251503(app, 'RagImplementationStack112820251503', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
});
