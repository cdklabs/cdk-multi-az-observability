// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { Dashboard, IAlarm } from 'aws-cdk-lib/aws-cloudwatch';
import { ILogGroup } from 'aws-cdk-lib/aws-logs';
import { IConstruct } from 'constructs';
import { IServiceAlarmsAndRules } from '../alarmsandrules/IServiceAlarmsAndRules';

/**
 * Observability for an instrumented service
 */
export interface IInstrumentedServiceMultiAZObservability extends IConstruct {
  /**
   * The alarms and rules for the overall service
   */
  readonly serviceAlarms: IServiceAlarmsAndRules;

  /**
   * Index into the dictionary by operation name, then by Availability Zone Id
   * to get the alarms that indicate an AZ shows isolated impact from availability
   * or latency as seen by either the server-side or canary. These are the alarms
   * you would want to use to trigger automation to evacuate an AZ.
   */
  readonly perOperationZonalImpactAlarms: {
    [key: string]: { [key: string]: IAlarm };
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
