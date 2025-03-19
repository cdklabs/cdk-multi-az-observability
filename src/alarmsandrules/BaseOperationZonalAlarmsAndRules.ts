// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { IAlarm } from "aws-cdk-lib/aws-cloudwatch";
import { Construct } from "constructs";
import { AvailabilityAndLatencyAlarmsAndRules } from "./AvailabilityAndLatencyAlarmsAndRules";
import { IBaseOperationZonalAlarmsAndRules } from "./IBaseOperationZonalAlarmsAndRules";
import { BaseOperationZonalAlarmsAndRulesProps } from "./props/BaseOperationZonalAlarmsAndRulesProps";

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
  availabilityAlarm: IAlarm;

  /**
   * Latency alarm for this operation
   */
  latencyAlarm: IAlarm;

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
    id: string,
    props: BaseOperationZonalAlarmsAndRulesProps,
  ) {
    super(scope, id);

    let azLetter: string = props.availabilityZone.substring(
      props.availabilityZone.length - 1,
    );
    let availabilityZoneId: string =
      props.azMapper.availabilityZoneIdFromAvailabilityZoneLetter(azLetter);

    this.availabilityAlarm =
      AvailabilityAndLatencyAlarmsAndRules.createZonalAvailabilityAlarm(
        this,
        props.availabilityMetricDetails,
        props.availabilityZone,
        availabilityZoneId,
        props.counter,
        props.nameSuffix,
      );
    this.latencyAlarm =
      AvailabilityAndLatencyAlarmsAndRules.createZonalLatencyAlarm(
        this,
        props.latencyMetricDetails,
        props.availabilityZone,
        availabilityZoneId,
        props.counter,
        props.nameSuffix,
      );
  }
}
