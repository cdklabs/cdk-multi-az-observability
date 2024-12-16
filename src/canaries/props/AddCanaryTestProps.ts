// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { Duration } from 'aws-cdk-lib';
import { ILoadBalancerV2 } from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import { NetworkConfigurationProps } from './NetworkConfigurationProps';

/**
 * The props for requesting a canary be made for an operation
 */
export interface AddCanaryTestProps {
  /**
   * The number of requests to send on each test
   */
  readonly requestCount: number;

  /**
   * Specifies a separate number of request to send to the regional endpoint.
   *
   * @default - The same number of requests specified by the requestCount property is used.
   */
  readonly regionalRequestCount?: number;

  /**
   * A schedule expression
   */
  readonly schedule: string;

  /**
   * Data to supply in a POST, PUT, or PATCH operation
   *
   * @default - No data is sent in a POST, PUT, or PATCH request
   */
  readonly postData?: string;

  /**
   * Any headers to include
   *
   * @default - No additional headers are added to the requests
   */
  readonly headers?: { [key: string]: string };

  /**
   * The load balancer that will be tested against
   */
  readonly loadBalancer: ILoadBalancerV2;

  /**
   * Defining this will override the methods defined in the operation
   * and will use these instead.
   *
   * @default - The operation's defined HTTP methods will be used to
   * conduct the canary tests
   */
  readonly httpMethods?: string[];

  /**
   * The VPC network configuration.
   *
   * @default - The Lambda function is not run in a VPC
   */
  readonly networkConfiguration?: NetworkConfigurationProps;

  /**
   * The timeout for each individual HTTP request
   *
   * @default - Defaults to 2 seconds
   */
  readonly timeout?: Duration;

  /**
   * Whether to ignore TLS validation errors
   *
   * @default - false
   */
  readonly ignoreTlsErrors?: boolean;
}
