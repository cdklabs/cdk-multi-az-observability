// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { Aws, Duration } from 'aws-cdk-lib';
import { IMetric, MathExpression } from 'aws-cdk-lib/aws-cloudwatch';
import { AvailabilityAndLatencyMetrics } from './AvailabilityAndLatencyMetrics';
import { ZonalAvailabilityMetricProps } from './props/ZonalAvailabilityMetricProps';
import { AvailabilityMetricType } from '../utilities/AvailabilityMetricType';

export class ZonalAvailabilityMetrics {
  /**
   * Creates a zonal service level availability metrics, one metric for
   * each operation at the zonal level and the service.
   * @param props
   * @returns The metric at index 0 is the metric math expression for the whole service. The following metrics
   * are the metrics for each operation included in the request availability metric props.
   */
  static createZonalServiceAvailabilityMetrics(
    metrics: ZonalAvailabilityMetricProps[],
    period: Duration,
    label: string
  ): IMetric[] {
    let usingMetrics: { [key: string]: IMetric } = {};
    let operationMetrics: IMetric[] = [];

    metrics.forEach((prop: ZonalAvailabilityMetricProps, index: number) => {

      let zonalOperationAvailabilityMetric: IMetric =
        AvailabilityAndLatencyMetrics.createZonalAvailabilityMetric(
          prop,
          prop.metricDetails.metricDimensions.zonalDimensions(
            prop.availabilityZoneId,
            Aws.REGION
          )
        );

      operationMetrics.push(zonalOperationAvailabilityMetric);
      usingMetrics[`${prop.availabilityZone.substring(prop.availabilityZone.length - 1)}_${prop.metricDetails.operationName}_${ prop.metricType.toString().toLowerCase() }_${index}`] =
        zonalOperationAvailabilityMetric;
    });

    let expression: string = '';

    switch (metrics[0].metricType) {
      case AvailabilityMetricType.SUCCESS_RATE:
        expression = `(${Object.keys(usingMetrics).join('+')}) / ${metrics.length}`;
        break;
      case AvailabilityMetricType.REQUEST_COUNT:
        expression = `${Object.keys(usingMetrics).join('+')}`;
        break;
      case AvailabilityMetricType.FAULT_COUNT:
        expression = `${Object.keys(usingMetrics).join('+')}`;
        break;
      case AvailabilityMetricType.FAULT_RATE:
        expression = `(${Object.keys(usingMetrics).join('+')}) / ${metrics.length}`;
        break;
      case AvailabilityMetricType.SUCCESS_COUNT:
        expression = `${Object.keys(usingMetrics).join('+')}`;
        break;
    }
    let math: IMetric = new MathExpression({
      usingMetrics: usingMetrics,
      period: period,
      label: label,
      expression: expression,
    });

    operationMetrics.splice(0, 0, math);

    return operationMetrics;
  }
}
