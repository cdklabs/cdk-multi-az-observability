// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { Duration } from "aws-cdk-lib";
import { CanaryTestMetricsOverrideProps } from "./CanaryTestMetricsOverrideProps";

/**
 * Properties for canary metrics in an operation
 */
export interface CanaryTestLatencyMetricsOverrideProps extends CanaryTestMetricsOverrideProps {
    /**
     * The threshold for alarms associated with latency success metrics, for example if success
     * latency exceeds 500 milliseconds
     * 
     * @default - This property will use the default defined for the service
     */
    readonly successAlarmThreshold?: Duration;
}