// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import * as path from 'path';
import { Aws, Duration, Fn, RemovalPolicy, Tags } from 'aws-cdk-lib';
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
  Runtime,
  Tracing,
} from 'aws-cdk-lib/aws-lambda';
import { ILogGroup, LogGroup, RetentionDays } from 'aws-cdk-lib/aws-logs';
import { Construct } from 'constructs';
import { IOutlierDetectionFunction } from './IOutlierDetectionFunction';
import { OutlierDetectionFunctionProps } from './props/OutlierDetectionFunctionProps';

export class OutlierDetectionFunction
  extends Construct
  implements IOutlierDetectionFunction {
  /**
   * The z-score function
   */
  function: IFunction;

  /**
   * The log group where the canarty logs will be sent
   */
  logGroup: ILogGroup;

  constructor(
    scope: Construct,
    id: string,
    props: OutlierDetectionFunctionProps,
  ) {
    super(scope, id);

    let xrayManagedPolicy: IManagedPolicy = new ManagedPolicy(
      this,
      'xrayManagedPolicy',
      {
        path: '/outlier-detection/',
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
    let cwManagedPolicy = new ManagedPolicy(this, 'CWManagedPolicy', {
      path: '/outlier-detection/',
      statements: [
        new PolicyStatement({
          actions: ['cloudwatch:GetMetricData', 'cloduwatch:PutMetricData'],
          effect: Effect.ALLOW,
          resources: ['*'],
        }),
      ],
    });

    let executionRole: IRole = new Role(this, 'executionRole', {
      assumedBy: new ServicePrincipal('lambda.amazonaws.com'),
      path: '/outlier-detection/',
      managedPolicies: [xrayManagedPolicy, cwManagedPolicy],
    });

    let sciPyLayer: ILayerVersion = new LayerVersion(this, 'SciPyLayer', {
      code: Code.fromAsset(path.join(__dirname, 'src/scipy-layer.zip')),
      compatibleArchitectures: [Architecture.ARM_64],
      compatibleRuntimes: [Runtime.PYTHON_3_12],
    });

    let monitoringLayer: ILayerVersion = new LayerVersion(
      this,
      'MonitoringLayer',
      {
        code: Code.fromAsset(
          path.join(__dirname, '../monitoring/src/monitoring-layer.zip'),
        ),
        compatibleArchitectures: [Architecture.ARM_64],
        compatibleRuntimes: [Runtime.PYTHON_3_12],
      },
    );

    if (props.vpc !== undefined && props.vpc != null) {
      let sg: ISecurityGroup = new SecurityGroup(
        this,
        'OutlierDetectionSecurityGroup',
        {
          description:
            'Allow outlier detection function to communicate with CW',
          vpc: props.vpc,
          allowAllOutbound: true,
        },
      );

      this.function = new Function(this, 'OutlierDetection', {
        runtime: Runtime.PYTHON_3_12,
        code: Code.fromAsset(path.join(__dirname, 'src/outlier-detection.zip')),
        handler: 'index.handler',
        role: executionRole,
        architecture: Architecture.ARM_64,
        tracing: Tracing.ACTIVE,
        timeout: Duration.seconds(5),
        memorySize: 512,
        layers: [sciPyLayer, monitoringLayer],
        environment: {
          REGION: Aws.REGION,
          PARTITION: Aws.PARTITION,
        },
        vpc: props.vpc,
        securityGroups: [sg],
        vpcSubnets: props.subnetSelection,
      });
    } else {
      this.function = new Function(this, 'OutlierDetection', {
        runtime: Runtime.PYTHON_3_12,
        code: Code.fromAsset(path.join(__dirname, 'src/outlier-detection.zip')),
        handler: 'index.handler',
        role: executionRole,
        architecture: Architecture.ARM_64,
        tracing: Tracing.ACTIVE,
        timeout: Duration.seconds(5),
        memorySize: 512,
        layers: [sciPyLayer, monitoringLayer],
        environment: {
          REGION: Aws.REGION,
          PARTITION: Aws.PARTITION,
        },
      });
    }

    Tags.of(this.function).add('cloudwatch:datasource', 'custom', {
      includeResourceTypes: ['AWS::Lambda::Function'],
    });

    this.function.addPermission('invokePermission', {
      action: 'lambda:InvokeFunction',
      principal: new ServicePrincipal(
        'lambda.datasource.cloudwatch.amazonaws.com',
      ),
      sourceAccount: Fn.ref('AWS::AccountId'),
    });

    this.logGroup = new LogGroup(this, 'logGroup', {
      logGroupName: `/aws/lambda/${this.function.functionName}`,
      retention: RetentionDays.ONE_WEEK,
      removalPolicy: RemovalPolicy.DESTROY,
    });

    new ManagedPolicy(this, 'cwLogsManagedPolicy', {
      path: '/outlier-detection/',
      statements: [
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
