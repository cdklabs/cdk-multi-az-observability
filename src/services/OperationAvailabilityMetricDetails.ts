// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { IOperationAvailabilityMetricDetails } from "./IOperationAvailabilityMetricDetails";
import { IServiceAvailabilityMetricDetails } from "./IServiceAvailabilityMetricDetails";
import { OperationMetricDetails } from "./OperationMetricDetails";
import { OperationAvailabilityMetricDetailsProps } from "./props/OperationAvailabilityMetricDetailsProps";

/**
 * Availability metric details for an operation
 */
export class OperationAvailabilityMetricDetails extends OperationMetricDetails implements IOperationAvailabilityMetricDetails {

    /**
     * The threshold for alarms associated with availability success metrics, for example if measuring
     * success rate, the threshold may be 99, meaning you would want an alarm that triggers
     * if success drops below 99%.
     */
    readonly successAlarmThreshold: number;
    
    /**
     * The threshold for alarms associated with availability fault metrics, for example if measuring
     * fault rate, the threshold may be 1, meaning you would want an alarm that triggers
     * if the fault rate goes above 1%.
     */
    readonly faultAlarmThreshold: number;

    constructor(
        props: OperationAvailabilityMetricDetailsProps,
        defaultProps: IServiceAvailabilityMetricDetails,
    ) {
        super(props, defaultProps);

        this.faultAlarmThreshold = props.faultAlarmThreshold
      ? props.faultAlarmThreshold
      : defaultProps.faultAlarmThreshold;

      this.successAlarmThreshold = props.successAlarmThreshold
      ? props.successAlarmThreshold
      : defaultProps.successAlarmThreshold;
    }
}