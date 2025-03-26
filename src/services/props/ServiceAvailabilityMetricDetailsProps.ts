// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { ServiceMetricDetailsProps } from "./ServiceMetricDetailsProps";

/**
 * Props for service availability metrics
 */
export interface ServiceAvailabilityMetricDetailsProps extends ServiceMetricDetailsProps {
   /**
   * The threshold for alarms associated with availability success metrics, for example if measuring
   * success rate, the threshold may be 99, meaning you would want an alarm that triggers
   * if success drops below 99%.
   */
  readonly successAlarmThreshold: number;

  /**
   * The threshold for alarms associated with availability fault metrics, for example if measuring
   * fault rate, the threshold may be 1, meaning you would want an alarm that triggers
   * if the fault rate goes above 1%.
   */
  readonly faultAlarmThreshold: number;
}