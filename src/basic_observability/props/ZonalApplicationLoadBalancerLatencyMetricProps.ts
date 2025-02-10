import { Duration } from "aws-cdk-lib";
import { IApplicationLoadBalancer } from "aws-cdk-lib/aws-elasticloadbalancingv2";

export interface ZonalApplicationLoadBalancerLatencyMetricProps {
    readonly alb: IApplicationLoadBalancer,
    readonly label: string,
    readonly period: Duration,
    readonly statistic: string,
    readonly availabilityZone: string, 
    readonly availabilityZoneId?: string
}