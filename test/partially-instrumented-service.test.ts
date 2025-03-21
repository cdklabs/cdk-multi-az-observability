// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import * as cdk from 'aws-cdk-lib';
import { Aws, Duration } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { Unit } from 'aws-cdk-lib/aws-cloudwatch';
import { SelectedSubnets, SubnetType, Vpc } from 'aws-cdk-lib/aws-ec2';
import {
  ApplicationLoadBalancer,
  ILoadBalancerV2,
  NetworkLoadBalancer,
} from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import { InstrumentedServiceMultiAZObservability } from '../src/services/InstrumentedServiceMultiAZObservability';
import { IOperation } from '../src/services/IOperation';
import { IService } from '../src/services/IService';
import { Operation } from '../src/services/Operation';
import { OperationMetricDetails } from '../src/services/OperationMetricDetails';
import { MetricDimensions } from '../src/services/props/MetricDimensions';
import { Service } from '../src/services/Service';
import { ServiceMetricDetails } from '../src/services/ServiceMetricDetails';
import { OutlierDetectionAlgorithm } from '../src/utilities/OutlierDetectionAlgorithm';

test('Partially instrumented service', () => {
  const app = new cdk.App();
  const stack = new cdk.Stack(app, 'TestStack');

  let azs: string[] = [
    Aws.REGION + 'a',
    Aws.REGION + 'b',
    Aws.REGION + 'c',
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
  });

  let rideOperation: IOperation = new Operation({
    operationName: 'ride',
    service: service,
    path: '/ride',
    critical: true,
    httpMethods: ['GET'],
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
    createDashboards: false,
    service: service,
    outlierThreshold: 0.7,
    interval: Duration.minutes(30),
    outlierDetectionAlgorithm: OutlierDetectionAlgorithm.STATIC,
  });

  Template.fromStack(stack);
});

test('Partially instrumented service with NLB and dashboard', () => {
  const app = new cdk.App();
  const stack = new cdk.Stack(app, 'TestStack');

  let azs: string[] = [
    Aws.REGION + 'a',
    Aws.REGION + 'b',
    Aws.REGION + 'c',
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

  let loadBalancer: ILoadBalancerV2 = new NetworkLoadBalancer(stack, 'nlb', {
    vpc: vpc,
    crossZoneEnabled: false,
    vpcSubnets: subnets,
  });

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
  });

  let rideOperation: IOperation = new Operation({
    operationName: 'ride',
    service: service,
    path: '/ride',
    critical: true,
    httpMethods: ['GET'],
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

test('Partially instrumented service with chi-squared', () => {
  const app = new cdk.App();
  const stack = new cdk.Stack(app, 'TestStack');

  let azs: string[] = [
    Aws.REGION + 'a',
    Aws.REGION + 'b',
    Aws.REGION + 'c',
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
  });

  let rideOperation: IOperation = new Operation({
    operationName: 'ride',
    service: service,
    path: '/ride',
    critical: true,
    httpMethods: ['GET'],
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
    createDashboards: false,
    service: service,
    outlierThreshold: 0.7,
    interval: Duration.minutes(30),
    outlierDetectionAlgorithm: OutlierDetectionAlgorithm.CHI_SQUARED,
  });

  Template.fromStack(stack);
});

/*
test('Partially instrumented service adds canaries', () => {
  const app = new cdk.App();
  const stack = new cdk.Stack(app, 'TestStack');

  let azs: string[] = [
    Aws.REGION + 'a',
    Aws.REGION + 'b',
    Aws.REGION + 'c',
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

  let rideOperation: IOperation = new Operation({
    operationName: 'ride',
    service: service,
    path: '/ride',
    critical: true,
    httpMethods: ['GET'],
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
  });

  service.addOperation(rideOperation);

  new MultiAvailabilityZoneObservability(stack, 'MAZObservability', {
    instrumentedServiceObservabilityProps: {
      createDashboards: false,
      service: service,
      outlierThreshold: 0.7,
      interval: Duration.minutes(30),
    },
  });

  Template.fromStack(stack);
});
*/

test('Partially instrumented service with canaries', () => {
  const app = new cdk.App();
  const stack = new cdk.Stack(app, 'TestStack');

  let azs: string[] = [
    Aws.REGION + 'a',
    Aws.REGION + 'b',
    Aws.REGION + 'c',
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
  });

  let rideOperation: Operation = {
    operationName: 'ride',
    service: service,
    path: '/ride',
    critical: true,
    httpMethods: ['GET'],
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
    canaryMetricDetails: {
      canaryAvailabilityMetricDetails: new OperationMetricDetails(
        {
          operationName: 'ride',
          metricNamespace: 'canary/metrics',
          metricDimensions: new MetricDimensions(
            { Operation: 'ride' },
            'AZ-ID',
            'Region',
          ),
        },
        service.defaultAvailabilityMetricDetails,
      ),
      canaryLatencyMetricDetails: new OperationMetricDetails(
        {
          operationName: 'ride',
          metricNamespace: 'canary/metrics',
          metricDimensions: new MetricDimensions(
            { Operation: 'ride' },
            'AZ-ID',
            'Region',
          ),
        },
        service.defaultLatencyMetricDetails,
      ),
    },
  };

  service.addOperation(rideOperation);

  new InstrumentedServiceMultiAZObservability(stack, 'MAZObservability', {
    createDashboards: true,
    service: service,
    outlierThreshold: 0.7,
    interval: Duration.minutes(30),
    outlierDetectionAlgorithm: OutlierDetectionAlgorithm.STATIC,
  });

  Template.fromStack(stack);
});
