// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { Duration } from 'aws-cdk-lib';

/**
 * The properties for creating an override
 */
export interface CanaryTestMetricsOverrideProps {
  /**
   * The statistic used for alarms, for availability metrics this should
   * be "Sum", for latency metrics it could something like "p99" or "p99.9"
   *
   * @default - This property will use the default defined for the service
   */
  readonly alarmStatistic?: string;

  /**
   * The period for the metrics
   *
   * @default - This property will use the default defined for the service
   */
  readonly period?: Duration;

  /**
   * The number of evaluation periods for latency and availabiltiy alarms
   *
   * @default - This property will use the default defined for the service
   */
  readonly evaluationPeriods?: number;

  /**
   * The number of datapoints to alarm on for latency and availability alarms
   *
   * @default - This property will use the default defined for the service
   */
  readonly datapointsToAlarm?: number;

  /**
   * The threshold for alarms associated with success metrics, for example if measuring
   * success rate, the threshold may be 99, meaning you would want an alarm that triggers
   * if success drops below 99%.
   *
   * @default - This property will use the default defined for the service
   */
  readonly successAlarmThreshold?: number;

  /**
   * The threshold for alarms associated with fault metrics, for example if measuring
   * fault rate, the threshold may be 1, meaning you would want an alarm that triggers
   * if the fault rate goes above 1%.
   *
   * @default - This property will use the default defined for the service
   */
  readonly faultAlarmThreshold?: number;
}
