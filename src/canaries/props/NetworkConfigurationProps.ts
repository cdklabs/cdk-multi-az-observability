// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { IVpc, SubnetSelection } from 'aws-cdk-lib/aws-ec2';

/**
 * The network configuration for the canary function
 */
export interface NetworkConfigurationProps {
  /**
   * The VPC to run the canary in. A security group will be created
   * that allows the function to communicate with the VPC as well
   * as the required IAM permissions.
   */
  readonly vpc: IVpc;

  /**
   * The subnets the Lambda function will be deployed in the VPC.
   */
  readonly subnetSelection: SubnetSelection;
}
