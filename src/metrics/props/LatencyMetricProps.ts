// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { AvailabilityAndLatencyMetricProps } from './AvailabilityAndLatencyMetricProps';
import { LatencyMetricType } from '../../utilities/LatencyMetricType';

/**
 * Metric properties for latency metrics
 */
export interface LatencyMetricProps extends AvailabilityAndLatencyMetricProps {
  /**
   * The type of latency metric
   */
  readonly metricType: LatencyMetricType;

  /**
   * The latency statistic like p99, tm99, or TC(100:)
   */
  readonly statistic: string;

  /**
   * Provide this to target only a specific metric
   * 
   * @default All metrics of the specified type will be returned
   */
  readonly metricName?: string;
}
