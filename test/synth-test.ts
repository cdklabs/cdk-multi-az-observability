// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import * as cdk from 'aws-cdk-lib';
import { Aspects, Aws, Duration } from 'aws-cdk-lib';
import { Unit } from 'aws-cdk-lib/aws-cloudwatch';
import { SelectedSubnets, SubnetType, Vpc } from 'aws-cdk-lib/aws-ec2';
import {
  ILoadBalancerV2,
  NetworkLoadBalancer,
} from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import { ILogGroup, LogGroup } from 'aws-cdk-lib/aws-logs';
import { InstrumentedServiceMultiAZObservability } from '../src/services/InstrumentedServiceMultiAZObservability';
import { IService } from '../src/services/IService';
import { Operation } from '../src/services/Operation';
import { OperationMetricDetails } from '../src/services/OperationMetricDetails';
import { MetricDimensions } from '../src/services/props/MetricDimensions';
import { Service } from '../src/services/Service';
import { ServiceMetricDetails } from '../src/services/ServiceMetricDetails';
import { OutlierDetectionAlgorithm } from '../src/utilities/OutlierDetectionAlgorithm';
import { AwsSolutionsChecks } from 'cdk-nag';

const app = new cdk.App();
const stack = new cdk.Stack(app, 'TestStack', {
  stackName: 'test-stack',
  //synthesizer: new cdk.DefaultStackSynthesizer({
  //  fileAssetsBucketName: "${AssetsBucket}",
  //  bucketPrefix: "${AssetsBucketPrefix}"
  //})
});
/*new cdk.CfnParameter(stack, 'AssetsBucket', {
  type: 'string',
  default: '{{.AssetsBucket}}',
});
new cdk.CfnParameter(stack, 'AssetsBucketPrefix', {
  type: 'string',
  default: '{{.AssetsBucketPrefix}}',
});*/
let azs: string[] = [
  Aws.REGION + 'a',
  Aws.REGION + 'b',
  Aws.REGION + 'c',
];

let vpc = new Vpc(stack, 'vpc', {
  availabilityZones: azs,
  subnetConfiguration: [
    {
      subnetType: SubnetType.PRIVATE_ISOLATED,
      name: 'private_isolated_subnets',
      cidrMask: 24,
    },
  ],
  createInternetGateway: false,
  natGateways: 0,
  restrictDefaultSecurityGroup: false,
});

let subnets: SelectedSubnets = vpc.selectSubnets({
  subnetType: SubnetType.PRIVATE_ISOLATED,
});

let loadBalancer: ILoadBalancerV2 = new NetworkLoadBalancer(stack, 'alb', {
  vpc: vpc,
  crossZoneEnabled: false,
  vpcSubnets: subnets,
});

let logGroup: ILogGroup = new LogGroup(stack, 'Logs', {});

let service: IService = new Service({
  serviceName: 'test',
  availabilityZoneNames: vpc.availabilityZones,
  baseUrl: 'http://www.example.com',
  faultCountThreshold: 25,
  period: Duration.seconds(60),
  loadBalancer: loadBalancer,
  defaultAvailabilityMetricDetails: new ServiceMetricDetails({
    metricNamespace: 'front-end/metrics',
    successMetricNames: ['Success'],
    faultMetricNames: ['Fault', 'Error'],
    alarmStatistic: 'Sum',
    unit: Unit.COUNT,
    period: Duration.seconds(60),
    evaluationPeriods: 5,
    datapointsToAlarm: 3,
    successAlarmThreshold: 99.9,
    faultAlarmThreshold: 0.1,
    graphedFaultStatistics: ['Sum'],
    graphedSuccessStatistics: ['Sum'],
  }),
  defaultLatencyMetricDetails: new ServiceMetricDetails({
    metricNamespace: 'front-end/metrics',
    successMetricNames: ['SuccessLatency'],
    faultMetricNames: ['FaultLatency'],
    alarmStatistic: 'p99',
    unit: Unit.MILLISECONDS,
    period: Duration.seconds(60),
    evaluationPeriods: 5,
    datapointsToAlarm: 3,
    successAlarmThreshold: 100,
    faultAlarmThreshold: 1,
    graphedFaultStatistics: ['p99'],
    graphedSuccessStatistics: ['p50', 'p99', 'tm99'],
  }),
  canaryTestProps: {
    requestCount: 10,
    schedule: 'rate(1 minute)',
    loadBalancer: loadBalancer,
    networkConfiguration: {
      vpc: vpc,
      subnetSelection: { subnetType: SubnetType.PRIVATE_ISOLATED },
    },
  },
  defaultContributorInsightRuleDetails: {
    logGroups: [logGroup],
    successLatencyMetricJsonPath: '$.SuccessLatency',
    faultMetricJsonPath: '$.Faults',
    operationNameJsonPath: '$.Operation',
    instanceIdJsonPath: '$.InstanceId',
    availabilityZoneIdJsonPath: '$.AZ-ID',
  },
});

