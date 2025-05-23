// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { Duration } from 'aws-cdk-lib';
import { ICanaryTestMetricsOverride } from './ICanaryTestMetricsOverride';
import { CanaryTestMetricsOverrideProps } from './props/CanaryTestMetricsOverrideProps';

/**
 * Provides overrides for the default metric settings
 * used for the automatically created canary tests
 */
export abstract class CanaryTestMetricsOverride implements ICanaryTestMetricsOverride {
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

  constructor(props: CanaryTestMetricsOverrideProps) {
    this.alarmStatistic = props.alarmStatistic;
    this.period = props.period;
    this.evaluationPeriods = props.evaluationPeriods;
    this.datapointsToAlarm = props.datapointsToAlarm;
  }
}
