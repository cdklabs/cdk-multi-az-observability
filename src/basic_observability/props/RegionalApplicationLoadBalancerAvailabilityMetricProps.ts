import { Duration } from "aws-cdk-lib";
import { AvailabilityMetricType } from "../../utilities/AvailabilityMetricType";

export interface RegionalApplicationLoadBalancerAvailabilityMetricProps {
    readonly metricType: AvailabilityMetricType,
    readonly label: string,
    readonly period: Duration
    readonly keyprefix?: string
}