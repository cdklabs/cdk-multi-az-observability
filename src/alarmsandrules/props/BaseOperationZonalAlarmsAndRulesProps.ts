// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { IFunction } from 'aws-cdk-lib/aws-lambda';
import { IAvailabilityZoneMapper } from '../../azmapper/IAvailabilityZoneMapper';
import { IContributorInsightRuleDetails } from '../../services/IContributorInsightRuleDetails';
import { IOperationMetricDetails } from '../../services/IOperationMetricDetails';
import { Operation } from '../../services/Operation';
import { OutlierDetectionAlgorithm } from '../../utilities/OutlierDetectionAlgorithm';

/**
 * The base properties for an operation zonal alarms and rules configuration
 */
export interface BaseOperationZonalAlarmsAndRulesProps {
  /**
   * The operation for these alarms and rules
   */
  readonly operation: Operation;

  /**
   * The availability metric details to create alarms and rules from
   */
  readonly availabilityMetricDetails: IOperationMetricDetails;

  /**
   * The latency metric details to create alarms and rules from
   */
  readonly latencyMetricDetails: IOperationMetricDetails;

  /**
   * The Availability Zone Id the alarms and rules are being created for
   */
  readonly availabilityZoneId: string;

  /**
   * A counter used to name the CDK constructs uniquely
   */
  readonly counter: number;

  /**
   * Used when the OutlierDetectionAlgorithm is set to STATIC, should be a
   * number between 0 and 1, non-inclusive, representing the percentage
   * or faults or high latency responses that an AZ must have to be considered
   * an outlier.
   */
  readonly outlierThreshold: number;

  /**
   * (Optional) Details for creating contributor insight rules, which help
   * make the server-side alarms for detecting single AZ failures more accurate
   */
  readonly contributorInsightRuleDetails?: IContributorInsightRuleDetails;

  /**
   * The outlier detection algorithm used to determine if Availability Zones
   * or instances are outliers for latency or availability impact. Currently this property
   * is ignored and only STATIC is used.
   */
  readonly outlierDetectionAlgorithm: OutlierDetectionAlgorithm;

  /**
   * (Optional) A suffix to apply to alarm and rules names, like "-server" for server
   * side metrics and alarms
   */
  readonly nameSuffix?: string;

  /**
   * The AZ mapper
   */
  readonly azMapper: IAvailabilityZoneMapper;

  /**
   * A function that is used to perform outlier detection
   */
  readonly outlierDetectionFunction?: IFunction;
}
