// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { Duration } from 'aws-cdk-lib';
import { IAlarm } from 'aws-cdk-lib/aws-cloudwatch';
import { AvailabilityZoneMapper } from '../../azmapper/AvailabilityZoneMapper';
import { ApplicationLoadBalancerDetectionProps } from './ApplicationLoadBalancerDetectionProps';
import { NatGatewayDetectionProps } from './NatGatewayDetectionProps';

/**
 * The properties for creating a dashboard with basic metrics
 */
export interface BasicServiceDashboardProps {

  /**
   * The service's name
   */
  readonly serviceName: string;

  /**
   * The alarms indicating a single AZ impact, one per AZ
   */
  readonly zonalAggregateIsolatedImpactAlarms: { [key: string]: IAlarm };

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
  readonly albs?: ApplicationLoadBalancerDetectionProps;

  /**
   * The NAT Gateways being used for the service, a list of gateways per Availability zone
   */
  readonly natgws?: NatGatewayDetectionProps;

  /**
   * The period for metric measurement
   */
  readonly period: Duration;

  readonly latencyStatistic: string;
}
