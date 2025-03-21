// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { Duration } from 'aws-cdk-lib';
import { Dashboard } from 'aws-cdk-lib/aws-cloudwatch';
import { IAvailabilityZoneMapper } from '../../azmapper/IAvailabilityZoneMapper';
import { IService } from '../../services/IService';
import { IServiceAlarmsAndRules } from '../../alarmsandrules/IServiceAlarmsAndRules';

/**
 * Properties for creating a service level dashboard
 */
export interface ServiceAvailabilityAndLatencyDashboardProps {
  /**
   * The service for the dashboard
   */
  readonly service: IService;

  /**
   * The service alarms and rules
   */
  readonly serviceAlarmsAndRules: IServiceAlarmsAndRules;

  /**
   * The interval for the dashboard
   */
  readonly interval: Duration;

  /**
   * The AZ Mapper
   */
  readonly azMapper: IAvailabilityZoneMapper;

  /**
   * The per operation dashboards
   */
  readonly operationsDashboard: Dashboard[];
}
