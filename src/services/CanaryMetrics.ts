// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { ICanaryMetrics } from './ICanaryMetrics';
import { IOperationMetricDetails } from './IOperationMetricDetails';
import { CanaryMetricProps } from './props/CanaryMetricProps';

/**
 * Represents metrics for a canary testing a service
 */
export class CanaryMetrics implements ICanaryMetrics {
  /**
   * The canary availability metric details
   */
  readonly canaryAvailabilityMetricDetails: IOperationMetricDetails;

  /**
   * The canary latency metric details
   */
  readonly canaryLatencyMetricDetails: IOperationMetricDetails;

  constructor(props: CanaryMetricProps) {
    this.canaryAvailabilityMetricDetails =
      props.canaryAvailabilityMetricDetails;
    this.canaryLatencyMetricDetails = props.canaryLatencyMetricDetails;
  }
}
