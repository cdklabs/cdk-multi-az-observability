// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { Duration } from 'aws-cdk-lib';
import { Unit } from 'aws-cdk-lib/aws-cloudwatch';
import { MetricDimensions } from './MetricDimensions';

/**
 * The properties for operation metric details
 */
export interface OperationMetricDetailsProps {
  /**
   * The operation these metric details are for
   */
  readonly operationName: string;

  /**
   * The CloudWatch metric namespace for these metrics
   *
   * @default - The service default is used
   */
  readonly metricNamespace?: string;

  /**
   * The names of success indicating metrics
   *
   * @default - The service default is used
   */
  readonly successMetricNames?: string[];

  /**
   * The names of fault indicating metrics
   *
   * @default - The service default is used
   */
  readonly faultMetricNames?: string[];

  /**
   * The statistic used for alarms, for availability metrics this should
   * be "Sum", for latency metrics it could something like "p99" or "p99.9"
   *
   * @default - The service default is used
   */
  readonly alarmStatistic?: string;

  /**
   * The statistics for successes you want to appear on dashboards, for example, with
   * latency metrics, you might want p50, p99, and tm99. For availability
   * metrics this will typically just be "Sum".
   *
   * @default - The service default is used
   */
  readonly graphedSuccessStatistics?: string[];

  /**
   * The statistics for faults you want to appear on dashboards, for example, with
   * latency metrics, you might want p50, p99, and tm99. For availability
   * metrics this will typically just be "Sum".
   *
   * @default - The service default is used
   */
  readonly graphedFaultStatistics?: string[];

  /**
   * The unit used for these metrics
   *
   * @default - The service default is used
   */
  readonly unit?: Unit;

  /**
   * The period for the metrics
   *
   * @default - The service default is used
   */
  readonly period?: Duration;

  /**
   * The number of evaluation periods for latency and availabiltiy alarms
   *
   * @default - The service default is used
   */
  readonly evaluationPeriods?: number;

  /**
   * The number of datapoints to alarm on for latency and availability alarms
   *
   * @default - The service default is used
   */
  readonly datapointsToAlarm?: number;

  /**
   * The user implemented functions for providing the metric's dimensions
   */
  readonly metricDimensions: MetricDimensions;
}
