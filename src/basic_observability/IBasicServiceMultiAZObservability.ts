// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Dashboard, IAlarm } from 'aws-cdk-lib/aws-cloudwatch';
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
   * packet loss and has isolated impact. This will be 1 composite alarm 
   * per AZ that triggers if any NAT GW in that AZ sees outlier impact.
   */
  natGWZonalIsolatedImpactAlarms?: { [key: string]: IAlarm };

  /**
   * The alarms indicating if an AZ is an outlier for ALB
   * faults and has isolated impact. This will be 1 composite alarm 
   * per AZ that triggers if any ALB in that AZ sees outlier impact.
   */
  albZonalIsolatedImpactAlarms?: { [key: string]: IAlarm };

  /**
   * The alarms indicating if an AZ has isolated impact
   * from either ALB or NAT GW metrics
   */
  aggregateZonalIsolatedImpactAlarms: { [key: string]: IAlarm };

  /**
   * The optional dashboard created for observability
   */
  dashboard?: Dashboard;
}
