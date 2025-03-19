// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { Duration } from 'aws-cdk-lib';
import { IAvailabilityZoneMapper } from '../../azmapper/IAvailabilityZoneMapper';
import { IOperationAlarmsAndRules } from '../../alarmsandrules/IOperationAlarmsAndRules';

/**
 * Properties for creating an availability and latency dashboard for
 * a single operation
 */
export interface OperationAvailabilityAndLatencyDashboardProps {
  /**
   * The interval of the dashboard
   */
  readonly interval: Duration;

  /**
   * The per-operation alarms and rules for this dashboard
   */
  readonly operationAlarmsAndRules: IOperationAlarmsAndRules;

  /**
   * The AZ Mapper
   */
  readonly azMapper: IAvailabilityZoneMapper;
}
