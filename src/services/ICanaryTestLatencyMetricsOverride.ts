// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { Duration } from "aws-cdk-lib";
import { ICanaryTestMetricsOverride } from "./ICanaryTestMetricsOverride";

/**
 * Provides overrides for the default metric settings
 * used for the automatically created canary tests
 */
export interface ICanaryTestLatencyMetricsOverride extends ICanaryTestMetricsOverride {
    /**
     * The threshold for alarms associated with latency success metrics, for example if success
     * latency exceeds 500 milliseconds
     */
    readonly successAlarmThreshold?: Duration; 
}