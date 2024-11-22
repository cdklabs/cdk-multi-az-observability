// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { Duration } from "aws-cdk-lib";
import {
  MetricWidgetProps,
  CfnInsightRule,
  LegendPosition,
} from "aws-cdk-lib/aws-cloudwatch";

/**
 * Properties for creating a contributor insight dashboard widget
 */
export interface ContributorInsightWidgetProps extends MetricWidgetProps {
  /**
   * The account id for the widget
   */
  readonly accountId: string;

  /**
   * The number of top contributors to graph
   */
  readonly topContributors: number;

  /**
   * The insight rule for the widget
   */
  readonly insightRule: CfnInsightRule;

  /**
   * The legend position in the widget
   */
  readonly legendPosition: LegendPosition;

  /**
   * The order statistic used
   */
  readonly orderStatistic: string;

  /**
   * The period for the widget data points
   */
  readonly period: Duration;
}
