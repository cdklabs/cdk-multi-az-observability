// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { Fn } from 'aws-cdk-lib';
import { IMetric, MathExpression } from 'aws-cdk-lib/aws-cloudwatch';
import { AvailabilityAndLatencyMetrics } from './AvailabilityAndLatencyMetrics';
import { LatencyMetricProps } from './props/LatencyMetricProps';
import { ServiceLatencyMetricProps } from './props/ServiceLatencyMericProps';
import { ZonalLatencyMetricProps } from './props/ZonalLatencyMetricProps';
import { MetricsHelper } from '../utilities/MetricsHelper';

export class ZonalLatencyMetrics {
  /**
   * Creates a zonal latency metric
   * @param props
   * @returns
   */
  static createZonalLatencyMetrics(props: ZonalLatencyMetricProps): IMetric[] {
    return AvailabilityAndLatencyMetrics.createLatencyMetrics(
      props,
      props.metricDetails.metricDimensions.zonalDimensions(
        props.availabilityZoneId,
        Fn.ref('AWS::Region'),
      ),
    );
  }

  /**
   * Creates an average zonal latency metric
   * @param props
   * @returns
   */
  static createZonalAverageLatencyMetric(
    props: ZonalLatencyMetricProps,
  ): IMetric {
    return AvailabilityAndLatencyMetrics.createAverageLatencyMetric(
      props,
      props.metricDetails.metricDimensions.zonalDimensions(
        props.availabilityZoneId,
        Fn.ref('AWS::Region'),
      ),
    );
  }

  /**
   * Creates a count of high latency metric
   * @param props
   * @returns
   */
  static createZonalCountLatencyMetric(
    props: ZonalLatencyMetricProps,
  ): IMetric {
    return AvailabilityAndLatencyMetrics.createLatencyCountMetric(
      props,
      props.metricDetails.metricDimensions.zonalDimensions(
        props.availabilityZoneId,
        Fn.ref('AWS::Region'),
      ),
    );
  }

  /**
   * Creates a count of high latency responses for all critical operations
   * @param props
   * @returns
   */
  static createZonalServiceLatencyMetrics(
    props: ServiceLatencyMetricProps,
  ): IMetric[] {
    let usingMetrics: { [key: string]: IMetric } = {};
    let operationMetrics: IMetric[] = [];
    let keyPrefix: string = MetricsHelper.nextChar();

    props.latencyMetricProps.forEach(
      (prop: LatencyMetricProps, index: number) => {
        let operationZonalMetric: IMetric = this.createZonalCountLatencyMetric(
          prop as ZonalLatencyMetricProps,
        );

        operationMetrics.push(operationZonalMetric);
        usingMetrics[`${keyPrefix}${index}`] = operationZonalMetric;
        keyPrefix = MetricsHelper.nextChar(keyPrefix);
      },
    );

    if (Object.keys(usingMetrics).length == 1) {
      operationMetrics.push(Object.values(usingMetrics)[0]);
    } else {
      let math: IMetric = new MathExpression({
        usingMetrics: usingMetrics,
        period: props.period,
        label: props.label,
        expression: Object.keys(usingMetrics).join('+'),
      });

      operationMetrics.splice(0, 0, math);
    }

    return operationMetrics;
  }
}
