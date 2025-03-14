// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { Duration } from 'aws-cdk-lib';
import { IAlarm, IMetric } from 'aws-cdk-lib/aws-cloudwatch';
import { AvailabilityZoneMapper } from '../../azmapper/AvailabilityZoneMapper';
import { IApplicationLoadBalancer } from 'aws-cdk-lib/aws-elasticloadbalancingv2';

/**
 * The properties for creating a dashboard with basic metrics
 */
export interface BasicServiceDashboardProps {
  readonly serviceName: string;

  readonly zonalLoadBalancerIsolatedImpactAlarms?: { [key: string]: IAlarm };

  readonly zonalNatGatewayIsolatedImpactAlarms?: { [key: string]: IAlarm };

  readonly zonalAggregateIsolatedImpactAlarms: { [key: string]: IAlarm };

  //readonly zonalLoadBalancerFaultRateMetrics?: { [key: string]: IMetric };

  readonly zonalNatGatewayPacketDropMetrics?: { [key: string]: IMetric };

  readonly interval?: Duration;

  readonly azMapper: AvailabilityZoneMapper;

  readonly albs?: IApplicationLoadBalancer[];

  readonly period: Duration;
}
