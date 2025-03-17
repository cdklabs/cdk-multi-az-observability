// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Duration } from 'aws-cdk-lib';
import { ApplicationLoadBalancerDetectionProps } from './ApplicationLoadBalancerDetectionProps';
import { NatGatewayDetectionProps } from './NatGatewayDetectionProps';

/**
 * Properties for creating basic multi-AZ observability
 */
export interface BasicServiceMultiAZObservabilityProps {
  /**
   * Properties for NAT Gateways to detect single AZ impact. You must specify
   * this and/or applicationLoadBalancerProps.
   * 
   * @default "No NAT Gateways will be used to calculate impact."
   */
  readonly natGatewayProps?: NatGatewayDetectionProps;

  /**
   * Properties for ALBs to detect single AZ impact. You must specify this
   * and/or natGatewayProps.
   * 
   * @default "No ALBs will be used to calculate impact."
   */
  readonly applicationLoadBalancerProps?: ApplicationLoadBalancerDetectionProps;

  /**
   * The service's name
   */
  readonly serviceName: string;

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
}
