// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { IOperationMetricDetails } from "../../services/IOperationMetricDetails";

/**
 * Common availability and latency metric props
 */
export interface AvailabilityAndLatencyMetricProps {
  /**
   * The metric details to create metrics from
   */
  readonly metricDetails: IOperationMetricDetails;

  /**
   * The metric label
   */
  readonly label?: string;

  /**
   * (Optional) A key prefix for the metric name to make it unique
   * in alarms and graphs
   */
  readonly keyPrefix?: string;

  /**
   * The Region for the metrics
   */
  readonly region?: string;
}
