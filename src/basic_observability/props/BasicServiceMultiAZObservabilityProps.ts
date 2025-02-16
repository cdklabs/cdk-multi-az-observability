// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Duration } from 'aws-cdk-lib';
import { CfnNatGateway } from 'aws-cdk-lib/aws-ec2';
import { IApplicationLoadBalancer } from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import { ApplicationLoadBalancerLatencyOutlierCalculation } from './ApplicationLoadBalancerLatencyOutlierCalculation';

/**
 * Properties for creating basic multi-AZ observability
 */
export interface BasicServiceMultiAZObservabilityProps {
  /**
   * (Optional) A map of Availability Zone name to the NAT Gateways
   * in that AZ. One alarm per NAT GW will be created. If multiple NAT GWs
   * are provided for a single AZ, those alarms will be aggregated into
   * a composite alarm for the AZ. You must either specify an ALB or a NAT GW.
   *
   * @default "No alarms for NAT Gateways will be created"
   */
  readonly natGateways?: { [key: string]: CfnNatGateway[] };

  /**
   * The application load balancers being used by the service. There will be an alarm created for 
   * each AZ for each ALB. Then, there will be a composite alarm for AZ created from the input
   * of all ALBs. You must either specify an ALB or a NAT GW.
   *
   * @default "No alarms for ALBs will be created"
   */
  readonly applicationLoadBalancers?: IApplicationLoadBalancer[];

  /**
   * The service's name
   */
  readonly serviceName: string;

  /**
   * The amount of packet loss in a NAT GW to determine if an AZ
   * is actually impacted, recommendation is 0.01%
   *
   * @default "0.01 (as in 0.01%)"
   */
  readonly packetLossImpactPercentageThreshold?: number;

  /**
   * The percentage of faults for a single ALB to consider an AZ
   * to be unhealthy, this should align with your availability goal. For example
   * 1% or 5%, specify as 1 or 5.
   */
  readonly faultCountPercentageThreshold: number;

  /**
   * The threshold in seconds for ALB targets whose responses are slower than this
   * value at the specified percentile statistic.
   */
  readonly latencyThreshold: number;

  /**
   * The statistic used to measure target response latency, like p99, 
   * which can be specified using Stats.percentile(99) or "p99".
   */
  readonly latencyStatistic: string;

  /**
   * The period to evaluate metrics
   * 
   * @default Duration.minutes(1)
   */
  readonly period?: Duration;

  /**
   * Whether to create a dashboard displaying the metrics and alarms
   * 
   * @default false
   */
  readonly createDashboard?: boolean;

  /**
   * Dashboard interval
   *
   * @default Duration.hours(1)
   */
  readonly interval?: Duration;

  /**
   * If you are not using a static bucket to deploy assets, for example
   * you are synthing this and it gets uploaded to a bucket whose name
   * is unknown to you (maybe used as part of a central CI/CD system)
   * and is provided as a parameter to your stack, specify that parameter
   * name here. It will override the bucket location CDK provides by
   * default for bundled assets. The stack containing this contruct needs
   * to have a parameter defined that uses this name. The underlying
   * stacks in this construct that deploy assets will copy the parent stack's
   * value for this property.
   *
   * @default "The assets will be uploaded to the default defined asset location."
   */
  readonly assetsBucketParameterName?: string;

  /**
   * If you are not using a static bucket to deploy assets, for example
   * you are synthing this and it gets uploaded to a bucket that uses a prefix
   * that is unknown to you (maybe used as part of a central CI/CD system)
   * and is provided as a parameter to your stack, specify that parameter
   * name here. It will override the bucket prefix CDK provides by
   * default for bundled assets. This property only takes effect if you
   * defined the assetsBucketParameterName. The stack containing this contruct needs
   * to have a parameter defined that uses this name. The underlying
   * stacks in this construct that deploy assets will copy the parent stack's
   * value for this property.
   *
   * @default "No object prefix will be added to your custom assets location. However, if you have overridden something like the 'BucketPrefix' property in your stack synthesizer with a variable like '${AssetsBucketPrefix}', you will need to define this property so it doesn't cause a reference error even if the prefix value is blank."
   */
  readonly assetsBucketPrefixParameterName?: string;

  /**
   * The number of evaluation periods for latency and availabiltiy alarms
   */
  readonly evaluationPeriods: number;

  /**
   * The number of datapoints to alarm on for latency and availability alarms
   */
  readonly datapointsToAlarm: number;

  /**
   * The method used to determine if an AZ is an outlier for latency for Application Load Balancer metrics.
   * @default Z_SCORE
   */
  readonly latencyOutlierCalculation?: ApplicationLoadBalancerLatencyOutlierCalculation;
}
