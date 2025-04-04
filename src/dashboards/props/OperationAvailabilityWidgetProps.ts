// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { IAlarm, CfnInsightRule } from 'aws-cdk-lib/aws-cloudwatch';
import { IOperation } from '../../services/IOperation';
import { IOperationMetricDetails } from '../../services/IOperationMetricDetails';
import { IAvailabilityZoneMapper } from '../../azmapper/IAvailabilityZoneMapper';

/**
 * Props for creating operation dashboard availability and latency widgets
 */
export interface OperationAvailabilityWidgetProps {
  /**
   * The operation for this widget
   */
  readonly operation: IOperation;

  /**
   * The availability metric details
   */
  readonly availabilityMetricDetails: IOperationMetricDetails;

  /**
   * The Availability Zone names being used
   */
  readonly availabilityZones: string[];

  /**
   * An alarm per AZ for availability
   */
  readonly zonalEndpointAvailabilityAlarms: IAlarm[];

  /**
   * The regional endpoint availability alarm
   */
  readonly regionalEndpointAvailabilityAlarm: IAlarm;

  /**
   * Instance contributors to faults, only set for
   * server-side widgets
   */
  readonly instanceContributorsToFaults?: CfnInsightRule;

  /**
   * Is this widget for the canary metrics
   */
  readonly isCanary: boolean;

  /**
   * The AZ Mapper
   */
  readonly azMapper: IAvailabilityZoneMapper;
}
