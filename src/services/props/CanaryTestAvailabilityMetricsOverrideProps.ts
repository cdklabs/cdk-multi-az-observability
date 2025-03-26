// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { CanaryTestMetricsOverrideProps } from "./CanaryTestMetricsOverrideProps";

/**
 * Properties for canary metrics in an operation
 */
export interface CanaryTestAvailabilityMetricsOverrideProps extends CanaryTestMetricsOverrideProps {
    /**
     * The threshold for alarms associated with success metrics, for example if measuring
     * success rate, the threshold may be 99, meaning you would want an alarm that triggers
     * if success drops below 99%.
     *
     * @default - This property will use the default defined for the service
     */
    readonly successAlarmThreshold?: number;  

    /**
     * The threshold for alarms associated with fault metrics, for example if measuring
     * fault rate, the threshold may be 1, meaning you would want an alarm that triggers
     * if the fault rate goes above 1%.
     *
     * @default - This property will use the default defined for the service
     */
    readonly faultAlarmThreshold?: number;
}