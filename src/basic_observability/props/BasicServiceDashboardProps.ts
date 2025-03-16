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

  /**
   * The service's name
   */
  readonly serviceName: string;

  /**
   * The alarms for NAT Gateways indicating single AZ impact for packet loss
   */
  readonly zonalNatGatewayIsolatedImpactAlarms?: { [key: string]: IAlarm };

  /**
   * The alarms indicating a single AZ impact, one per AZ
   */
  readonly zonalAggregateIsolatedImpactAlarms: { [key: string]: IAlarm };

  /**
   * The metrics for aggregate packet loss at the NAT Gateway in each AZ
   */
  readonly zonalNatGatewayPacketDropMetrics?: { [key: string]: IMetric };

  /**
   * The interval for the dashboard
   */
  readonly interval?: Duration;

  /**
   * The AZ mapper to convert AZ name/letter to AZ ID
   */
  readonly azMapper: AvailabilityZoneMapper;

  /**
   * The ALBs being used for the service
   */
  readonly albs?: IApplicationLoadBalancer[];

  /**
   * The period for metric measurement
   */
  readonly period: Duration;

  /**
   * The statistic used to measure target response latency, like p99, 
   * which can be specified using Stats.percentile(99) or "p99".
   */
  readonly latencyStatistic: string;

  /**
   * The percentage of faults for a single ALB to consider an AZ
   * to be unhealthy, this should align with your availability goal. For example
   * 1% or 5%, specify as 1 or 5.
   */
  readonly faultCountPercentageThreshold: number;

  /**
   * The threshold in seconds for ALB targets whose responses are slower than this
   * value at the specified percentile statistic.
   */
  readonly latencyThreshold: number;
}
