// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { Duration } from 'aws-cdk-lib';
import { IAlarm, CfnInsightRule } from 'aws-cdk-lib/aws-cloudwatch';
import { ILoadBalancerV2 } from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import { IAvailabilityZoneMapper } from '../../azmapper/IAvailabilityZoneMapper';
import { IOperation } from '../../services/IOperation';

/**
 * Properties for creating an availability and latency dashboard for
 * a single operation
 */
export interface OperationAvailabilityAndLatencyDashboardProps {
  /**
   * The operation for this dashboard
   */
  readonly operation: IOperation;

  /**
   * The interval of the dashboard
   */
  readonly interval: Duration;

  /**
   * The load balancer supporting this operation, if this is not
   * provided, no load balancer metrics will be shown
   *
   * @default - No load balancer metrics will be shown on the dashboard
   */
  readonly loadBalancer?: ILoadBalancerV2;

  /**
   * Per AZ server-side availability alarms
   */
  readonly zonalEndpointServerAvailabilityAlarms: IAlarm[];

  /**
   * Per AZ server-side latency alarms
   */
  readonly zonalEndpointServerLatencyAlarms: IAlarm[];

  /**
   * Per AZ canary availability alarms
   */
  readonly zonalEndpointCanaryAvailabilityAlarms?: IAlarm[];

  /**
   * Per AZ canary latency alarms
   */
  readonly zonalEndpointCanaryLatencyAlarms?: IAlarm[];

  /**
   * Regional server-side availability alarm
   */
  readonly regionalEndpointServerAvailabilityAlarm: IAlarm;

  /**
   * Regional server-side latency alarm
   */
  readonly regionalEndpointServerLatencyAlarm: IAlarm;

  /**
   * Regional canary availability alarm
   */
  readonly regionalEndpointCanaryAvailabilityAlarm?: IAlarm;

  /**
   * Regional canary latency alarm
   */
  readonly regionalEndpointCanaryLatencyAlarm?: IAlarm;

  /**
   * Per AZ alarms that indicate isolated single AZ impact
   */
  readonly isolatedAZImpactAlarms: IAlarm[];

  /**
   * Alarm that indicates regional impact
   */
  readonly regionalImpactAlarm: IAlarm;

  /**
   * Insight rule that shows instance contributors to
   * high latency for this operation
   *
   * @default - Insight rule will not be shown on the dashboard
   */
  readonly instanceContributorsToHighLatency?: CfnInsightRule;

  /**
   * Insight rule that shows instance contributors to
   * faults for this operation
   *
   * @default - Insight rule will not be shown on the dashboard
   */
  readonly instanceContributorsToFaults?: CfnInsightRule;

  /**
   * The AZ Mapper
   */
  readonly azMapper: IAvailabilityZoneMapper;

  /**
   * The Availability Zones used for this operation
   */
  readonly availabilityZones: string[];
}
