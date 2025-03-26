// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { IOperationAvailabilityMetricDetails } from '../IOperationAvailabilityMetricDetails';
import { IOperationLatencyMetricDetails } from '../IOperationLatencyMetricDetails';

/**
 * Properties for canary metrics in an operation
 */
export interface CanaryMetricProps {
  /**
   * The canary availability metric details
   */
  readonly canaryAvailabilityMetricDetails: IOperationAvailabilityMetricDetails;

  /**
   * The canary latency metric details
   */
  readonly canaryLatencyMetricDetails: IOperationLatencyMetricDetails;
}
