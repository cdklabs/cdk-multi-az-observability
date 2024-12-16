// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { IOperationMetricDetails } from '../IOperationMetricDetails';

/**
 * Properties for canary metrics in an operation
 */
export interface CanaryMetricProps {
  /**
   * The canary availability metric details
   */
  readonly canaryAvailabilityMetricDetails: IOperationMetricDetails;

  /**
   * The canary latency metric details
   */
  readonly canaryLatencyMetricDetails: IOperationMetricDetails;
}
