// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import * as path from 'path';
import { Aws, Duration, RemovalPolicy } from 'aws-cdk-lib';
import { ISecurityGroup, SecurityGroup } from 'aws-cdk-lib/aws-ec2';
import {
  Effect,
  IManagedPolicy,
  IRole,
  ManagedPolicy,
  PolicyStatement,
  Role,
  ServicePrincipal,
} from 'aws-cdk-lib/aws-iam';
import {
  Architecture,
  Code,
  Function,
  IFunction,
  ILayerVersion,
  LayerVersion,
  Tracing,
} from 'aws-cdk-lib/aws-lambda';
import { ILogGroup, LogGroup, RetentionDays } from 'aws-cdk-lib/aws-logs';
import { Construct } from 'constructs';
import { ICanaryFunction } from './ICanaryFunction';
import { CanaryFunctionProps } from './props/CanaryFunctionProps';
import { MetricsHelper } from '../utilities/MetricsHelper';

export class CanaryFunction extends Construct implements ICanaryFunction {
  /**
   * The canary function
   */
  function: IFunction;

  /**
   * The log group where the canarty logs will be sent
   */
  logGroup: ILogGroup;

  constructor(scope: Construct, id: string, props: CanaryFunctionProps) {
    super(scope, id);

    let xrayManagedPolicy: IManagedPolicy = new ManagedPolicy(
      this,
      'xrayManagedPolicy',
      {
        path: '/canary/',
        statements: [
          new PolicyStatement({
            actions: [
              'xray:PutTraceSegments',
              'xray:PutTelemetryRecords',
              'xray:GetSamplingRules',
              'xray:GetSamplingTargets',
              'xray:GetSamplingStatisticSummaries',
            ],
            effect: Effect.ALLOW,
            resources: ['*'],
          }),
        ],
      },
    );
    let ec2ManagedPolicy = new ManagedPolicy(this, 'ec2ManagedPolicy', {
      path: '/canary/',
      statements: [
        new PolicyStatement({
          actions: [
            'ec2:CreateNetworkInterface',
            'ec2:DescribeNetworkInterfaces',
            'ec2:DeleteNetworkInterface',
          ],
          effect: Effect.ALLOW,
          resources: ['*'],
        }),
      ],
    });

    let executionRole: IRole = new Role(this, 'executionRole', {
      assumedBy: new ServicePrincipal('lambda.amazonaws.com'),
      path: '/canary/',
      managedPolicies: [xrayManagedPolicy, ec2ManagedPolicy],
    });

    /*
    let code: AssetCode = Code.fromAsset(path.join(__dirname, "src/"), {
      bundling: {
        //image: new Runtime('python3.13:latest-arm64', RuntimeFamily.PYTHON).bundlingImage,
        image: MetricsHelper.PythonRuntime.bundlingImage,
        command: [
          'bash', '-c',
          'pip install --no-cache -r requirements.txt -t /asset-output && cp --archive --update . /asset-output',
        ],
        platform: 'linux/arm64',
      },
    });
    */
    let monitoringLayer: ILayerVersion = new LayerVersion(
      this,
      'MonitoringLayer',
      {
        code: Code.fromAsset(
          path.join(__dirname, '../monitoring/src/monitoring-layer.zip'),
        ),
        compatibleArchitectures: [Architecture.ARM_64],
        compatibleRuntimes: [MetricsHelper.PythonRuntime],
      },
    );

    if (props.vpc !== undefined && props.vpc != null) {
      let sg: ISecurityGroup = new SecurityGroup(this, 'canarySecurityGroup', {
        description: 'Allow canary to communicate with load balancer',
        vpc: props.vpc,
        allowAllOutbound: true,
      });

      this.function = new Function(this, 'canary', {
        runtime: MetricsHelper.PythonRuntime,
        code: Code.fromAsset(path.join(__dirname, 'src/canary.zip')),
        handler: 'index.handler',
        role: executionRole,
        architecture: Architecture.ARM_64,
        tracing: Tracing.ACTIVE,
        timeout: Duration.seconds(240),
        memorySize: 512,
        layers: [monitoringLayer],
        environment: {
          REGION:Aws.REGION,
          PARTITION: Aws.PARTITION,
          TIMEOUT:
            props.httpTimeout !== undefined
              ? props.httpTimeout.toSeconds({integral: false}).toString()
              : '2',
          IGNORE_SSL_ERRORS: (
            props.ignoreTlsErrors !== undefined && props.ignoreTlsErrors == true
          )
            .toString()
            .toLowerCase(),
        },
        vpc: props.vpc,
        securityGroups: [sg],
        vpcSubnets: props.subnetSelection,
      });
    } else {
      this.function = new Function(this, 'canary', {
        runtime: MetricsHelper.PythonRuntime,
        code: Code.fromAsset(path.join(__dirname, 'src/canary.zip')),
        handler: 'index.handler',
        role: executionRole,
        architecture: Architecture.ARM_64,
        tracing: Tracing.ACTIVE,
        timeout: Duration.seconds(240),
        memorySize: 512,
        layers: [monitoringLayer],
        environment: {
          REGION: Aws.REGION,
          PARTITION: Aws.PARTITION,
          TIMEOUT:
            props.httpTimeout !== undefined
              ? props.httpTimeout.toSeconds({integral: false}).toString()
              : '2',
          IGNORE_SSL_ERRORS: (
            props.ignoreTlsErrors !== undefined && props.ignoreTlsErrors == true
          )
            .toString()
            .toLowerCase(),
        },
      });
    }

    this.function.addPermission('invokePermission', {
      action: 'lambda:InvokeFunction',
      principal: new ServicePrincipal('events.amazonaws.com'),
      sourceArn: `arn:${Aws.PARTITION}:events:${Aws.REGION}:${Aws.ACCOUNT_ID}:rule/*`
    });

    this.logGroup = new LogGroup(this, 'logGroup', {
      logGroupName: `/aws/lambda/${this.function.functionName}`,
      retention: RetentionDays.ONE_WEEK,
      removalPolicy: RemovalPolicy.DESTROY,
    });

    new ManagedPolicy(this, 'cwManagedPolicy', {
      path: '/canary/',
      statements: [
        new PolicyStatement({
          actions: ['cloudwatch:PutMetricData'],
          effect: Effect.ALLOW,
          resources: ['*'],
        }),
        new PolicyStatement({
          actions: ['logs:CreateLogStream', 'logs:PutLogEvents'],
          effect: Effect.ALLOW,
          resources: [this.logGroup.logGroupArn],
        }),
      ],
      roles: [executionRole],
    });
  }
}
