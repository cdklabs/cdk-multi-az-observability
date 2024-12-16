// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { IAlarm } from 'aws-cdk-lib/aws-cloudwatch';
import { Construct } from 'constructs';
import { AvailabilityAndLatencyAlarmsAndRules } from './AvailabilityAndLatencyAlarmsAndRules';
import { BaseOperationZonalAlarmsAndRules } from './BaseOperationZonalAlarmsAndRules';
import { ICanaryOperationZonalAlarmsAndRules } from './ICanaryOperationZonalAlarmsAndRules';
import { CanaryOperationZonalAlarmsAndRulesProps } from './props/CanaryOperationZonalAlarmsAndRulesProps';

/**
 * Creates the alarms and rules for a particular operation as measured by the canary
 */
export class CanaryOperationZonalAlarmsAndRules
  extends BaseOperationZonalAlarmsAndRules
  implements ICanaryOperationZonalAlarmsAndRules {
  /**
   * Alarm that triggers if either latency or availability breach the specified
   * threshold in this AZ and the AZ is an outlier for faults or latency
   */
  isolatedImpactAlarm: IAlarm;

  constructor(
    scope: Construct,
    id: string,
    props: CanaryOperationZonalAlarmsAndRulesProps,
  ) {
    super(scope, id, props);

    this.isolatedImpactAlarm =
      AvailabilityAndLatencyAlarmsAndRules.createCanaryIsolatedAZImpactAlarm(
        this,
        props.availabilityMetricDetails.operationName,
        props.availabilityZoneId,
        props.counter,
        this.availabilityZoneIsOutlierForFaults,
        this.availabilityAlarm,
        this.availabilityZoneIsOutlierForLatency,
        this.latencyAlarm,
        props.nameSuffix,
      );
  }
}
