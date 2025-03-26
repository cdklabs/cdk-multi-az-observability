// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { Duration } from "aws-cdk-lib";
import { OperationMetricDetailsProps } from "./OperationMetricDetailsProps";

/**
 * The properties for an operation's latency metric details
 */
export interface OperationLatencyMetricDetailsProps extends OperationMetricDetailsProps {
    /**
     * The threshold for alarms associated with latency success metrics, for example if success
     * latency exceeds 500 milliseconds
     * 
     * @default "The service default is used"
     */
    readonly successAlarmThreshold?: Duration;
}