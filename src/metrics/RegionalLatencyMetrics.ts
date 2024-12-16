// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { Fn } from 'aws-cdk-lib';
import { IMetric, MathExpression } from 'aws-cdk-lib/aws-cloudwatch';
import { AvailabilityAndLatencyMetrics } from './AvailabilityAndLatencyMetrics';
import { LatencyMetricProps } from './props/LatencyMetricProps';
import { RegionalLatencyMetricProps } from './props/RegionalLatencyMetricProps';
import { ServiceLatencyMetricProps } from './props/ServiceLatencyMericProps';

export class RegionalLatencyMetrics {
  /**
   * Creates a metrics for regional latency, one metric per metric name for the
   * specified type of latency metric. You will need to perform some aggregation
   * of these metrics if there is more than 1 metric name that correponds to
   * SuccessLatency or FaultLatency, like doing an average.
   * @param props
   * @returns
   */
  static createRegionalLatencyMetrics(
    props: RegionalLatencyMetricProps,
  ): IMetric[] {
    return AvailabilityAndLatencyMetrics.createLatencyMetrics(
      props,
      props.metricDetails.metricDimensions.regionalDimensions(
        Fn.ref('AWS::Region'),
      ),
    );
  }

  /**
   * Creates a regional average latency metric, averages the values from all of the
   * metric names that represent either SuccessLatency or FaultLatency
   * @param props
   * @returns
   */
  static createRegionalAverageLatencyMetric(
    props: RegionalLatencyMetricProps,
  ): IMetric {
    return AvailabilityAndLatencyMetrics.createAverageLatencyMetric(
      props,
      props.metricDetails.metricDimensions.regionalDimensions(
        Fn.ref('AWS::Region'),
      ),
    );
  }

  /**
   * Creates a count of high latency metrics for either SuccessLatency or FaultLatency
   * @param props
   * @returns
   */
  static createRegionalLatencyCountMetric(
    props: RegionalLatencyMetricProps,
  ): IMetric {
    return AvailabilityAndLatencyMetrics.createLatencyCountMetric(
      props,
      props.metricDetails.metricDimensions.regionalDimensions(
        Fn.ref('AWS::Region'),
      ),
    );
  }

  /**
   * Creates a count of high latency responses for all critical operations
   * @param props
   * @returns
   */
  static createRegionalServiceLatencyCountMetrics(
    props: ServiceLatencyMetricProps,
  ): IMetric[] {
    let usingMetrics: { [key: string]: IMetric } = {};
    let operationMetrics: IMetric[] = [];
    let keyPrefix: string = AvailabilityAndLatencyMetrics.nextChar('');

    props.latencyMetricProps.forEach(
      (prop: LatencyMetricProps, index: number) => {
        let operationRegionalMetric: IMetric =
          this.createRegionalLatencyCountMetric(prop);

        operationMetrics.push(operationRegionalMetric);
        usingMetrics[`${keyPrefix}${index}`] = operationRegionalMetric;
        keyPrefix = AvailabilityAndLatencyMetrics.nextChar(keyPrefix);
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
