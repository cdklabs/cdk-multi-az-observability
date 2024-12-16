// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { IAlarm, CfnInsightRule } from 'aws-cdk-lib/aws-cloudwatch';
import { IOperation } from '../../services/IOperation';
import { IOperationMetricDetails } from '../../services/IOperationMetricDetails';

/**
 * Props for creating operation dashboard availability and latency widgets
 */
export interface OperationLatencyWidgetProps {
  /**
   * The operation for this widget
   */
  readonly operation: IOperation;

  /**
   * The latency metric details
   */
  readonly latencyMetricDetails: IOperationMetricDetails;

  /**
   * The number of AZs being used
   */
  readonly availabilityZoneIds: string[];

  /**
   * An alarm per AZ for latency
   */
  readonly zonalEndpointLatencyAlarms: IAlarm[];

  /**
   * The regional endpoint latency alarm
   */
  readonly regionalEndpointLatencyAlarm: IAlarm;

  /**
   * Instance contributors to high latency, only set for
   * server-side widgets
   */
  readonly instanceContributorsToHighLatency?: CfnInsightRule;

  /**
   * Is this widget for the canary metrics
   */
  readonly isCanary: boolean;
}
