// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { Duration } from "aws-cdk-lib";
import { IServiceMetricDetails } from "./IServiceMetricDetails";

/**
 * Details for the defaults used in a service for metrics in one perspective, such as server side latency
 */
export interface IServiceLatencyMetricDetails extends IServiceMetricDetails {
  /**
   * The threshold for alarms associated with latency success metrics, for example if success
   * latency exceeds 500 milliseconds
   */
  readonly successAlarmThreshold: Duration;
}