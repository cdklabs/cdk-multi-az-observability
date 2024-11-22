// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { Duration } from "aws-cdk-lib";
import { Unit } from "aws-cdk-lib/aws-cloudwatch";
import { IOperationMetricDetails } from "./IOperationMetricDetails";
import { IServiceMetricDetails } from "./IServiceMetricDetails";
import { MetricDimensions } from "./props/MetricDimensions";
import { OperationMetricDetailsProps } from "./props/OperationMetricDetailsProps";

/**
 * Generic metric details for an operation
 */
export class OperationMetricDetails implements IOperationMetricDetails {
  /**
   * The operation these metric details are for
   */
  readonly operationName: string;

  /**
   * The CloudWatch metric namespace for these metrics
   */
  readonly metricNamespace: string;

  /**
   * The names of success indicating metrics
   */
  readonly successMetricNames: string[];

  /**
   * The names of fault indicating metrics
   */
  readonly faultMetricNames: string[];

  /**
   * The statistic used for alarms, for availability metrics this should
   * be "Sum", for latency metrics it could something like "p99" or "p99.9"
   */
  readonly alarmStatistic: string;

  /**
   * The statistics for successes you want to appear on dashboards, for example, with
   * latency metrics, you might want p50, p99, and tm99. For availability
   * metrics this will typically just be "Sum".
   *
   * @default - For availability metrics, this will be "Sum", for latency metrics it will be just "p99"
   */
  readonly graphedSuccessStatistics?: string[];

  /**
   * The statistics for faults you want to appear on dashboards, for example, with
   * latency metrics, you might want p50, p99, and tm99. For availability
   * metrics this will typically just be "Sum".
   *
   * @default - For availability metrics, this will be "Sum", for latency metrics it will be just "p99"
   */
  readonly graphedFaultStatistics?: string[];

  /**
   * The unit used for these metrics
   */
  readonly unit: Unit;

  /**
   * The period for the metrics
   */
  readonly period: Duration;

  /**
   * The number of evaluation periods for latency and availabiltiy alarms
   */
  readonly evaluationPeriods: number;

  /**
   * The number of datapoints to alarm on for latency and availability alarms
   */
  readonly datapointsToAlarm: number;

  /**
   * The threshold for alarms associated with success metrics, for example if measuring
   * success rate, the threshold may be 99, meaning you would want an alarm that triggers
   * if success drops below 99%.
   */
  readonly successAlarmThreshold: number;

  /**
   * The threshold for alarms associated with fault metrics, for example if measuring
   * fault rate, the threshold may be 1, meaning you would want an alarm that triggers
   * if the fault rate goes above 1%.
   */
  readonly faultAlarmThreshold: number;

  /**
   * The metric dimensions for this operation, must be implemented
   * as a concrete class by the user
   */
  readonly metricDimensions: MetricDimensions;

  constructor(
    props: OperationMetricDetailsProps,
    defaultProps: IServiceMetricDetails,
  ) {
    this.alarmStatistic = props.alarmStatistic
      ? props.alarmStatistic
      : defaultProps.alarmStatistic;
    this.datapointsToAlarm = props.datapointsToAlarm
      ? props.datapointsToAlarm
      : defaultProps.datapointsToAlarm;
    this.evaluationPeriods = props.evaluationPeriods
      ? props.evaluationPeriods
      : defaultProps.evaluationPeriods;
    this.faultAlarmThreshold = props.faultAlarmThreshold
      ? props.faultAlarmThreshold
      : defaultProps.faultAlarmThreshold;
    this.faultMetricNames = props.faultMetricNames
      ? props.faultMetricNames
      : defaultProps.faultMetricNames;
    this.graphedFaultStatistics = props.graphedFaultStatistics
      ? props.graphedFaultStatistics
      : defaultProps.graphedFaultStatistics;
    this.graphedSuccessStatistics = props.graphedSuccessStatistics
      ? props.graphedSuccessStatistics
      : defaultProps.graphedSuccessStatistics;
    this.metricNamespace = props.metricNamespace
      ? props.metricNamespace
      : defaultProps.metricNamespace;
    this.operationName = props.operationName;
    this.period = props.period ? props.period : defaultProps.period;
    this.successAlarmThreshold = props.successAlarmThreshold
      ? props.successAlarmThreshold
      : defaultProps.successAlarmThreshold;
    this.successMetricNames = props.successMetricNames
      ? props.successMetricNames
      : defaultProps.successMetricNames;
    this.unit = props.unit ? props.unit : defaultProps.unit;
    this.metricDimensions = props.metricDimensions;
  }
}
