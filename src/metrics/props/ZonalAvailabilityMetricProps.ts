// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { AvailabilityMetricProps } from "./AvailabilityMetricProps";

/**
 * The Availability Zone availability metric properties
 */
export interface ZonalAvailabilityMetricProps extends AvailabilityMetricProps {
  /**
   * The Availability Zone Id for the metrics
   */
  readonly availabilityZoneId: string;
}
