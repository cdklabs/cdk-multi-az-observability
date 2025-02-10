// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import {
  IAlarm,
  CfnInsightRule,
  CompositeAlarm,
  AlarmRule,
} from 'aws-cdk-lib/aws-cloudwatch';
import { Construct } from 'constructs';
import { AvailabilityAndLatencyAlarmsAndRules } from './AvailabilityAndLatencyAlarmsAndRules';
import { BaseOperationZonalAlarmsAndRules } from './BaseOperationZonalAlarmsAndRules';
import { IServerSideOperationZonalAlarmsAndRules } from './IServerSideOperationZonalAlarmsAndRules';
import { ServerSideOperationZonalAlarmsAndRulesProps } from './props/ServerSideOperationZonalAlarmsAndRulesProps';
import { OutlierDetectionAlgorithm } from '../utilities/OutlierDetectionAlgorithm';

/**
 * The server side alarms and rules for an operation in an Availability Zone
 */
export class ServerSideOperationZonalAlarmsAndRules
  extends BaseOperationZonalAlarmsAndRules
  implements IServerSideOperationZonalAlarmsAndRules {
  /**
   * Alarm that triggers if either latency or availability breach the specified
   * threshold in this AZ and the AZ is an outlier for faults or latency
   */
  isolatedImpactAlarm: IAlarm;

  /**
   * Alarm indicating that there are multiple instances producing faults in
   * this AZ indicating the fault rate is not being caused by a single instance
   */
  multipleInstancesProducingFaultsInThisAvailabilityZone?: IAlarm;

  /**
   * Alarm indicating that there are multiple instances producing high
   * latency responses in this AZ indicating the latency is not being
   * caused by a single instance
   */
  multipleInstancesProducingHighLatencyInThisAZ?: IAlarm;

  /**
   * Insight rule that measures the number of instances contributing to high latency in this AZ
   */
  instanceContributorsToHighLatencyInThisAZ?: CfnInsightRule;

  /**
   * Insight rule that measures the number of instances contributing to faults in this AZ
   */
  instanceContributorsToFaultsInThisAZ?: CfnInsightRule;

  /**
   * Insight rule that is used to calculate the number of instances in this particular AZ that is used with metric math to calculate
   * the percent of instances contributing to latency or faults
   */
  instancesHandlingRequestsInThisAZ?: CfnInsightRule;

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
    props: ServerSideOperationZonalAlarmsAndRulesProps,
  ) {
    super(scope, id, props);

    if (props.outlierDetectionAlgorithm == OutlierDetectionAlgorithm.STATIC) {
      this.availabilityZoneIsOutlierForFaults =
        AvailabilityAndLatencyAlarmsAndRules.createZonalFaultRateStaticOutlierAlarm(
          this,
          props.availabilityMetricDetails,
          props.availabilityZoneId,
          props.counter,
          props.outlierThreshold,
          props.nameSuffix,
        );
      this.availabilityZoneIsOutlierForLatency =
        AvailabilityAndLatencyAlarmsAndRules.createZonalHighLatencyStaticOutlierAlarm(
          this,
          props.latencyMetricDetails,
          props.availabilityZoneId,
          props.counter,
          props.outlierThreshold,
          props.nameSuffix,
        );
    } else {
      this.availabilityZoneIsOutlierForFaults =
        AvailabilityAndLatencyAlarmsAndRules.createZonalFaultRateOutlierAlarm(
          this,
          props.availabilityMetricDetails,
          props.availabilityZoneId,
          props.operation.service.availabilityZoneNames.map((az) => {
            return props.azMapper.availabilityZoneIdFromAvailabilityZoneLetter(
              az.substring(az.length - 1),
            );
          }),
          props.outlierThreshold,
          props.outlierDetectionFunction!,
          props.outlierDetectionAlgorithm,
          props.counter,
          props.nameSuffix,
        );
      this.availabilityZoneIsOutlierForLatency =
        AvailabilityAndLatencyAlarmsAndRules.createZonalHighLatencyOutlierAlarm(
          this,
          props.latencyMetricDetails,
          props.availabilityZoneId,
          props.operation.service.availabilityZoneNames.map((az) => {
            return props.azMapper.availabilityZoneIdFromAvailabilityZoneLetter(
              az.substring(az.length - 1),
            );
          }),
          props.outlierThreshold,
          props.outlierDetectionFunction!,
          props.outlierDetectionAlgorithm,
          props.counter,
          props.nameSuffix,
        );
    }

    if (
      props.contributorInsightRuleDetails !== undefined &&
      props.contributorInsightRuleDetails != null
    ) {
      this.instancesHandlingRequestsInThisAZ =
        AvailabilityAndLatencyAlarmsAndRules.createServerSideInstancesHandlingRequestsInThisAZRule(
          this,
          props.availabilityMetricDetails.operationName,
          props.availabilityZoneId,
          props.contributorInsightRuleDetails,
          props.counter,
          props.nameSuffix,
        );
      this.instanceContributorsToFaultsInThisAZ =
        AvailabilityAndLatencyAlarmsAndRules.createServerSideInstanceFaultContributorsInThisAZRule(
          this,
          props.availabilityMetricDetails.operationName,
          props.availabilityZoneId,
          props.contributorInsightRuleDetails,
          props.counter,
          props.nameSuffix,
        );
      this.multipleInstancesProducingFaultsInThisAvailabilityZone =
        AvailabilityAndLatencyAlarmsAndRules.createServerSideZonalMoreThanOneInstanceProducingFaultsAlarm(
          this,
          props.availabilityMetricDetails,
          props.availabilityZoneId,
          props.counter,
          props.outlierThreshold,
          this.instanceContributorsToFaultsInThisAZ,
          this.instancesHandlingRequestsInThisAZ,
          props.nameSuffix,
        );
      this.instanceContributorsToHighLatencyInThisAZ =
        AvailabilityAndLatencyAlarmsAndRules.createServerSideInstanceHighLatencyContributorsInThisAZRule(
          this,
          props.latencyMetricDetails,
          props.availabilityZoneId,
          props.contributorInsightRuleDetails,
          props.counter,
          props.nameSuffix,
        );
      this.multipleInstancesProducingHighLatencyInThisAZ =
        AvailabilityAndLatencyAlarmsAndRules.createServerSideZonalMoreThanOneInstanceProducingHighLatencyAlarm(
          this,
          props.latencyMetricDetails,
          props.availabilityZoneId,
          props.counter,
          props.outlierThreshold,
          this.instanceContributorsToHighLatencyInThisAZ,
          this.instancesHandlingRequestsInThisAZ,
          props.nameSuffix,
        );

      this.isolatedImpactAlarm =
        AvailabilityAndLatencyAlarmsAndRules.createServerSideIsolatedAZImpactAlarm(
          this,
          props.availabilityMetricDetails.operationName,
          props.availabilityZoneId,
          props.counter,
          this.availabilityZoneIsOutlierForFaults,
          this.availabilityAlarm,
          this.multipleInstancesProducingFaultsInThisAvailabilityZone,
          this.availabilityZoneIsOutlierForLatency,
          this.latencyAlarm,
          this.multipleInstancesProducingHighLatencyInThisAZ,
          props.nameSuffix,
        );
    } else {
      this.isolatedImpactAlarm = new CompositeAlarm(
        scope,
        props.operation.operationName +
          'AZ' +
          props.counter +
          'IsolatedImpactAlarm' +
          props.nameSuffix,
        {
          compositeAlarmName:
            props.availabilityZoneId +
            `-${props.operation.operationName.toLowerCase()}-isolated-impact-alarm` +
            props.nameSuffix,
          alarmRule: AlarmRule.anyOf(
            AlarmRule.allOf(
              this.availabilityZoneIsOutlierForFaults,
              this.availabilityAlarm,
            ),
            AlarmRule.allOf(
              this.availabilityZoneIsOutlierForLatency,
              this.latencyAlarm,
            ),
          ),
          actionsEnabled: false,
        },
      );
    }
  }
}