let rideOperation: Operation = {
  operationName: 'ride',
  service: service,
  path: '/ride',
  critical: true,
  httpMethods: ['GET'],
  serverSideContributorInsightRuleDetails: {
    logGroups: [logGroup],
    successLatencyMetricJsonPath: '$.SuccessLatency',
    faultMetricJsonPath: '$.Faults',
    operationNameJsonPath: '$.Operation',
    instanceIdJsonPath: '$.InstanceId',
    availabilityZoneIdJsonPath: '$.AZ-ID',
  },
  serverSideAvailabilityMetricDetails: new OperationMetricDetails(
    {
      operationName: 'ride',
      metricDimensions: new MetricDimensions(
        { Operation: 'ride' },
        'AZ-ID',
        'Region',
      ),
    },
    service.defaultAvailabilityMetricDetails,
  ),
  serverSideLatencyMetricDetails: new OperationMetricDetails(
    {
      operationName: 'ride',
      metricDimensions: new MetricDimensions(
        { Operation: 'ride' },
        'AZ-ID',
        'Region',
      ),
    },
    service.defaultLatencyMetricDetails,
  ),
  canaryTestLatencyMetricsOverride: {
    successAlarmThreshold: 251,
  },
};
let payOperation: Operation = {
  operationName: 'pay',
  service: service,
  path: '/pay',
  critical: true,
  httpMethods: ['GET'],
  serverSideAvailabilityMetricDetails: new OperationMetricDetails(
    {
      operationName: 'pay',
      metricDimensions: new MetricDimensions(
        { Operation: 'pay' },
        'AZ-ID',
        'Region',
      ),
    },
    service.defaultAvailabilityMetricDetails,
  ),
  serverSideLatencyMetricDetails: new OperationMetricDetails(
    {
      operationName: 'pay',
      metricDimensions: new MetricDimensions(
        { Operation: 'pay' },
        'AZ-ID',
        'Region',
      ),
    },
    service.defaultLatencyMetricDetails,
  ),
  canaryTestLatencyMetricsOverride: {
    successAlarmThreshold: 301,
  },
};

let homeOperation: Operation = {
  operationName: 'home',
  service: service,
  path: '/home',
  critical: true,
  httpMethods: ['GET'],
  serverSideAvailabilityMetricDetails: new OperationMetricDetails(
    {
      operationName: 'home',
      metricDimensions: new MetricDimensions(
        { Operation: 'home' },
        'AZ-ID',
        'Region',
      ),
    },
    service.defaultAvailabilityMetricDetails,
  ),
  serverSideLatencyMetricDetails: new OperationMetricDetails(
    {
      operationName: 'home',
      metricDimensions: new MetricDimensions(
        { Operation: 'home' },
        'AZ-ID',
        'Region',
      ),
    },
    service.defaultLatencyMetricDetails,
  ),
  canaryTestLatencyMetricsOverride: {
    successAlarmThreshold: 301,
  },
};

let signinOperation: Operation = {
  operationName: 'signin',
  service: service,
  path: '/signin',
  critical: true,
  httpMethods: ['GET'],
  serverSideAvailabilityMetricDetails: new OperationMetricDetails(
    {
      operationName: 'signin',
      metricDimensions: new MetricDimensions(
        { Operation: 'signin' },
        'AZ-ID',
        'Region',
      ),
    },
    service.defaultAvailabilityMetricDetails,
  ),
  serverSideLatencyMetricDetails: new OperationMetricDetails(
    {
      operationName: 'signin',
      metricDimensions: new MetricDimensions(
        { Operation: 'signin' },
        'AZ-ID',
        'Region',
      ),
    },
    service.defaultLatencyMetricDetails,
  ),
  canaryTestLatencyMetricsOverride: {
    successAlarmThreshold: 301,
  },
};

service.addOperation(rideOperation);
service.addOperation(payOperation);
service.addOperation(homeOperation);
service.addOperation(signinOperation);

new InstrumentedServiceMultiAZObservability(stack, 'MAZObservability', {
  createDashboards: true,
  service: service,
  interval: Duration.minutes(30),
  assetsBucketParameterName: 'AssetsBucket',
  assetsBucketPrefixParameterName: 'AssetsBucketPrefix',
  outlierDetectionAlgorithm: OutlierDetectionAlgorithm.CHI_SQUARED,
});

app.synth();
Aspects.of(app).add(new AwsSolutionsChecks({ verbose: true }));
