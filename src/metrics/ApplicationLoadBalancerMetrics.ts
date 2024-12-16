// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { Duration } from 'aws-cdk-lib';
import {
  IMetric,
  MathExpression,
  Metric,
  Unit,
} from 'aws-cdk-lib/aws-cloudwatch';

export class ApplicationLoadBalancerMetrics {
  /**
   * Creates a regional fault count metric using 5xx target and load balancer
   * metrics against total requests for the specified load balancer
   * @param period
   * @param loadBalancerFullName
   * @returns
   */
  static createRegionalApplicationLoadBalancerFaultRateMetric(
    loadBalancerFullName: string,
    period: Duration,
  ): IMetric {
    return new MathExpression({
      expression: '((m1 + m2) / m3) * 100',
      label: 'Fault Rate',
      period: period,
      usingMetrics: {
        m1: new Metric({
          metricName: 'HTTPCode_Target_5XX_Count',
          namespace: 'AWS/ApplicationELB',
          unit: Unit.COUNT,
          period: period,
          statistic: 'Sum',
          dimensionsMap: {
            LoadBalancer: loadBalancerFullName,
          },
          label: '5xxTarget',
        }),
        m2: new Metric({
          metricName: 'HTTPCode_ELB_5XX_Count',
          namespace: 'AWS/ApplicationELB',
          unit: Unit.COUNT,
          period: period,
          statistic: 'Sum',
          dimensionsMap: {
            LoadBalancer: loadBalancerFullName,
          },
          label: '5xxELB',
        }),
        m3: new Metric({
          metricName: 'RequestCount',
          namespace: 'AWS/ApplicationELB',
          unit: Unit.COUNT,
          period: period,
          statistic: 'Sum',
          dimensionsMap: {
            LoadBalancer: loadBalancerFullName,
          },
          label: 'Requests',
        }),
      },
    });
  }

  /**
   * Creates a zonal fault count metric using 5xx target and load balancer
   * metrics against total requests for the specified load balancer
   * @param loadBalancerFullName
   * @param availabilityZoneName
   * @param period
   * @returns
   */
  static createZonalApplicationLoadBalancerFaultRateMetric(
    loadBalancerFullName: string,
    availabilityZoneName: string,
    period: Duration,
  ): IMetric {
    return new MathExpression({
      expression: '((m1 + m2) / m3) * 100',
      label: 'Fault Rate',
      period: period,
      usingMetrics: {
        m1: new Metric({
          metricName: 'HTTPCode_Target_5XX_Count',
          namespace: 'AWS/ApplicationELB',
          unit: Unit.COUNT,
          period: period,
          statistic: 'Sum',
          dimensionsMap: {
            LoadBalancer: loadBalancerFullName,
            AvailabilityZone: availabilityZoneName,
          },
          label: '5xxTarget',
        }),
        m2: new Metric({
          metricName: 'HTTPCode_ELB_5XX_Count',
          namespace: 'AWS/ApplicationELB',
          unit: Unit.COUNT,
          period: period,
          statistic: 'Sum',
          dimensionsMap: {
            LoadBalancer: loadBalancerFullName,
            AvailabilityZone: availabilityZoneName,
          },
          label: '5xxELB',
        }),
        m3: new Metric({
          metricName: 'RequestCount',
          namespace: 'AWS/ApplicationELB',
          unit: Unit.COUNT,
          period: period,
          statistic: 'Sum',
          dimensionsMap: {
            LoadBalancer: loadBalancerFullName,
            AvailabilityZone: availabilityZoneName,
          },
          label: 'Requests',
        }),
      },
    });
  }

  /**
   * Creates a regional processed bytes metric for the specified load balancer
   * @param loadBalancerFullName
   * @param period
   * @returns
   */
  static createRegionalApplicationLoadBalancerProcessedBytesMetric(
    loadBalancerFullName: string,
    period: Duration,
  ): IMetric {
    return new Metric({
      metricName: 'ProcessedBytes',
      namespace: 'AWS/ApplicationELB',
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
   * @returns IMetric
   */
  static createZonalApplicationLoadBalancerProcessedBytesMetric(
    loadBalancerFullName: string,
    availabilityZoneName: string,
    period: Duration,
  ): IMetric {
    return new Metric({
      metricName: 'ProcessedBytes',
      namespace: 'AWS/ApplicationELB',
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
