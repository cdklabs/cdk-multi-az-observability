// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { IAlarm } from 'aws-cdk-lib/aws-cloudwatch';

/**
 * The base operation zonal alarms and rules
 */
export interface IBaseOperationZonalAlarmsAndRules {
  /**
   * Composite alarm for either availabiltiy or latency impact to this operation
   */
  availabilityOrLatencyAlarm: IAlarm;

  /**
   * Availability alarm for this operation
   */
  availabilityAlarm: IAlarm;

  /**
   * Latency alarm for this operation
   */
  latencyAlarm: IAlarm;

  /**
   * Alarm that indicates that this AZ is an outlier for fault rate
   */
  availabilityZoneIsOutlierForFaults: IAlarm;

  /**
   * Alarm that indicates this AZ is an outlier for high latency
   */
  availabilityZoneIsOutlierForLatency: IAlarm;
}
