// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import * as cdk from 'aws-cdk-lib';
import { Duration } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { Unit } from 'aws-cdk-lib/aws-cloudwatch';
import { SelectedSubnets, SubnetType, Vpc } from 'aws-cdk-lib/aws-ec2';
import {
  ApplicationLoadBalancer,
  ILoadBalancerV2,
  NetworkLoadBalancer,
} from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import { ILogGroup, LogGroup } from 'aws-cdk-lib/aws-logs';
import { InstrumentedServiceMultiAZObservability } from '../src/services/InstrumentedServiceMultiAZObservability';
import { IOperation } from '../src/services/IOperation';
import { IService } from '../src/services/IService';
import { Operation } from '../src/services/Operation';
import { OperationMetricDetails } from '../src/services/OperationMetricDetails';
import { MetricDimensions } from '../src/services/props/MetricDimensions';
import { Service } from '../src/services/Service';
import { ServiceMetricDetails } from '../src/services/ServiceMetricDetails';
import { OutlierDetectionAlgorithm } from '../src/utilities/OutlierDetectionAlgorithm';

test('Fully instrumented service', () => {
  const app = new cdk.App();
  const stack = new cdk.Stack(app, 'TestStack');

  let azs: string[] = [
    cdk.Fn.ref('AWS::Region') + 'a',
    cdk.Fn.ref('AWS::Region') + 'b',
    cdk.Fn.ref('AWS::Region') + 'c',
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
  });

  let subnets: SelectedSubnets = vpc.selectSubnets({
    subnetType: SubnetType.PRIVATE_ISOLATED,
  });

  let loadBalancer: ILoadBalancerV2 = new ApplicationLoadBalancer(
    stack,
    'alb',
    {
      vpc: vpc,
      crossZoneEnabled: true,
      vpcSubnets: subnets,
    },
  );

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
    defaultContributorInsightRuleDetails: {
      successLatencyMetricJsonPath: '$.SuccessLatency',
      faultMetricJsonPath: '$.Faults',
      operationNameJsonPath: '$.Operation',
      instanceIdJsonPath: '$.InstanceId',
      availabilityZoneIdJsonPath: '$.AZ-ID',
      logGroups: [logGroup],
    },
  });

  let rideOperation: IOperation = new Operation({
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
  });

  service.addOperation(rideOperation);

  let homeOperation: IOperation = new Operation({
    operationName: 'home',
    service: service,
    path: '/home',
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
  });

  service.addOperation(homeOperation);

  let payOperation: IOperation = new Operation({
    operationName: 'pay',
    service: service,
    path: '/pay',
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
  });

  service.addOperation(payOperation);

  new InstrumentedServiceMultiAZObservability(stack, 'MAZObservability', {
    createDashboards: true,
    service: service,
    outlierThreshold: 0.7,
    interval: Duration.minutes(30),
    outlierDetectionAlgorithm: OutlierDetectionAlgorithm.STATIC,
  });

  Template.fromStack(stack);
});

test('Fully instrumented service with NLB', () => {
  const app = new cdk.App();
  const stack = new cdk.Stack(app, 'TestStack');

  let azs: string[] = [
    cdk.Fn.ref('AWS::Region') + 'a',
    cdk.Fn.ref('AWS::Region') + 'b',
    cdk.Fn.ref('AWS::Region') + 'c',
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
  });

  let subnets: SelectedSubnets = vpc.selectSubnets({
    subnetType: SubnetType.PRIVATE_ISOLATED,
  });

  let loadBalancer: ILoadBalancerV2 = new NetworkLoadBalancer(stack, 'nlb', {
    vpc: vpc,
    crossZoneEnabled: true,
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
    defaultContributorInsightRuleDetails: {
      successLatencyMetricJsonPath: '$.SuccessLatency',
      faultMetricJsonPath: '$.Faults',
      operationNameJsonPath: '$.Operation',
      instanceIdJsonPath: '$.InstanceId',
      availabilityZoneIdJsonPath: '$.AZ-ID',
      logGroups: [logGroup],
    },
  });

  let rideOperation: IOperation = new Operation({
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
  });

  service.addOperation(rideOperation);

  new InstrumentedServiceMultiAZObservability(stack, 'MAZObservability', {
    createDashboards: true,
    service: service,
    interval: Duration.minutes(30),
    outlierDetectionAlgorithm: OutlierDetectionAlgorithm.STATIC,
  });

  Template.fromStack(stack);
});

test('Fully instrumented service with chi-squared', () => {
  const app = new cdk.App();
  const stack = new cdk.Stack(app, 'TestStack');

  let azs: string[] = [
    cdk.Fn.ref('AWS::Region') + 'a',
    cdk.Fn.ref('AWS::Region') + 'b',
    cdk.Fn.ref('AWS::Region') + 'c',
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
  });

  let subnets: SelectedSubnets = vpc.selectSubnets({
    subnetType: SubnetType.PRIVATE_ISOLATED,
  });

  let loadBalancer: ILoadBalancerV2 = new ApplicationLoadBalancer(
    stack,
    'alb',
    {
      vpc: vpc,
      crossZoneEnabled: true,
      vpcSubnets: subnets,
    },
  );

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
    defaultContributorInsightRuleDetails: {
      successLatencyMetricJsonPath: '$.SuccessLatency',
      faultMetricJsonPath: '$.Faults',
      operationNameJsonPath: '$.Operation',
      instanceIdJsonPath: '$.InstanceId',
      availabilityZoneIdJsonPath: '$.AZ-ID',
      logGroups: [logGroup],
    },
  });

  let rideOperation: IOperation = new Operation({
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
  });

  service.addOperation(rideOperation);

  new InstrumentedServiceMultiAZObservability(stack, 'MAZObservability', {
    createDashboards: true,
    service: service,
    outlierThreshold: 0.7,
    interval: Duration.minutes(30),
    outlierDetectionAlgorithm: OutlierDetectionAlgorithm.CHI_SQUARED,
  });

  Template.fromStack(stack);
});

