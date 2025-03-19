// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { Duration } from 'aws-cdk-lib';
import { IAlarm, CfnInsightRule } from 'aws-cdk-lib/aws-cloudwatch';
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
