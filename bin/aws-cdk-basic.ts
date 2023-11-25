#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { AwsCdkBasicStack } from '../lib/aws-cdk-basic-stack';

const app = new cdk.App();
new AwsCdkBasicStack(app, 'AwsCdkBasicStack');