/*
test('Fully instrumented service adding canaries', () => {
  const app = new cdk.App();
  const stack = new cdk.Stack(app, 'TestStack');

  let azs: string[] = [
    cdk.Fn.ref('AWS::Region') + 'a',
    cdk.Fn.ref('AWS::Region') + 'b',
    cdk.Fn.ref('AWS::Region') + 'c',
  ];

  let vpc = new Vpc(stack, 'vpc', {
    availabilityZones: azs,
    subnetConfiguration: [
      {
        subnetType: SubnetType.PRIVATE_WITH_EGRESS,
        name: 'private_with_egress_subnets',
        cidrMask: 24,
      },
    ],
    createInternetGateway: false,
    natGateways: 0,
  });

  let subnets: SelectedSubnets = vpc.selectSubnets({
    subnetType: SubnetType.PRIVATE_WITH_EGRESS,
  });

  let loadBalancer: ILoadBalancerV2 = new ApplicationLoadBalancer(stack, 'alb', {
    vpc: vpc,
    crossZoneEnabled: true,
    vpcSubnets: subnets,
  });

  let service: IService = new Service({
    serviceName: 'test',
    availabilityZoneNames: vpc.availabilityZones,
    baseUrl: 'http://www.example.com',
    faultCountThreshold: 25,
    period: Duration.seconds(60),
    loadBalancer: loadBalancer,
  });

  let logGroup: ILogGroup = new LogGroup(stack, 'Logs', {
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
    serverSideAvailabilityMetricDetails: new OperationMetricDetails({
      operationName: 'ride',
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
      metricDimensions: new MetricDimensions({ Operation: 'ride' }, 'AZ-ID', 'Region'),
    }),
    serverSideLatencyMetricDetails: new OperationMetricDetails({
      operationName: 'ride',
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
      metricDimensions: new MetricDimensions({ Operation: 'ride' }, 'AZ-ID', 'Region'),
    }),
    canaryTestProps: {
      requestCount: 10,
      schedule: 'rate(1 minute)',
      loadBalancer: loadBalancer,
    },
  };

  let payOperation: Operation = {
    operationName: 'pay',
    service: service,
    path: '/pay',
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
    serverSideAvailabilityMetricDetails: new OperationMetricDetails({
      operationName: 'pay',
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
      metricDimensions: new MetricDimensions({ Operation: 'ride' }, 'AZ-ID', 'Region'),
    }),
    serverSideLatencyMetricDetails: new OperationMetricDetails({
      operationName: 'pay',
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
      metricDimensions: new MetricDimensions({ Operation: 'ride' }, 'AZ-ID', 'Region'),
    }),
    canaryTestProps: {
      requestCount: 10,
      schedule: 'rate(1 minute)',
      loadBalancer: loadBalancer,
    },
  };

  service.addOperation(rideOperation);
  service.addOperation(payOperation);

  new MultiAvailabilityZoneObservability(stack, 'MAZObservability', {
    instrumentedServiceObservabilityProps: {
      createDashboards: true,
      service: service,
      outlierThreshold: 0.7,
      interval: Duration.minutes(30),
    },
  });

  Template.fromStack(stack);
});*/

test('Fully instrumented service adding canaries with dynamic source', () => {
  const app = new cdk.App();
  const stack = new cdk.Stack(app, 'TestStack', {
    stackName: 'test-stack',
  });

  new cdk.CfnParameter(stack, 'AssetsBucket', {
    type: 'string',
    default: '{{.AssetsBucket}}',
  });

  new cdk.CfnParameter(stack, 'AssetsBucketPrefix', {
    type: 'string',
    default: '{{.AssetsBucketPrefix}}',
  });

  let azs: string[] = [
    cdk.Fn.ref('AWS::Region') + 'a',
    cdk.Fn.ref('AWS::Region') + 'b',
    cdk.Fn.ref('AWS::Region') + 'c',
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
  });

  let subnets: SelectedSubnets = vpc.selectSubnets({
    subnetType: SubnetType.PRIVATE_ISOLATED,
  });

  let loadBalancer: ILoadBalancerV2 = new ApplicationLoadBalancer(
    stack,
    'alb',
    {
      vpc: vpc,
      crossZoneEnabled: true,
      vpcSubnets: subnets,
    },
  );

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
  });

  let logGroup: ILogGroup = new LogGroup(stack, 'Logs', {});

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
  };

  let payOperation: Operation = {
    operationName: 'pay',
    service: service,
    path: '/pay',
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
        operationName: 'pay',
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
        operationName: 'pay',
        metricDimensions: new MetricDimensions(
          { Operation: 'ride' },
          'AZ-ID',
          'Region',
        ),
      },
      service.defaultLatencyMetricDetails,
    ),
  };

  service.addOperation(rideOperation);
  service.addOperation(payOperation);

  new InstrumentedServiceMultiAZObservability(stack, 'MAZObservability', {
    createDashboards: true,
    service: service,
    outlierThreshold: 0.7,
    interval: Duration.minutes(30),
    assetsBucketParameterName: 'AssetsBucket',
    assetsBucketPrefixParameterName: 'AssetsBucketPrefix',
    outlierDetectionAlgorithm: OutlierDetectionAlgorithm.STATIC,
  });

  //Template.fromStack(stack);
  app.synth();
});
