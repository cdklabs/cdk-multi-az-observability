// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { Duration } from "aws-cdk-lib";
import { IOperationLatencyMetricDetails } from "./IOperationLatencyMetricDetails";
import { OperationLatencyMetricDetailsProps } from "./props/OperationLatencyMetricDetailsProps";
import { OperationMetricDetails } from "./OperationMetricDetails";
import { IServiceLatencyMetricDetails } from "./IServiceLatencyMetricDetails";

/**
 * Latency metric details for an operation
 */
export class OperationLatencyMetricDetails extends OperationMetricDetails implements IOperationLatencyMetricDetails {

    /**
     * The threshold for alarms associated with latency success metrics, for example if success
     * latency exceeds 500 milliseconds
     */
    readonly successAlarmThreshold: Duration;

    constructor(
        props: OperationLatencyMetricDetailsProps,
        defaultProps: IServiceLatencyMetricDetails,
    ) {
        super(props, defaultProps);

      this.successAlarmThreshold = props.successAlarmThreshold
      ? props.successAlarmThreshold
      : defaultProps.successAlarmThreshold;
    }
}