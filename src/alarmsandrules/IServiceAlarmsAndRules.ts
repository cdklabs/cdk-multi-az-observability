// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { IAlarm } from 'aws-cdk-lib/aws-cloudwatch';
import { IService } from '../services/IService';

/**
 * Service level alarms and rules using critical operations
 */
export interface IServiceAlarmsAndRules {
  /**
   * The service these alarms and rules are for
   */
  service: IService;

  /**
   * The zonal aggregate isolated impact alarms. There is 1 alarm per AZ that
   * triggers for availability or latency impact to any critical operation in that AZ
   * that indicates it has isolated impact as measured by canaries or server-side.
   */
  zonalAggregateIsolatedImpactAlarms: {[key: string]: IAlarm};

  /**
   * The zonal server-side isolated impact alarms. There is 1 alarm per AZ that triggers
   * on availability or latency impact to any critical operation in that AZ. These are useful
   * for deployment monitoring to not inadvertently fail when a canary can't contact an AZ
   * during a deployment.
   */
  zonalServerSideIsolatedImpactAlarms: {[key: string]: IAlarm};

  /**
   * An alarm indicating the canary has discovered an availability or latency impact on a critical
   * operation while testing the regional endpoint.
   */
  regionalCanaryAlarm?: IAlarm;

  /**
   * An alarm indicating there is availability or latency impact on a critical operation
   * that is not scoped to a single availability zone as measured by the server-side and/or canary (if present)
   */
  regionalImpactAlarm: IAlarm;

  /**
   * An alarm indicating there is availability or latency impact on a critical operation
   * that is not scoped to a single availability zone as measured by the server-side
   */
  regionalServerSideImpactAlarm: IAlarm;

  /**
   * This is the top level alarm you should tie notifications/paging/alerting to. It triggers
   * on any impact to a critical operation either zonally scoped or regionally scoped.
   */
  serviceImpactAlarm: IAlarm;
}
