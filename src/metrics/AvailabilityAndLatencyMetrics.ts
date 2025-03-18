// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { IMetric, Metric, MathExpression } from 'aws-cdk-lib/aws-cloudwatch';
import { AvailabilityMetricProps } from './props/AvailabilityMetricProps';
import { LatencyMetricProps } from './props/LatencyMetricProps';
import { AvailabilityMetricType } from '../utilities/AvailabilityMetricType';
import { LatencyMetricType } from '../utilities/LatencyMetricType';
import { ZonalAvailabilityMetricProps } from './props/ZonalAvailabilityMetricProps';
import { ZonalLatencyMetricProps } from './props/ZonalLatencyMetricProps';

/**
 * Class for creating availability and latency metrics that can be used in alarms and graphs
 */
export class AvailabilityAndLatencyMetrics {

  /**
   * General purpose method to create availability metrics
   * @param props
   * @param dimensions
   * @returns
   */
  static createAvailabilityMetric(
    props: AvailabilityMetricProps,
    dimensions: { [key: string]: string },
  ): IMetric {
    let usingMetrics: { [key: string]: IMetric } = {};

    let successKeys: string[] = [];
    let faultKeys: string[] = [];

    if (
      props.metricDetails.successMetricNames !== undefined &&
      props.metricType != AvailabilityMetricType.FAULT_COUNT
    ) {
      props.metricDetails.successMetricNames.forEach((successMetric: string) => {
          let key: string = `${props.metricDetails.operationName.toLowerCase()}_${props.metricType.toString().toLowerCase()}_${successMetric.toLowerCase()}`;

          successKeys.push(key);

          usingMetrics[key] = new Metric({
            namespace: props.metricDetails.metricNamespace,
            metricName: successMetric,
            unit: props.metricDetails.unit,
            period: props.metricDetails.period,
            statistic: props.metricDetails.alarmStatistic,
            dimensionsMap: dimensions,
            label: successMetric,
          });
        },
      );
    }

    if (
      props.metricDetails.faultMetricNames !== undefined &&
      props.metricType != AvailabilityMetricType.SUCCESS_COUNT
    ) {
      props.metricDetails.faultMetricNames.forEach((faultMetric) => {
        let key: string = `${props.metricDetails.operationName.toLowerCase()}_${props.metricType.toString().toLowerCase()}_${faultMetric.toLowerCase()}`;

        faultKeys.push(key);

        usingMetrics[key] = new Metric({
          namespace: props.metricDetails.metricNamespace,
          metricName: faultMetric,
          unit: props.metricDetails.unit,
          period: props.metricDetails.period,
          statistic: props.metricDetails.alarmStatistic,
          dimensionsMap: dimensions,
          label: faultMetric,
        });
      });
    }

    let expression: string = '';

    switch (props.metricType) {
      case AvailabilityMetricType.SUCCESS_RATE:
        expression = `((${successKeys.join('+')}) / (${successKeys.join('+')}+${faultKeys.join('+')})) * 100`;
        break;
      case AvailabilityMetricType.REQUEST_COUNT:
        expression = `${successKeys.join('+')}+${faultKeys.join('+')}`;
        break;
      case AvailabilityMetricType.FAULT_COUNT:
        expression = `(${faultKeys.join('+')})`;
        break;
      case AvailabilityMetricType.FAULT_RATE:
        expression = `((${faultKeys.join('+')}) / (${successKeys.join('+')}+${faultKeys.join('+')})) * 100`;
        break;
      case AvailabilityMetricType.SUCCESS_COUNT:
        expression = `(${successKeys.join('+')})`;
        break;
    }

    return new MathExpression({
      expression: expression,
      label: props.label,
      period: props.metricDetails.period,
      usingMetrics: usingMetrics,
      color: props.color
    });
  }

  /**
   *  Creates availability metrics for a specific AZ
   * @param props 
   * @param dimensions 
   * @returns 
   */
  static createZonalAvailabilityMetric(
    props: ZonalAvailabilityMetricProps,
    dimensions: { [key: string]: string },
  ): IMetric {
    let usingMetrics: { [key: string]: IMetric } = {};

    let successKeys: string[] = [];
    let faultKeys: string[] = [];

    if (
      props.metricDetails.successMetricNames !== undefined &&
      props.metricType != AvailabilityMetricType.FAULT_COUNT
    ) {
      props.metricDetails.successMetricNames.forEach((successMetric: string) => {
          let key: string = `${props.availabilityZone.substring(props.availabilityZone.length - 1)}_${props.metricDetails.operationName.toLowerCase()}_${props.metricType.toString().toLowerCase()}_${successMetric.toLowerCase()}`;

          successKeys.push(key);

          usingMetrics[key] = new Metric({
            namespace: props.metricDetails.metricNamespace,
            metricName: successMetric,
            unit: props.metricDetails.unit,
            period: props.metricDetails.period,
            statistic: props.metricDetails.alarmStatistic,
            dimensionsMap: dimensions,
            label: successMetric,
          });
        },
      );
    }

    if (
      props.metricDetails.faultMetricNames !== undefined &&
      props.metricType != AvailabilityMetricType.SUCCESS_COUNT
    ) {
      props.metricDetails.faultMetricNames.forEach((faultMetric) => {
        let key: string = `${props.availabilityZone.substring(props.availabilityZone.length - 1)}_${props.metricDetails.operationName.toLowerCase()}_${props.metricType.toString().toLowerCase()}_${faultMetric.toLowerCase()}`;

        faultKeys.push(key);

        usingMetrics[key] = new Metric({
          namespace: props.metricDetails.metricNamespace,
          metricName: faultMetric,
          unit: props.metricDetails.unit,
          period: props.metricDetails.period,
          statistic: props.metricDetails.alarmStatistic,
          dimensionsMap: dimensions,
          label: faultMetric,
        });
      });
    }

    let expression: string = '';

    switch (props.metricType) {
      case AvailabilityMetricType.SUCCESS_RATE:
        expression = `((${successKeys.join('+')}) / (${successKeys.join('+')}+${faultKeys.join('+')})) * 100`;
        break;
      case AvailabilityMetricType.REQUEST_COUNT:
        expression = `${successKeys.join('+')}+${faultKeys.join('+')}`;
        break;
      case AvailabilityMetricType.FAULT_COUNT:
        expression = `(${faultKeys.join('+')})`;
        break;
      case AvailabilityMetricType.FAULT_RATE:
        expression = `((${faultKeys.join('+')}) / (${successKeys.join('+')}+${faultKeys.join('+')})) * 100`;
        break;
      case AvailabilityMetricType.SUCCESS_COUNT:
        expression = `(${successKeys.join('+')})`;
        break;
    }

    return new MathExpression({
      expression: expression,
      label: props.label,
      period: props.metricDetails.period,
      usingMetrics: usingMetrics,
      color: props.color
    });
  }

