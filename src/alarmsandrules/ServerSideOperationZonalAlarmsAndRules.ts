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

/**
 * The server side alarms and rules for an operation in an Availability Zone
 */
export class ServerSideOperationZonalAlarmsAndRules
  extends BaseOperationZonalAlarmsAndRules
  implements IServerSideOperationZonalAlarmsAndRules
{
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

    let azLetter: string = props.availabilityZone.substring(
      props.availabilityZone.length - 1,
    );
    let availabilityZoneId: string =
      props.azMapper.availabilityZoneIdFromAvailabilityZoneLetter(azLetter);

    // We want to know three things:
    // 1. There is impact in one AZ from either the server or canary perspective
    //   This is being done by the base class
    // 2. The impact in that AZ is an outlier
    //   This is being done here
    // 3. The impact is coming from more than 1 instance
    //   This is being done here

    if (props.availabilityOutlierDetectionAlgorithm == OutlierDetectionAlgorithm.STATIC) {
      this.availabilityZoneIsOutlierForFaults =
        AvailabilityAndLatencyAlarmsAndRules.createZonalFaultRateStaticOutlierAlarm(
          this,
          props.availabilityMetricDetails,
          props.availabilityZone,
          availabilityZoneId,
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
        AvailabilityAndLatencyAlarmsAndRules.createZonalHighLatencyStaticOutlierAlarm(
          this,
          props.latencyMetricDetails,
          props.availabilityZone,
          availabilityZoneId,
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

    if (
      props.contributorInsightRuleDetails !== undefined &&
      props.contributorInsightRuleDetails != null
    ) {
      this.instancesHandlingRequestsInThisAZ =
        AvailabilityAndLatencyAlarmsAndRules.createServerSideInstancesHandlingRequestsInThisAZRule(
          this,
          props.availabilityMetricDetails.operationName,
          availabilityZoneId,
          props.contributorInsightRuleDetails,
          props.counter,
          props.nameSuffix,
        );
      this.instanceContributorsToFaultsInThisAZ =
        AvailabilityAndLatencyAlarmsAndRules.createServerSideInstanceFaultContributorsInThisAZRule(
          this,
          props.availabilityMetricDetails.operationName,
          availabilityZoneId,
          props.contributorInsightRuleDetails,
          props.counter,
          props.nameSuffix,
        );
      this.multipleInstancesProducingFaultsInThisAvailabilityZone =
        AvailabilityAndLatencyAlarmsAndRules.createServerSideZonalMoreThanOneInstanceProducingFaultsAlarm(
          this,
          props.availabilityMetricDetails,
          availabilityZoneId,
          props.counter,
          props.numberOfInstancesToConsiderAZImpacted ? props.numberOfInstancesToConsiderAZImpacted : 2,
          this.instanceContributorsToFaultsInThisAZ,
          this.instancesHandlingRequestsInThisAZ,
          props.nameSuffix,
        );
      this.instanceContributorsToHighLatencyInThisAZ =
        AvailabilityAndLatencyAlarmsAndRules.createServerSideInstanceHighLatencyContributorsInThisAZRule(
          this,
          props.latencyMetricDetails,
          availabilityZoneId,
          props.contributorInsightRuleDetails,
          props.counter,
          props.nameSuffix,
        );
      this.multipleInstancesProducingHighLatencyInThisAZ =
        AvailabilityAndLatencyAlarmsAndRules.createServerSideZonalMoreThanOneInstanceProducingHighLatencyAlarm(
          this,
          props.latencyMetricDetails,
          availabilityZoneId,
          props.counter,
          props.numberOfInstancesToConsiderAZImpacted ? props.numberOfInstancesToConsiderAZImpacted : 2,
          this.instanceContributorsToHighLatencyInThisAZ,
          this.instancesHandlingRequestsInThisAZ,
          props.nameSuffix,
        );

      this.isolatedImpactAlarm = new CompositeAlarm(
        scope,
        `${props.operation.operationName}-zone-${azLetter}-isolated-impact-alarm`,
        {
          compositeAlarmName: `${availabilityZoneId}-${props.operation.operationName}-isolated-impact-alarm${props.nameSuffix}`,
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
        `${props.operation.operationName}-zone-${azLetter}-isolated-impact-alarm`,
        {
          compositeAlarmName: `${availabilityZoneId}-${props.operation.operationName}-isolated-impact-alarm${props.nameSuffix}`,
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
