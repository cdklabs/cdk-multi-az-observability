// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { Aws } from 'aws-cdk-lib';
import { IMetric, MathExpression } from 'aws-cdk-lib/aws-cloudwatch';
import { AvailabilityAndLatencyMetrics } from './AvailabilityAndLatencyMetrics';
import { RegionalAvailabilityMetricProps } from './props/RegionalAvailabilityMetricProps';
import { ServiceAvailabilityMetricProps } from './props/ServiceAvailabilityMetricProps';
import { AvailabilityMetricType } from '../utilities/AvailabilityMetricType';
import { AvailabilityMetricProps } from './props/AvailabilityMetricProps';

export class RegionalAvailabilityMetrics {
  /**
   * Creates a regional availability metric
   * @param props
   * @returns
   */
  static createRegionalAvailabilityMetric(
    props: RegionalAvailabilityMetricProps,
  ): IMetric {
    return AvailabilityAndLatencyMetrics.createAvailabilityMetric(
      props,
      props.metricDetails.metricDimensions.regionalDimensions(
        Aws.REGION,
      ),
    );
  }

  /**
   * Creates a regional service level availability metrics, one metric for
   * each operation at the regional level and the service.
   * @param props
   * @returns The metric at index 0 is the metric math expression for the whole service. The following metrics
   * are the metrics for each operation included in the request availability metric props.
   */
  static createRegionalServiceAvailabilityMetrics(
    props: ServiceAvailabilityMetricProps,
  ): IMetric[] {
    let usingMetrics: { [key: string]: IMetric } = {};
    let operationMetrics: IMetric[] = [];
 
    props.availabilityMetricProps.forEach((prop: AvailabilityMetricProps, index: number) => {
      let keyPrefix: string =
        (prop.keyPrefix === undefined || prop.keyPrefix == ''
          ? ''
          : prop.keyPrefix.toLowerCase() + '_') +
        prop.metricDetails.operationName.toLowerCase() +
        '_' +
        prop.metricType.toString().toLowerCase();

      let regionalOperationAvailabilityMetric: IMetric =
        this.createRegionalAvailabilityMetric(
          prop as RegionalAvailabilityMetricProps,
        );

      operationMetrics.push(regionalOperationAvailabilityMetric);
      usingMetrics[`${keyPrefix}${index}`] =
        regionalOperationAvailabilityMetric;
    });

    let expression: string = '';

    switch (props.availabilityMetricProps[0].metricType) {
      case AvailabilityMetricType.SUCCESS_RATE:
        expression = `(${Object.keys(usingMetrics).join('+')}) / ${props.availabilityMetricProps.length}`;
        break;
      case AvailabilityMetricType.REQUEST_COUNT:
        expression = `${Object.keys(usingMetrics).join('+')}`;
        break;
      case AvailabilityMetricType.FAULT_COUNT:
        expression = `${Object.keys(usingMetrics).join('+')}`;
        break;
      case AvailabilityMetricType.FAULT_RATE:
        expression = `(${Object.keys(usingMetrics).join('+')}) / ${props.availabilityMetricProps.length}`;
        break;
      case AvailabilityMetricType.SUCCESS_COUNT:
        expression = `${Object.keys(usingMetrics).join('+')}`;
        break;
    }

    let math: IMetric = new MathExpression({
      usingMetrics: usingMetrics,
      period: props.period,
      label: props.label,
      expression: expression,
    });

    operationMetrics.splice(0, 0, math);

    return operationMetrics;
  }
}