// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { Dashboard, IAlarm } from 'aws-cdk-lib/aws-cloudwatch';
import { ILogGroup } from 'aws-cdk-lib/aws-logs';
import { IConstruct } from 'constructs';
import { IServiceAlarmsAndRules } from '../alarmsandrules/IServiceAlarmsAndRules';
import { IOperationAlarmsAndRules } from '../alarmsandrules/IOperationAlarmsAndRules';

/**
 * Observability for an instrumented service
 */
export interface IInstrumentedServiceMultiAZObservability extends IConstruct {
  /**
   * The alarms and rules for the overall service
   */
  readonly serviceAlarms: IServiceAlarmsAndRules;

  /**
   * Index into the dictionary by operation name, then by Availability Zone Name
   * to get the alarms that indicate an AZ shows isolated impact from availability
   * or latency as seen by either the server-side or canary. This is a shortcut to
   * access the same alarms from the perOperationAlarmsAndRules property.
   */
  readonly perOperationZonalImpactAlarms: {
    [key: string]: { [key: string]: IAlarm };
  };

  /**
   * Key represents the operation name and the value is the set
   * of zonal alarms and rules for that operation. You can get the 
   * granular alarms that compose the higher level aggregate alarms
   * for each operation.
   */
  readonly perOperationAlarmsAndRules: {
    [key: string]: IOperationAlarmsAndRules;
  };

  /**
   * The dashboards for each operation
   */
  readonly operationDashboards?: Dashboard[];

  /**
   * The service level dashboard
   */
  readonly serviceDashboard?: Dashboard;

  /**
   * If the service is configured to have canary tests created, this will
   * be the log group where the canary's logs are stored.
   *
   * @default - No log group is created if the canary is not requested.
   */
  readonly canaryLogGroup?: ILogGroup;
}
