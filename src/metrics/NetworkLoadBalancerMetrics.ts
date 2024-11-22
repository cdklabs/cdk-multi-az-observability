// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { Duration } from 'aws-cdk-lib';
import { IMetric, Metric, Unit } from 'aws-cdk-lib/aws-cloudwatch';

export class NetworkLoadBalancerMetrics {
  /**
   * Creates a regional processed bytes metric for the specified load balancer
   * @param loadBalancerFullName
   * @param period
   * @returns
   */
  static createRegionalNetworkLoadBalancerProcessedBytesMetric(
    loadBalancerFullName: string,
    period: Duration,
  ): IMetric {
    return new Metric({
      metricName: 'ProcessedBytes',
      namespace: 'AWS/NetworkELB',
      unit: Unit.COUNT,
      period: period,
      statistic: 'Sum',
      dimensionsMap: {
        LoadBalancer: loadBalancerFullName,
      },
      label: 'ProcessedBytes',
    });
  }

  /**
   * Creates a zonal processed bytes metric for the specified load balancer
   * @param loadBalancerFullName
   * @param availabilityZoneName
   * @param period
   * @returns
   */
  static createZonalNetworkLoadBalancerProcessedBytesMetric(
    loadBalancerFullName: string,
    availabilityZoneName: string,
    period: Duration,
  ): IMetric {
    return new Metric({
      metricName: 'ProcessedBytes',
      namespace: 'AWS/NetworkELB',
      unit: Unit.COUNT,
      period: period,
      statistic: 'Sum',
      dimensionsMap: {
        LoadBalancer: loadBalancerFullName,
        AvailabilityZone: availabilityZoneName,
      },
      label: 'ProcessedBytes',
    });
  }
}
