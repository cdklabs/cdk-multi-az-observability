// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { LatencyMetricProps } from './LatencyMetricProps';

/**
 * The latency metric properties for an Availability Zone
 */
export interface ZonalLatencyMetricProps extends LatencyMetricProps {
  /**
   * The Availability Zone Id for the metrics
   */
  readonly availabilityZoneId: string;

  /**
   * The Availability Zone name for the metrics
   */
  readonly availabilityZone: string;
}
