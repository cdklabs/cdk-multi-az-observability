// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { IAlarm } from 'aws-cdk-lib/aws-cloudwatch';
import { IBaseOperationZonalAlarmsAndRules } from './IBaseOperationZonalAlarmsAndRules';

/**
 * Alarms and rules for canary metrics
 */
export interface ICanaryOperationZonalAlarmsAndRules
  extends IBaseOperationZonalAlarmsAndRules {
  /**
   * Alarm that triggers if either latency or availability breach the specified
   * threshold in this AZ and the AZ is an outlier for faults or latency
   */
  isolatedImpactAlarm: IAlarm;
}
