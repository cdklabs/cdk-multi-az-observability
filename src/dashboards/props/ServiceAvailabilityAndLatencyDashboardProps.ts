// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { Duration } from "aws-cdk-lib";
import { IAlarm } from "aws-cdk-lib/aws-cloudwatch";
import { IAvailabilityZoneMapper } from "../../azmapper/IAvailabilityZoneMapper";
import { IService } from "../../services/IService";

/**
 * Properties for creating a service level dashboard
 */
export interface ServiceAvailabilityAndLatencyDashboardProps {
  /**
   * The service for the dashboard
   */
  readonly service: IService;

  /**
   * The AZ isolated impact alarms, one for each AZ
   */
  readonly zonalAggregateAlarms: IAlarm[];

  /**
   * The aggregate regional impact alarm, typically a fault
   * count across all critical operations
   */
  readonly aggregateRegionalAlarm: IAlarm;

  /**
   * The interval for the dashboard
   */
  readonly interval: Duration;

  /**
   * The AZ Mapper
   */
  readonly azMapper: IAvailabilityZoneMapper;
}
