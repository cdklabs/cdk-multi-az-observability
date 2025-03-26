// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { Duration } from "aws-cdk-lib";
import { IOperationMetricDetails } from "./IOperationMetricDetails";

/**
 * Details for operation metrics in one perspective, such as server side latency
 */
export interface IOperationLatencyMetricDetails extends IOperationMetricDetails {
    /**
     * The threshold for alarms associated with latency success metrics, for example if success
     * latency exceeds 500 milliseconds
     */
    readonly successAlarmThreshold: Duration;
}