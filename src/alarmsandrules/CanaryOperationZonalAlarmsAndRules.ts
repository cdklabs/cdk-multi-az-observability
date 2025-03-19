// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { IAlarm } from 'aws-cdk-lib/aws-cloudwatch';
import { Construct } from 'constructs';
import { AvailabilityAndLatencyAlarmsAndRules } from './AvailabilityAndLatencyAlarmsAndRules';
import { BaseOperationZonalAlarmsAndRules } from './BaseOperationZonalAlarmsAndRules';
import { ICanaryOperationZonalAlarmsAndRules } from './ICanaryOperationZonalAlarmsAndRules';
import { CanaryOperationZonalAlarmsAndRulesProps } from './props/CanaryOperationZonalAlarmsAndRulesProps';
import { OutlierDetectionAlgorithm } from '../utilities/OutlierDetectionAlgorithm';
import { IOperation } from '../services/IOperation';

/**
 * Creates the alarms and rules for a particular operation as measured by the canary
 */
export class CanaryOperationZonalAlarmsAndRules
  extends BaseOperationZonalAlarmsAndRules
  implements ICanaryOperationZonalAlarmsAndRules {

  /**
   * Availability alarm for this operation
   */
  readonly availabilityAlarm: IAlarm;

  /**
   * Latency alarm for this operation
   */
  readonly latencyAlarm: IAlarm;

  /**
   * Alarm that triggers if either latency or availability breach the specified
   * threshold in this AZ and the AZ is an outlier for faults or latency
   */
  readonly isolatedImpactAlarm: IAlarm;

  /**
   * Alarm that indicates that this AZ is an outlier for fault rate
   */
  readonly availabilityZoneIsOutlierForFaults: IAlarm;

  /**
   * Alarm that indicates this AZ is an outlier for high latency
   */
  readonly availabilityZoneIsOutlierForLatency: IAlarm;

  constructor(
    scope: Construct,
    id: string,
    props: CanaryOperationZonalAlarmsAndRulesProps,
  ) {
    super(scope, id);

    let azLetter: string = props.availabilityZone.substring(
        props.availabilityZone.length - 1,
    );
    let availabilityZoneId: string =
      props.operationAlarmsAndRulesProps.azMapper.availabilityZoneIdFromAvailabilityZoneLetter(azLetter);
    
    let operation: IOperation = props.operationAlarmsAndRulesProps.operation;

    this.availabilityAlarm =
    AvailabilityAndLatencyAlarmsAndRules.createZonalAvailabilityAlarm(
      this,
      operation.canaryMetricDetails!.canaryAvailabilityMetricDetails,
      props.availabilityZone,
      availabilityZoneId,
      props.counter,
      props.nameSuffix,
    );
  this.latencyAlarm =
    AvailabilityAndLatencyAlarmsAndRules.createZonalLatencyAlarm(
      this,
      operation.canaryMetricDetails!.canaryLatencyMetricDetails,
      props.availabilityZone,
      availabilityZoneId,
      props.counter,
      props.nameSuffix,
    );
    
    if (props.operationAlarmsAndRulesProps.availabilityOutlierDetectionAlgorithm == OutlierDetectionAlgorithm.STATIC) {
      this.availabilityZoneIsOutlierForFaults =
        AvailabilityAndLatencyAlarmsAndRules.createZonalFaultRateStaticOutlierAlarmForCanaries(
          this,
          operation.canaryMetricDetails!.canaryAvailabilityMetricDetails,
          props.availabilityZone,
          availabilityZoneId,
          operation.service.availabilityZoneNames,
          props.counter,
          props.operationAlarmsAndRulesProps.availabilityOutlierThreshold,
          props.nameSuffix,
        );
    } else {
      this.availabilityZoneIsOutlierForFaults =
        AvailabilityAndLatencyAlarmsAndRules.createZonalFaultRateOutlierAlarm(
          this,
          operation.canaryMetricDetails!.canaryAvailabilityMetricDetails,
          availabilityZoneId,
          operation.service.availabilityZoneNames.map((az) => {
            return props.operationAlarmsAndRulesProps.azMapper.availabilityZoneIdFromAvailabilityZoneLetter(
              az.substring(az.length - 1),
            );
          }),
          props.operationAlarmsAndRulesProps.availabilityOutlierThreshold,
          props.operationAlarmsAndRulesProps.outlierDetectionFunction!,
          props.operationAlarmsAndRulesProps.availabilityOutlierDetectionAlgorithm,
          props.counter,
          props.nameSuffix,
        );  
    }

    if (props.operationAlarmsAndRulesProps.latencyOutlierDetectionAlgorithm == OutlierDetectionAlgorithm.STATIC) {
      this.availabilityZoneIsOutlierForLatency =
        AvailabilityAndLatencyAlarmsAndRules.createZonalHighLatencyStaticOutlierAlarmForCanaries(
          this,
          operation.canaryMetricDetails!.canaryLatencyMetricDetails,
          props.availabilityZone,
          availabilityZoneId,
          operation.service.availabilityZoneNames,
          props.counter,
          props.operationAlarmsAndRulesProps.latencyOutlierThreshold,
          props.nameSuffix,
        );
    } else {
      this.availabilityZoneIsOutlierForLatency =
        AvailabilityAndLatencyAlarmsAndRules.createZonalHighLatencyOutlierAlarm(
          this,
          operation.canaryMetricDetails!.canaryLatencyMetricDetails,
          availabilityZoneId,
          operation.service.availabilityZoneNames.map((az) => {
            return props.operationAlarmsAndRulesProps.azMapper.availabilityZoneIdFromAvailabilityZoneLetter(
              az.substring(az.length - 1),
            );
          }),
          props.operationAlarmsAndRulesProps.latencyOutlierThreshold,
          props.operationAlarmsAndRulesProps.outlierDetectionFunction!,
          props.operationAlarmsAndRulesProps.latencyOutlierDetectionAlgorithm,
          props.counter,
          props.nameSuffix,
        );
    }

    this.isolatedImpactAlarm =
      AvailabilityAndLatencyAlarmsAndRules.createCanaryIsolatedAZImpactAlarm(
        this,
        operation.operationName,
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
