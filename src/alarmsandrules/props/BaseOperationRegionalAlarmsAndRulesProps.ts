// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { IContributorInsightRuleDetails } from '../../services/IContributorInsightRuleDetails';
import { IOperationAvailabilityMetricDetails } from '../../services/IOperationAvailabilityMetricDetails';
import { IOperationLatencyMetricDetails } from '../../services/IOperationLatencyMetricDetails';

/**
 * The base props for an operation regional alarms and rules configuration
 */
export interface BaseOperationRegionalAlarmsAndRulesProps {
  /**
   * The metric details for availability metrics
   */
  readonly availabilityMetricDetails: IOperationAvailabilityMetricDetails;

  /**
   * The metric details for latency metrics
   */
  readonly latencyMetricDetails: IOperationLatencyMetricDetails;

  /**
   * (Optional) A suffix to be appended to alarm and rule names
   */
  readonly nameSuffix: string;

  /**
   * (Optional) Details for creating contributor insight rules, which help
   * make the server-side alarms for detecting single AZ failures more accurate
   */
  readonly contributorInsightRuleDetails?: IContributorInsightRuleDetails;
}
