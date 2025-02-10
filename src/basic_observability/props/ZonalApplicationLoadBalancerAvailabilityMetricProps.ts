import { Duration } from "aws-cdk-lib";
import { AvailabilityMetricType } from "../../utilities/AvailabilityMetricType";

export interface ZonalApplicationLoadBalancerAvailabilityMetricProps {
    readonly metricType: AvailabilityMetricType,
    readonly availabilityZone: string, 
    readonly availabilityZoneId: string, 
    readonly label: string,
    readonly period: Duration
    readonly keyprefix?: string
}