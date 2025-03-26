// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { ICanaryMetrics } from './ICanaryMetrics';
import { IContributorInsightRuleDetails } from './IContributorInsightRuleDetails';
import { IService } from './IService';
import { AddCanaryTestProps } from '../canaries/props/AddCanaryTestProps';
import { IOperationAvailabilityMetricDetails } from './IOperationAvailabilityMetricDetails';
import { IOperationLatencyMetricDetails } from './IOperationLatencyMetricDetails';
import { ICanaryTestAvailabilityMetricsOverride } from './ICanaryTestAvailabilityMetricsOverride';
import { ICanaryTestLatencyMetricsOverride } from './ICanaryTestLatencyMetricsOverride';

/**
 * Represents an operation in a service
 */
export interface IOperation {
  /**
   * The service the operation is associated with
   */
  readonly service: IService;

  /**
   * The name of the operation
   */
  readonly operationName: string;

  /**
   *  The HTTP path for the operation for canaries
   *  to run against, something like "/products/list"
   */
  readonly path: string;

  /**
   * The server side availability metric details
   */
  readonly serverSideAvailabilityMetricDetails: IOperationAvailabilityMetricDetails;

  /**
   * The server side latency metric details
   */
  readonly serverSideLatencyMetricDetails: IOperationLatencyMetricDetails;

  /**
   * Optional metric details if the service has an existing canary.
   */
  readonly canaryMetricDetails?: ICanaryMetrics;

  /**
   * The override values for automatically created canary tests so you can
   * use values other than the service defaults to define the thresholds for
   * availability.
   */
  readonly canaryTestAvailabilityMetricsOverride?: ICanaryTestAvailabilityMetricsOverride;

  /**
   * The override values for automatically created canary tests so you can
   * use values other than the service defaults to define the thresholds for
   * latency.
   */
  readonly canaryTestLatencyMetricsOverride?: ICanaryTestLatencyMetricsOverride;

  /**
   * The server side details for contributor insights rules
   */
  readonly serverSideContributorInsightRuleDetails?: IContributorInsightRuleDetails;

  /**
   * Indicates this is a critical operation for the service
   * and will be included in service level metrics and
   * dashboards
   */
  readonly critical: boolean;

  /**
   * The http methods supported by the operation
   */
  readonly httpMethods: string[];

  /**
   * If they have been added, the properties for
   * creating new canary tests on this operation
   */
  readonly canaryTestProps?: AddCanaryTestProps;

  /**
   * Set to true if you have defined CanaryTestProps for your
   * service, which applies to all operations, but you want to
   * opt out of creating the canary test for this operation.
   *
   * @default - The operation is not opted out
   */
  readonly optOutOfServiceCreatedCanary?: boolean;
}
