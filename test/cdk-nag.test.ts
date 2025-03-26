// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import * as cdk from 'aws-cdk-lib';
import { Unit } from 'aws-cdk-lib/aws-cloudwatch';
import { SelectedSubnets, SubnetType, Vpc } from 'aws-cdk-lib/aws-ec2';
import { ApplicationLoadBalancer, ILoadBalancerV2 } from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import { ILogGroup, LogGroup } from 'aws-cdk-lib/aws-logs';
import { AwsSolutionsChecks } from 'cdk-nag';
import { IService } from '../src/services/IService';
import { Service } from '../src/services/Service';
import { InstrumentedServiceMultiAZObservability } from '../src/services/InstrumentedServiceMultiAZObservability';
import { OutlierDetectionAlgorithm } from '../src/utilities/OutlierDetectionAlgorithm';
import { Template } from 'aws-cdk-lib/assertions';
import { Aspects, Aws, Duration } from 'aws-cdk-lib';
import { MetricDimensions } from '../src/services/props/MetricDimensions';
import { Operation } from '../src/services/Operation';
import { IOperation } from '../src/services/IOperation';
import { OperationAvailabilityMetricDetails } from '../src/services/OperationAvailabilityMetricDetails';
import { OperationLatencyMetricDetails } from '../src/services/OperationLatencyMetricDetails';

test('Fully instrumented service', () => {
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
      period: cdk.Duration.seconds(60),
      loadBalancer: loadBalancer,
      defaultAvailabilityMetricDetails: {
        metricNamespace: 'front-end/metrics',
        successMetricNames: ['Success'],
        faultMetricNames: ['Fault', 'Error'],
        alarmStatistic: 'Sum',
        unit: Unit.COUNT,
        period: cdk.Duration.seconds(60),
        evaluationPeriods: 5,
        datapointsToAlarm: 3,
        successAlarmThreshold: 99.9,
        faultAlarmThreshold: 0.1,
        graphedFaultStatistics: ['Sum'],
        graphedSuccessStatistics: ['Sum'],
      },
      defaultLatencyMetricDetails: {
        metricNamespace: 'front-end/metrics',
        successMetricNames: ['SuccessLatency'],
        faultMetricNames: ['FaultLatency'],
        alarmStatistic: 'p99',
        unit: Unit.MILLISECONDS,
        period: Duration.seconds(60),
        evaluationPeriods: 5,
        datapointsToAlarm: 3,
        successAlarmThreshold: Duration.millis(100),
        graphedFaultStatistics: ['p99'],
        graphedSuccessStatistics: ['p50', 'p99', 'tm99'],
      },
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
      serverSideAvailabilityMetricDetails: new OperationAvailabilityMetricDetails(
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
      serverSideLatencyMetricDetails: new OperationLatencyMetricDetails(
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
      interval: cdk.Duration.minutes(30),
      outlierDetectionAlgorithm: OutlierDetectionAlgorithm.STATIC,
    });
  
    Template.fromStack(stack);
    Aspects.of(stack).add(new AwsSolutionsChecks({ verbose: true }));
  });