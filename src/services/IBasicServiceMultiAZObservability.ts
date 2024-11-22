// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { IAlarm } from 'aws-cdk-lib/aws-cloudwatch';
import { CfnNatGateway } from 'aws-cdk-lib/aws-ec2';
import { IApplicationLoadBalancer } from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import { IConstruct } from 'constructs';

/**
 * Properties of a basic service
 */
export interface IBasicServiceMultiAZObservability extends IConstruct {
  /**
   * The NAT Gateways being used in the service, each set of NAT Gateways
   * are keyed by their Availability Zone Id
   */
  natGateways?: { [key: string]: CfnNatGateway[] };

  /**
   * The application load balancers being used by the service
   */
  applicationLoadBalancers?: IApplicationLoadBalancer[];

  /**
   * The name of the service
   */
  serviceName: string;

  /**
   * The alarms indicating if an AZ is an outlier for NAT GW
   * packet loss and has isolated impact
   */
  natGWZonalIsolatedImpactAlarms?: { [key: string]: IAlarm };

  /**
   * The alarms indicating if an AZ is an outlier for ALB
   * faults and has isolated impact
   */
  albZonalIsolatedImpactAlarms?: { [key: string]: IAlarm };

  /**
   * The alarms indicating if an AZ has isolated impact
   * from either ALB or NAT GW metrics
   */
  aggregateZonalIsolatedImpactAlarms: { [key: string]: IAlarm };
}
