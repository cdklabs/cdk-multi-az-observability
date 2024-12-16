// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { CfnInsightRule, IAlarm } from 'aws-cdk-lib/aws-cloudwatch';
import { IBaseOperationZonalAlarmsAndRules } from './IBaseOperationZonalAlarmsAndRules';

/**
 * Server side opertaion zonal alarms and rules
 */
export interface IServerSideOperationZonalAlarmsAndRules
  extends IBaseOperationZonalAlarmsAndRules {
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
}
