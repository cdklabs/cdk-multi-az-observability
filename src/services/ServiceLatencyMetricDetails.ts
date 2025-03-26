// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { Duration } from "aws-cdk-lib";
import { IServiceLatencyMetricDetails } from "./IServiceLatencyMetricDetails";
import { ServiceLatencyMetricDetailsProps } from "./props/ServiceLatencyMetricDetailsProps";
import { ServiceMetricDetails } from "./ServiceMetricDetails";

/**
 * Default latency metric details for a service
 */
export class ServiceLatencyMetricDetails extends ServiceMetricDetails implements IServiceLatencyMetricDetails {
      /**
       * The threshold for alarms associated with latency success metrics, for example if success
       * latency exceeds 500 milliseconds
       */
      readonly successAlarmThreshold: Duration;
    
      constructor(props: ServiceLatencyMetricDetailsProps) {
        super(props);
        this.successAlarmThreshold = props.successAlarmThreshold;
      }
}