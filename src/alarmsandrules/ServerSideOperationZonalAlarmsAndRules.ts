// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import {
  IAlarm,
  CfnInsightRule,
  CompositeAlarm,
  AlarmRule,
} from "aws-cdk-lib/aws-cloudwatch";
import { Construct } from "constructs";
import { AvailabilityAndLatencyAlarmsAndRules } from "./AvailabilityAndLatencyAlarmsAndRules";
import { BaseOperationZonalAlarmsAndRules } from "./BaseOperationZonalAlarmsAndRules";
import { IServerSideOperationZonalAlarmsAndRules } from "./IServerSideOperationZonalAlarmsAndRules";
import { ServerSideOperationZonalAlarmsAndRulesProps } from "./props/ServerSideOperationZonalAlarmsAndRulesProps";
import { OutlierDetectionAlgorithm } from "../utilities/OutlierDetectionAlgorithm";
import { IOperation } from "../services/IOperation";
import { LatencyOutlierMetricAggregation } from "../outlier-detection/LatencyOutlierMetricAggregation";

/**
 * The server side alarms and rules for an operation in an Availability Zone
 */
export class ServerSideOperationZonalAlarmsAndRules
  extends BaseOperationZonalAlarmsAndRules
  implements IServerSideOperationZonalAlarmsAndRules
{
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
   * Alarm indicating that there are multiple instances producing faults in
   * this AZ indicating the fault rate is not being caused by a single instance
   */
  readonly multipleInstancesProducingFaultsInThisAvailabilityZone?: IAlarm;

  /**
   * Alarm indicating that there are multiple instances producing high
   * latency responses in this AZ indicating the latency is not being
   * caused by a single instance
   */
  readonly multipleInstancesProducingHighLatencyInThisAZ?: IAlarm;

  /**
   * Insight rule that measures the number of instances contributing to high latency in this AZ
   */
  readonly instanceContributorsToHighLatencyInThisAZ?: CfnInsightRule;

  /**
   * Insight rule that measures the number of instances contributing to faults in this AZ
   */
  readonly instanceContributorsToFaultsInThisAZ?: CfnInsightRule;

  /**
   * Insight rule that is used to calculate the number of instances in this particular AZ that is used with metric math to calculate
   * the percent of instances contributing to latency or faults
   */
  readonly instancesHandlingRequestsInThisAZ?: CfnInsightRule;

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
    props: ServerSideOperationZonalAlarmsAndRulesProps,
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
        operation.serverSideAvailabilityMetricDetails,
        props.availabilityZone,
        availabilityZoneId,
        props.counter,
        props.nameSuffix,
      );
    this.latencyAlarm =
      AvailabilityAndLatencyAlarmsAndRules.createZonalLatencyAlarm(
        this,
        operation.serverSideLatencyMetricDetails,
        props.availabilityZone,
        availabilityZoneId,
        props.counter,
        props.nameSuffix,
      );

    // We want to know three things:
    // 1. There is impact in one AZ from either the server or canary perspective
    //   This is being done by the base class
    // 2. The impact in that AZ is an outlier
    //   This is being done here
    // 3. The impact is coming from more than 1 instance
    //   This is being done here

    if (props.operationAlarmsAndRulesProps.availabilityOutlierDetectionAlgorithm == OutlierDetectionAlgorithm.STATIC) {
      this.availabilityZoneIsOutlierForFaults =
        AvailabilityAndLatencyAlarmsAndRules.createZonalFaultRateStaticOutlierAlarm(
          this,
          operation.serverSideAvailabilityMetricDetails,
          props.availabilityZone,
          availabilityZoneId,
          props.counter,
          props.operationAlarmsAndRulesProps.availabilityOutlierThreshold,
          props.nameSuffix,
        );
    } else {
      this.availabilityZoneIsOutlierForFaults =
        AvailabilityAndLatencyAlarmsAndRules.createZonalFaultRateOutlierAlarm(
          this,
          operation.serverSideAvailabilityMetricDetails,
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
        AvailabilityAndLatencyAlarmsAndRules.createZonalHighLatencyStaticOutlierAlarm(
          this,
          operation.serverSideLatencyMetricDetails,
          props.availabilityZone,
          availabilityZoneId,
          props.counter,
          props.operationAlarmsAndRulesProps.latencyOutlierThreshold,
          props.nameSuffix,
        );
    } else {
      this.availabilityZoneIsOutlierForLatency =
        AvailabilityAndLatencyAlarmsAndRules.createZonalHighLatencyOutlierAlarm(
          this,
          operation.serverSideLatencyMetricDetails,
          availabilityZoneId,
          operation.service.availabilityZoneNames.map((az) => {
            return props.operationAlarmsAndRulesProps.azMapper.availabilityZoneIdFromAvailabilityZoneLetter(
              az.substring(az.length - 1),
            );
          }),
          props.operationAlarmsAndRulesProps.latencyOutlierThreshold,
          props.operationAlarmsAndRulesProps.outlierDetectionFunction!,
          props.operationAlarmsAndRulesProps.latencyOutlierMetricAggregation || LatencyOutlierMetricAggregation.COUNT,
          props.operationAlarmsAndRulesProps.latencyOutlierDetectionAlgorithm,
          props.counter,
          props.nameSuffix,
        );
    }

    if (operation.serverSideContributorInsightRuleDetails) {
      this.instancesHandlingRequestsInThisAZ =
        AvailabilityAndLatencyAlarmsAndRules.createServerSideInstancesHandlingRequestsInThisAZRule(
          this,
          operation.operationName,
          availabilityZoneId,
          operation.serverSideContributorInsightRuleDetails!,
          props.counter,
          props.nameSuffix,
        );
      this.instanceContributorsToFaultsInThisAZ =
        AvailabilityAndLatencyAlarmsAndRules.createServerSideInstanceFaultContributorsInThisAZRule(
          this,
          operation.operationName,
          availabilityZoneId,
          operation.serverSideContributorInsightRuleDetails!,
          props.counter,
          props.nameSuffix,
        );
      this.multipleInstancesProducingFaultsInThisAvailabilityZone =
        AvailabilityAndLatencyAlarmsAndRules.createServerSideZonalMoreThanOneInstanceProducingFaultsAlarm(
          this,
          operation.serverSideAvailabilityMetricDetails,
          availabilityZoneId,
          props.counter,
          props.operationAlarmsAndRulesProps.numberOfInstancesToConsiderAZImpacted ? props.operationAlarmsAndRulesProps.numberOfInstancesToConsiderAZImpacted : 2,
          this.instanceContributorsToFaultsInThisAZ,
          this.instancesHandlingRequestsInThisAZ,
          props.nameSuffix,
        );
      this.instanceContributorsToHighLatencyInThisAZ =
        AvailabilityAndLatencyAlarmsAndRules.createServerSideInstanceHighLatencyContributorsInThisAZRule(
          this,
          operation.serverSideLatencyMetricDetails,
          availabilityZoneId,
          operation.serverSideContributorInsightRuleDetails!,
          props.counter,
          props.nameSuffix,
        );
      this.multipleInstancesProducingHighLatencyInThisAZ =
        AvailabilityAndLatencyAlarmsAndRules.createServerSideZonalMoreThanOneInstanceProducingHighLatencyAlarm(
          this,
          operation.serverSideLatencyMetricDetails,
          availabilityZoneId,
          props.counter,
          props.operationAlarmsAndRulesProps.numberOfInstancesToConsiderAZImpacted ? props.operationAlarmsAndRulesProps.numberOfInstancesToConsiderAZImpacted : 2,
          this.instanceContributorsToHighLatencyInThisAZ,
          this.instancesHandlingRequestsInThisAZ,
          props.nameSuffix,
        );

      this.isolatedImpactAlarm = new CompositeAlarm(
        scope,
        `${operation.operationName.toLowerCase()}-zone-${azLetter}-isolated-impact-alarm`,
        {
          compositeAlarmName: `${availabilityZoneId}-${operation.operationName.toLowerCase()}-isolated-impact-alarm${props.nameSuffix}`,
          alarmRule: AlarmRule.anyOf(
            AlarmRule.allOf(
              this.availabilityZoneIsOutlierForFaults,
              this.availabilityAlarm,
              this.multipleInstancesProducingFaultsInThisAvailabilityZone,
            ),
            AlarmRule.allOf(
              this.availabilityZoneIsOutlierForLatency,
              this.latencyAlarm,
              this.multipleInstancesProducingHighLatencyInThisAZ,
            ),
          ),
          actionsEnabled: false,
        },
      );
    } 
    else {
      this.isolatedImpactAlarm = new CompositeAlarm(
        scope,
        `${operation.operationName}-zone-${azLetter}-isolated-impact-alarm`,
        {
          compositeAlarmName: `${availabilityZoneId}-${operation.operationName.toLowerCase()}-isolated-impact-alarm${props.nameSuffix}`,
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
