import { IApplicationLoadBalancer, ITargetGroup } from "aws-cdk-lib/aws-elasticloadbalancingv2";
import { ApplicationLoadBalancerAvailabilityOutlierAlgorithm } from "../../outlier-detection/ApplicationLoadBalancerAvailabilityOutlierAlgorithm";
import { ApplicationLoadBalancerLatencyOutlierAlgorithm } from "../../outlier-detection/ApplicationLoadBalancerLatencyOutlierAlgorithm";
import { Duration } from "aws-cdk-lib";

/**
 * An object to map an ALB to its target groups
 */
export interface AlbTargetGroupMap {
  /**
   * The application load balancer
   */
  readonly applicationLoadBalancer: IApplicationLoadBalancer;

  /**
   * The target groups associated with the ALB
   * 
   * @default No target groups are associated and will not display anomalous hosts or mitigated hosts on the dashboard
   */
  readonly targetGroups?: ITargetGroup[];
}

/**
 * The properties for performing zonal impact detection with ALB(s).
 */
export interface ApplicationLoadBalancerDetectionProps {

  /**
   * Map of target groups per ALB to collect metrics from.
   */
  readonly albTargetGroupMap: AlbTargetGroupMap[];

  /**
   * The percentage of faults for a single ALB to consider an AZ
   * to be unhealthy, a number between 0 and 100. This should align with your availability goal. For example
   * 1% or 5%, provided as 1 or 5.
   */
  readonly faultCountPercentThreshold: number;

  /**
   * The threshold in milliseconds for ALB targets whose responses are slower than this
   * value at the specified percentile statistic.
   */
  readonly latencyThreshold: Duration;
  
  /**
   * The statistic used to measure target response latency, like p99, 
   * which can be specified using Stats.percentile(99) or "p99".
   */
  readonly latencyStatistic: string;

  /**
   * The method used to determine if an AZ is an outlier for latency for Application Load Balancer metrics.
   * @default Z_SCORE
   */
  readonly latencyOutlierAlgorithm?: ApplicationLoadBalancerLatencyOutlierAlgorithm;

  /**
   * The method used to determine if an AZ is an outlier for availability for Application Load Balancer metrics.
   * @default STATIC
   */
  readonly availabilityOutlierAlgorithm?: ApplicationLoadBalancerAvailabilityOutlierAlgorithm;

  /**
   * The threshold for the outlier detection algorithm.
   * 
   * @default "This depends on the algorithm used. STATIC: 66"
   */
  readonly availabilityOutlierThreshold?: number;

  /**
   * The threshold for the outlier detection algorithm.
   * 
   * @default "This depends on the algorithm used. STATIC: 66. Z_SCORE: 3."
   */
  readonly latencyOutlierThreshold?: number;
  
}