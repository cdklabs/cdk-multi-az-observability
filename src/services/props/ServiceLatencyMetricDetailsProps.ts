// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { Duration } from "aws-cdk-lib";
import { ServiceMetricDetailsProps } from "./ServiceMetricDetailsProps";

/**
 * Props for service latency metrics
 */
export interface ServiceLatencyMetricDetailsProps extends ServiceMetricDetailsProps {
  /**
   * The threshold for alarms associated with latency success metrics, for example if success
   * latency exceeds 500 milliseconds
   */
  readonly successAlarmThreshold: Duration;
}