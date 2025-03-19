// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { IAlarm } from "aws-cdk-lib/aws-cloudwatch";
import { Construct } from "constructs";
import { IBaseOperationZonalAlarmsAndRules } from "./IBaseOperationZonalAlarmsAndRules";

/**
 * The base operation regional alarms and rules
 */
export abstract class BaseOperationZonalAlarmsAndRules
  extends Construct
  implements IBaseOperationZonalAlarmsAndRules
{
  /**
   * Availability alarm for this operation
   */
  abstract availabilityAlarm: IAlarm;

  /**
   * Latency alarm for this operation
   */
  abstract latencyAlarm: IAlarm;

  /**
   * Alarm that indicates that this AZ is an outlier for fault rate
   */
  abstract availabilityZoneIsOutlierForFaults: IAlarm;

  /**
   * Alarm that indicates this AZ is an outlier for high latency
   */
  abstract availabilityZoneIsOutlierForLatency: IAlarm;

  constructor(
    scope: Construct,
    id: string
  ) {
    super(scope, id);
  }
}
