// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { Duration } from "aws-cdk-lib";
import { CanaryTestMetricsOverride } from "./CanaryTestMetricsOverride";
import { CanaryTestLatencyMetricsOverrideProps } from "./props/CanaryTestLatencyMetricsOverrideProps";

/**
 * Provides overrides for the default metric settings
 * used for the automatically created canary tests
 */
export class CanaryTestLatencyMetricsOverride extends CanaryTestMetricsOverride {
    /**
     * The threshold for alarms associated with latency success metrics, for example if success
     * latency exceeds 500 milliseconds
     */
    readonly successAlarmThreshold?: Duration;    

    constructor(props: CanaryTestLatencyMetricsOverrideProps) {
        super(props);

        this.successAlarmThreshold = props.successAlarmThreshold;
    }
}