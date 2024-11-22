// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { Duration } from 'aws-cdk-lib';

/**
 * Provides overrides for the default metric settings
 * used for the automatically created canary tests
 */
export interface ICanaryTestMetricsOverride {
  /**
   * The statistic used for alarms, for availability metrics this should
   * be "Sum", for latency metrics it could something like "p99" or "p99.9"
   */
  readonly alarmStatistic?: string;

  /**
   * The period for the metrics
   */
  readonly period?: Duration;

  /**
   * The number of evaluation periods for latency and availabiltiy alarms
   */
  readonly evaluationPeriods?: number;

  /**
   * The number of datapoints to alarm on for latency and availability alarms
   */
  readonly datapointsToAlarm?: number;

  /**
   * The threshold for alarms associated with success metrics, for example if measuring
   * success rate, the threshold may be 99, meaning you would want an alarm that triggers
   * if success drops below 99%.
   */
  readonly successAlarmThreshold?: number;

  /**
   * The threshold for alarms associated with fault metrics, for example if measuring
   * fault rate, the threshold may be 1, meaning you would want an alarm that triggers
   * if the fault rate goes above 1%.
   */
  readonly faultAlarmThreshold?: number;
}