  /**
   * General purpose method to create latency metrics, the reason this creates an array of metrics while the
   * equivalent availability metric method doesn't is because in availability, we can just sum the count of different
   * metric names while for latency we can't sum the count because that's not what's being measured. It allows the
   * caller to decide if they only want to take the first name, or average all of the names
   * (like SuccessLatency and BigItemSuccessLatency).
   *
   * @param props
   * @param dimensions
   * @returns
   */
  static createLatencyMetrics(
    props: LatencyMetricProps,
    dimensions: { [key: string]: string },
  ): IMetric[] {
    let names: string[];

    switch (props.metricType) {
      default:
      case LatencyMetricType.SUCCESS_LATENCY:
        names = props.metricDetails.successMetricNames;
        break;
      case LatencyMetricType.FAULT_LATENCY:
        names = props.metricDetails.faultMetricNames;
        break;
    }

    return names.map(
      (x) =>
        new Metric({
          metricName: x,
          namespace: props.metricDetails.metricNamespace,
          unit: props.metricDetails.unit,
          period: props.metricDetails.period,
          statistic: props.statistic,
          dimensionsMap: dimensions,
          label: props.label,
        }),
    );
  }

  /**
   * Takes all of the success or failure latency metric names and creates an average of those
   * names, if there's only 1 name, it just returns that metric
   * @param props
   * @param dimensions
   */
  static createAverageLatencyMetric(
    props: LatencyMetricProps,
    dimensions: { [key: string]: string },
  ): IMetric {
    let latencyMetrics: IMetric[] =
      AvailabilityAndLatencyMetrics.createLatencyMetrics(props, dimensions);

    if (latencyMetrics.length == 1) {
      return latencyMetrics[0];
    } else {
      let usingMetrics: { [key: string]: IMetric } = {};

      latencyMetrics.forEach((metric: IMetric, index: number) => {
        let keyPrefix: string =
          (props.keyPrefix === undefined || props.keyPrefix == ''
            ? ''
            : props.keyPrefix.toLowerCase() + '_') +
          props.metricDetails.operationName.toLowerCase() +
          '_' +
          props.metricType.toString().toLowerCase();

        usingMetrics[keyPrefix + index] = metric;
      });

      return new MathExpression({
        expression: `(${Object.keys(usingMetrics).join('+')})/${Object.keys(usingMetrics).length}`,
        label: props.label,
        period: props.metricDetails.period,
        usingMetrics: usingMetrics,
      });
    }
  }

  /**
   * Creates a count of high latency metrics for either SuccessLatency or FaultLatency, will total
   * the count of requests that exceed a threshold you define in your statistic, like TC(200:) across
   * all metric names that are part of either Success or Fault latency.
   * @param props
   * @returns
   */
  static createLatencyCountMetric(
    props: LatencyMetricProps,
    dimensions: { [key: string]: string },
  ): IMetric {
    let latencyMetrics: IMetric[] =
      AvailabilityAndLatencyMetrics.createLatencyMetrics(props, dimensions);

    if (latencyMetrics.length == 1) {
      return latencyMetrics[0];
    } else {
      let usingMetrics: { [key: string]: IMetric } = {};

      latencyMetrics.forEach((metric: IMetric, index: number) => {
        let key: string = `${props.metricDetails.operationName.toLowerCase()}_${props.metricType.toString().toLowerCase()}_${index}`;
        usingMetrics[key] = metric;
      });

      return new MathExpression({
        expression: Object.keys(usingMetrics).join('+'),
        label: props.label,
        period: props.metricDetails.period,
        usingMetrics: usingMetrics,
        color: props.color
      });
    }
  }

  static createZonalLatencyCountMetric(
    props: ZonalLatencyMetricProps,
    dimensions: { [key: string]: string },
  ): IMetric {
    let latencyMetrics: IMetric[] =
      AvailabilityAndLatencyMetrics.createLatencyMetrics(props, dimensions);

    if (latencyMetrics.length == 1) {
      return latencyMetrics[0];
    } else {
      let usingMetrics: { [key: string]: IMetric } = {};

      latencyMetrics.forEach((metric: IMetric, index: number) => {
        let key: string = `${props.availabilityZone.substring(props.availabilityZone.length - 1)}_${props.metricDetails.operationName.toLowerCase()}_${props.metricType.toString().toLowerCase()}_${index}`;
        usingMetrics[key] = metric;
      });

      return new MathExpression({
        expression: Object.keys(usingMetrics).join('+'),
        label: props.label,
        period: props.metricDetails.period,
        usingMetrics: usingMetrics,
        color: props.color
      });
    }
  }
}
