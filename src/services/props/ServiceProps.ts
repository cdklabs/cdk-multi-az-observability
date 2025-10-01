// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { Duration } from 'aws-cdk-lib';
import { ILoadBalancerV2, ITargetGroup } from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import { AddCanaryTestProps } from '../../canaries/props/AddCanaryTestProps';
import { IContributorInsightRuleDetails } from '../IContributorInsightRuleDetails';
import { IServiceAvailabilityMetricDetails } from '../IServiceAvailabilityMetricDetails';
import { IServiceLatencyMetricDetails } from '../IServiceLatencyMetricDetails';
import { MinimumUnhealthyTargets } from '../../utilities/MinimumUnhealthyTargets';

/**
 * Properties to initialize a service
 */
export interface ServiceProps {
  /**
   * The name of your service
   */
  readonly serviceName: string;

  /**
   * The base endpoint for this service, like "https://www.example.com". Operation
   * paths will be appended to this endpoint for canary testing the service.
   */
  readonly baseUrl: string;

  /**
   * The fault count threshold that indicates the service is unhealthy. This is an absolute value of faults
   * being produced by all critical operations in aggregate.
   */
  readonly faultCountThreshold: number;

  /**
   * A list of the Availability Zone names used by this application
   */
  readonly availabilityZoneNames: string[];

  /**
   * The period for which metrics for the service should be aggregated
   */
  readonly period: Duration;

  /**
   * The load balancer this service sits behind
   *
   * @default - Load balancer metrics won't be shown on dashboards
   * and its ARN won't be included in top level alarm descriptions
   * that automation can use to implement a zonal shift.
   */
  readonly loadBalancer?: ILoadBalancerV2;

  /**
   * The target groups registered with the load balancer
   * 
   * @default Anomalous and mitigated host metrics will not be included on dashboards
   */
  readonly targetGroups?: ITargetGroup[];

  /**
   * Define these settings if you want to automatically add canary
   * tests to your operations. Operations can individually opt out
   * of canary test creation if you define this setting.
   *
   * @default - Automatic canary tests will not be created for
   * operations in this service.
   */
  readonly canaryTestProps?: AddCanaryTestProps;

  /**
   * The default settings that are used for availability metrics
   * for all operations unless specifically overridden in an
   * operation definition.
   */
  readonly defaultAvailabilityMetricDetails: IServiceAvailabilityMetricDetails;

  /**
   * The default settings that are used for availability metrics
   * for all operations unless specifically overridden in an
   * operation definition.
   */
  readonly defaultLatencyMetricDetails: IServiceLatencyMetricDetails;

  /**
   * The default settings that are used for contributor insight
   * rules.
   *
   * @default - No defaults are provided and must be specified per operation
   * if the operation has logs that can be queried by contributor insights
   */
  readonly defaultContributorInsightRuleDetails?: IContributorInsightRuleDetails;

  /**
   * The minimum number of unhealthy targets for an AZ to be considered unhealthy
   * 
   * @default Count of 2
   */
  readonly minimumUnhealthyTargets?: MinimumUnhealthyTargets;
}
