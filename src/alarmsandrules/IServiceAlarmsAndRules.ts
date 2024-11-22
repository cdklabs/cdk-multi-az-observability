// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { IAlarm } from "aws-cdk-lib/aws-cloudwatch";
import { IService } from "../services/IService";

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
  zonalAggregateIsolatedImpactAlarms: IAlarm[];

  /**
   * The zonal server-side isolated impact alarms. There is 1 alarm per AZ that triggers
   * on availability or atency impact to any critical operation in that AZ. These are useful
   * for deployment monitoring to not inadvertently fail when a canary can't contact an AZ
   * during a deployment.
   */
  zonalServerSideIsolatedImpactAlarms: IAlarm[];

  /**
   * An alarm for regional availability or latency impact of any critical operation as measured by the canary.
   */
  regionalAvailabilityOrLatencyCanaryAlarm?: IAlarm;

  /**
   * An alarm for regional availability impact of any critical operation as measured by the canary.
   */
  regionalAvailabilityCanaryAlarm?: IAlarm;

  /**
   * An alarm for regional availability or latency impact of any critical operation as measured by the server-side.
   */
  regionalAvailabilityOrLatencyServerSideAlarm: IAlarm;

  /**
   * An alarm for regional availability impact of any critical operation as measured by the server-side.
   */
  regionalAvailabilityServerSideAlarm: IAlarm;

  /**
   * An alarm for fault count exceeding a regional threshold for all critical operations.
   */
  regionalFaultCountServerSideAlarm: IAlarm;
}
