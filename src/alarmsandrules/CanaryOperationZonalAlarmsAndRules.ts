// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { IAlarm } from 'aws-cdk-lib/aws-cloudwatch';
import { Construct } from 'constructs';
import { AvailabilityAndLatencyAlarmsAndRules } from './AvailabilityAndLatencyAlarmsAndRules';
import { BaseOperationZonalAlarmsAndRules } from './BaseOperationZonalAlarmsAndRules';
import { ICanaryOperationZonalAlarmsAndRules } from './ICanaryOperationZonalAlarmsAndRules';
import { CanaryOperationZonalAlarmsAndRulesProps } from './props/CanaryOperationZonalAlarmsAndRulesProps';
import { OutlierDetectionAlgorithm } from '../utilities/OutlierDetectionAlgorithm';

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

  /**
   * Alarm that indicates that this AZ is an outlier for fault rate
   */
  availabilityZoneIsOutlierForFaults: IAlarm;

  /**
   * Alarm that indicates this AZ is an outlier for high latency
   */
  availabilityZoneIsOutlierForLatency: IAlarm;

  constructor(
    scope: Construct,
    id: string,
    props: CanaryOperationZonalAlarmsAndRulesProps,
  ) {
    super(scope, id, props);

    let azLetter: string = props.availabilityZone.substring(props.availabilityZone.length - 1);
    let availabilityZoneId: string = props.azMapper.availabilityZoneIdFromAvailabilityZoneLetter(azLetter);

    if (props.availabilityOutlierDetectionAlgorithm == OutlierDetectionAlgorithm.STATIC) {
      this.availabilityZoneIsOutlierForFaults =
        AvailabilityAndLatencyAlarmsAndRules.createZonalFaultRateStaticOutlierAlarmForCanaries(
          this,
          props.availabilityMetricDetails,
          props.availabilityZone,
          availabilityZoneId,
          props.operation.service.availabilityZoneNames,
          props.counter,
          props.availabilityOutlierThreshold,
          props.nameSuffix,
        );
    } else {
      this.availabilityZoneIsOutlierForFaults =
        AvailabilityAndLatencyAlarmsAndRules.createZonalFaultRateOutlierAlarm(
          this,
          props.availabilityMetricDetails,
          availabilityZoneId,
          props.operation.service.availabilityZoneNames.map((az) => {
            return props.azMapper.availabilityZoneIdFromAvailabilityZoneLetter(
              az.substring(az.length - 1),
            );
          }),
          props.availabilityOutlierThreshold,
          props.outlierDetectionFunction!,
          props.availabilityOutlierDetectionAlgorithm,
          props.counter,
          props.nameSuffix,
        );  
    }

    if (props.latencyOutlierDetectionAlgorithm == OutlierDetectionAlgorithm.STATIC) {
      this.availabilityZoneIsOutlierForLatency =
        AvailabilityAndLatencyAlarmsAndRules.createZonalHighLatencyStaticOutlierAlarmForCanaries(
          this,
          props.latencyMetricDetails,
          props.availabilityZone,
          availabilityZoneId,
          props.operation.service.availabilityZoneNames,
          props.counter,
          props.latencyOutlierThreshold,
          props.nameSuffix,
        );
    } else {
      this.availabilityZoneIsOutlierForLatency =
        AvailabilityAndLatencyAlarmsAndRules.createZonalHighLatencyOutlierAlarm(
          this,
          props.latencyMetricDetails,
          availabilityZoneId,
          props.operation.service.availabilityZoneNames.map((az) => {
            return props.azMapper.availabilityZoneIdFromAvailabilityZoneLetter(
              az.substring(az.length - 1),
            );
          }),
          props.latencyOutlierThreshold,
          props.outlierDetectionFunction!,
          props.latencyOutlierDetectionAlgorithm,
          props.counter,
          props.nameSuffix,
        );
    }

    this.isolatedImpactAlarm =
      AvailabilityAndLatencyAlarmsAndRules.createCanaryIsolatedAZImpactAlarm(
        this,
        props.availabilityMetricDetails.operationName,
        availabilityZoneId,
        props.counter,
        this.availabilityZoneIsOutlierForFaults,
        this.availabilityAlarm,
        this.availabilityZoneIsOutlierForLatency,
        this.latencyAlarm,
        props.nameSuffix,
      );
  }
}
