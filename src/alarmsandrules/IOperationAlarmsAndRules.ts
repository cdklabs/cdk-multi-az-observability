// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { IAlarm } from 'aws-cdk-lib/aws-cloudwatch';
import { ICanaryOperationRegionalAlarmsAndRules } from './ICanaryOperationRegionalAlarmsAndRules';
import { ICanaryOperationZonalAlarmsAndRules } from './ICanaryOperationZonalAlarmsAndRules';
import { IServerSideOperationRegionalAlarmsAndRules } from './IServerSideOperationRegionalAlarmsAndRules';
import { IServerSideOperationZonalAlarmsAndRules } from './IServerSideOperationZonalAlarmsAndRules';
import { IOperation } from '../services/IOperation';

/**
 * Creates alarms and rules for an operation for both regional and zonal metrics
 */
export interface IOperationAlarmsAndRules {
  /**
   * The operation the alarms and rules are created for
   */
  readonly operation: IOperation;

  /**
   * An alarm indicating availability or latency impact has been detected by the server-side 
   * and/or canary (if present) and the impact is regionally scoped, not zonal
   */
  readonly regionalImpactAlarm: IAlarm;

  /**
   * An alarm indicating availability or latency impact has been detected by the server-side
   * and the impact is regionally scoped, not zonal
   */
  readonly serverSideRegionalImpactAlarm: IAlarm;

  /**
   * An alarm indicating availability or latency impact has been detected by the canary
   * and the impact is regionally scoped, not zonal
   */
  readonly canaryRegionalImpactAlarm?: IAlarm;

  /**
   * The server side regional alarms and rules
   */
  readonly serverSideRegionalAlarmsAndRules: IServerSideOperationRegionalAlarmsAndRules;

  /**
   * The canary regional alarms and rules
   */
  readonly canaryRegionalAlarmsAndRules?: ICanaryOperationRegionalAlarmsAndRules;

  /**
   * The aggregate, server-side and canary combined, zonal alarm indexed by Availability Zone name.
   */
  readonly aggregateZonalAlarms: {[key: string]: IAlarm};

  /**
   * The server side zonal alarms and rules, indexed by Availability Zone name.
   */
  readonly serverSideZonalAlarmsAndRules: {[key: string]: IServerSideOperationZonalAlarmsAndRules};

  /**
   * The canary zonal alarms and rules, indexed by Availability Zone name.
   * 
   * @default - This is an empty dictionary if canary metric details are not provided
   */
  readonly canaryZonalAlarmsAndRules?: {[key: string]: ICanaryOperationZonalAlarmsAndRules};
}
