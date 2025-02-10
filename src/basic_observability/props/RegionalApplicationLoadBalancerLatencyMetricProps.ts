import { Duration } from "aws-cdk-lib";
import { IApplicationLoadBalancer } from "aws-cdk-lib/aws-elasticloadbalancingv2";

export interface RegionalApplicationLoadBalancerLatencyMetricProps {
    readonly alb: IApplicationLoadBalancer,
    readonly label: string,
    readonly period: Duration,
    readonly statistic: string
}