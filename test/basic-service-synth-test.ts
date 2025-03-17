// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import * as cdk from 'aws-cdk-lib';
import {
  CfnNatGateway,
  SelectedSubnets,
  SubnetType,
  Vpc,
} from 'aws-cdk-lib/aws-ec2';
import { ApplicationLoadBalancer } from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import { BasicServiceMultiAZObservability } from '../src/basic_observability/BasicServiceMultiAZObservability';

const app = new cdk.App();
const stack = new cdk.Stack(app, 'TestStack', {
  stackName: 'test-stack',
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
      subnetType: SubnetType.PRIVATE_WITH_EGRESS,
      name: 'private_with_egress_subnets',
      cidrMask: 24,
    },
  ],
  createInternetGateway: false,
  natGateways: 0,
  restrictDefaultSecurityGroup: false,
});

let subnets: SelectedSubnets = vpc.selectSubnets({
  subnetType: SubnetType.PRIVATE_WITH_EGRESS,
});

let natGateways: { [key: string]: CfnNatGateway[] } = {};

subnets.subnets.forEach((subnet, index) => {
  let az = subnet.availabilityZone;
  let subnetId = subnet.subnetId;

  natGateways[az] = [
    new CfnNatGateway(stack, 'AZ' + index + 'NatGateway', {
      subnetId: subnetId,
    }),
  ];
});

new BasicServiceMultiAZObservability(stack, 'MAZObservability', {
    applicationLoadBalancerProps: {
      applicationLoadBalancers: [
        new ApplicationLoadBalancer(stack, 'alb', {
          vpc: vpc,
          crossZoneEnabled: true,
        }),
      ],
      faultCountPercentThreshold: 1,
      latencyStatistic: "p99",
      latencyThreshold: 200,
    },
    natGatewayProps: {
       natGateways: natGateways,
       packetLossPercentThreshold: 0.01,
    },
    serviceName: 'test',
    period: cdk.Duration.seconds(60),
    createDashboard: true,
    evaluationPeriods: 5,
    datapointsToAlarm: 3,
  });
