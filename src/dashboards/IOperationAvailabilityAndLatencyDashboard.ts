// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { Dashboard } from 'aws-cdk-lib/aws-cloudwatch';

/**
 * An operation level availability and latency dashboard
 */
export interface IOperationAvailabilityAndLatencyDashboard {
  /**
   * The operation level dashboard
   */
  dashboard: Dashboard;
}
