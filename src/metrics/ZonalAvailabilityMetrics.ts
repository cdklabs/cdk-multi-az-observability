// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { Fn } from "aws-cdk-lib";
import { IMetric, MathExpression } from "aws-cdk-lib/aws-cloudwatch";
import { AvailabilityAndLatencyMetrics } from "./AvailabilityAndLatencyMetrics";
import { ServiceAvailabilityMetricProps } from "./props/ServiceAvailabilityMetricProps";
import { ZonalAvailabilityMetricProps } from "./props/ZonalAvailabilityMetricProps";
import { AvailabilityMetricType } from "../utilities/AvailabilityMetricType";

export class ZonalAvailabilityMetrics {
  /**
   * Creates a zonal service level availability metrics, one metric for
   * each operation at the zonal level and the service.
   * @param props
   * @returns The metric at index 0 is the metric math expression for the whole service. The following metrics
   * are the metrics for each operation included in the request availability metric props.
   */
  static createZonalServiceAvailabilityMetrics(
    props: ServiceAvailabilityMetricProps,
  ): IMetric[] {
    let usingMetrics: { [key: string]: IMetric } = {};
    let operationMetrics: IMetric[] = [];
    let counter: number = 0;

    props.availabilityMetricProps.forEach((prop) => {
      let keyPrefix: string =
        (prop.keyPrefix === undefined || prop.keyPrefix == ""
          ? ""
          : prop.keyPrefix.toLowerCase() + "_") +
        prop.metricDetails.operationName.toLowerCase() +
        "_" +
        prop.metricType.toString().toLowerCase();

      let zonalOperationAvailabilityMetric: IMetric =
        this.createZonalAvailabilityMetric(
          prop as ZonalAvailabilityMetricProps,
        );

      operationMetrics.push(zonalOperationAvailabilityMetric);
      usingMetrics[`${keyPrefix}${counter++}`] =
        zonalOperationAvailabilityMetric;
    });

    let expression: string = "";

    switch (props.availabilityMetricProps[0].metricType) {
      case AvailabilityMetricType.SUCCESS_RATE:
        expression = `(${Object.keys(usingMetrics).join("+")}) / ${props.availabilityMetricProps.length}`;
        break;
      case AvailabilityMetricType.REQUEST_COUNT:
        expression = `${Object.keys(usingMetrics).join("+")}`;
        break;
      case AvailabilityMetricType.FAULT_COUNT:
        expression = `${Object.keys(usingMetrics).join("+")}`;
        break;
      case AvailabilityMetricType.FAULT_RATE:
        expression = `(${Object.keys(usingMetrics).join("+")}) / ${props.availabilityMetricProps.length}`;
        break;
      case AvailabilityMetricType.SUCCESS_COUNT:
        expression = `${Object.keys(usingMetrics).join("+")}`;
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

  /**
   * Creates a zonal availability metric
   * @param props
   * @returns
   */
  static createZonalAvailabilityMetric(
    props: ZonalAvailabilityMetricProps,
  ): IMetric {
    return AvailabilityAndLatencyMetrics.createAvailabilityMetric(
      props,
      props.metricDetails.metricDimensions.zonalDimensions(
        props.availabilityZoneId,
        Fn.ref("AWS::Region"),
      ),
    );
  }
}
