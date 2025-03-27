// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { ILoadBalancerV2 } from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import { IFunction } from 'aws-cdk-lib/aws-lambda';
import { IAvailabilityZoneMapper } from '../../azmapper/IAvailabilityZoneMapper';
import { Operation } from '../../services/Operation';
import { OutlierDetectionAlgorithm } from '../../utilities/OutlierDetectionAlgorithm';
import { LatencyOutlierMetricAggregation } from '../../outlier-detection/LatencyOutlierMetricAggregation';

/**
 * The properties for the operation alarms and rules
 */
export interface OperationAlarmsAndRulesProps {
  /**
   * The operation the alarms and rules are for
   */
  readonly operation: Operation;

  /**
   * The load balancer associated with this operation.
   *
   * @default - If not provided, its ARN will not be included
   * in top level alarm descriptions that can be referenced by
   * automation to identify which load balancers should execute
   * a zonal shift.
   */
  readonly loadBalancer?: ILoadBalancerV2;

  /**
   * Used when the OutlierDetectionAlgorithm is set to STATIC, should be a
   * number between 0 and 1, non-inclusive, representing the percentage
   * of faults  that an AZ must have to be considered
   * an outlier.
   */
  readonly availabilityOutlierThreshold: number;

  /**
   * Used when the OutlierDetectionAlgorithm is set to STATIC, should be a
   * number between 0 and 1, non-inclusive, representing the percentage
   * of high latency responses that an AZ must have to be considered
   * an outlier.
   */
  readonly latencyOutlierThreshold: number;

  /**
   * The number of instances that need to be impacted to consider
   * an AZ to be impacted. This helps to ensure "more than one" instance
   * isn't making an AZ look bad.
   * 
   * @default 2
   */
  readonly numberOfInstancesToConsiderAZImpacted?: number;

  /**
   * The outlier detection algorithm used to determine if Availability Zones
   * or instances are outliers for latency or availability impact. Currently this property
   * is ignored and only STATIC is used.
   */
  readonly availabilityOutlierDetectionAlgorithm: OutlierDetectionAlgorithm;

  /**
   * The outlier detection algorithm used to determine if Availability Zones
   * or instances are outliers for latency or availability impact. Currently this property
   * is ignored and only STATIC is used.
   */
  readonly latencyOutlierDetectionAlgorithm: OutlierDetectionAlgorithm;

  /**
     * The metric for latency to use in outlier detection, which means whether
     * the algorithm uses a count of requests exceeding your latency threshold or
     * whether it uses the actual latency values at your latency alarm threshold
     * statistic.
     * 
     * @default LatencyOutlierMetricAggregation.COUNT
     */
    readonly latencyOutlierMetricAggregation?: LatencyOutlierMetricAggregation;

  /**
   * The AZ Mapper
   */
  readonly azMapper: IAvailabilityZoneMapper;

  /**
   * An optional Lambda function used to perform outlier detection
   * for chi-squared or z-score algorithms
   */
  readonly outlierDetectionFunction?: IFunction;
}
