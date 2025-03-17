import { IApplicationLoadBalancer } from "aws-cdk-lib/aws-elasticloadbalancingv2";
import { ApplicationLoadBalancerAvailabilityOutlierAlgorithm } from "../../outlier-detection/ApplicationLoadBalancerAvailabilityOutlierAlgorithm";
import { ApplicationLoadBalancerLatencyOutlierAlgorithm } from "../../outlier-detection/ApplicationLoadBalancerLatencyOutlierAlgorithm";

/**
 * The properties for performing zonal impact detection with ALB(s).
 */
export interface ApplicationLoadBalancerDetectionProps {

  /**
   * The application load balancers to collect metrics from.
   */
  readonly applicationLoadBalancers: IApplicationLoadBalancer[];

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
  readonly latencyThreshold: number;
  
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