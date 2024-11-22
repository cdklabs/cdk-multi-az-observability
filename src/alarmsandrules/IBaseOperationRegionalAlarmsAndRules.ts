// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { IAlarm } from "aws-cdk-lib/aws-cloudwatch";

/**
 * Base regional alarms and rules
 */
export interface IBaseOperationRegionalAlarmsAndRules {
  /**
   * Availability alarm for this operation
   */
  availabilityAlarm: IAlarm;

  /**
   * Latency alarm for this operation
   */
  latencyAlarm: IAlarm;

  /**
   * Composite alarm for either availabiltiy or latency impact to this operation
   */
  availabilityOrLatencyAlarm: IAlarm;
}
