// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { IOperationAvailabilityMetricDetails } from './IOperationAvailabilityMetricDetails';
import { IOperationLatencyMetricDetails } from './IOperationLatencyMetricDetails';

/**
 * The metric definitions for metric produced by the canary
 */
export interface ICanaryMetrics {
  /**
   * The canary availability metric details
   */
  readonly canaryAvailabilityMetricDetails: IOperationAvailabilityMetricDetails;

  /**
   * The canary latency metric details
   */
  readonly canaryLatencyMetricDetails: IOperationLatencyMetricDetails;
}
