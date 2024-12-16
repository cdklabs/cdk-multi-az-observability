// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { CfnInsightRule } from 'aws-cdk-lib/aws-cloudwatch';
import { IBaseOperationRegionalAlarmsAndRules } from './IBaseOperationRegionalAlarmsAndRules';

/**
 * The server side operation regional alarms and rules
 */
export interface IServerSideOperationRegionalAlarmsAndRules
  extends IBaseOperationRegionalAlarmsAndRules {
  /**
   * A rule that shows which instances are contributing to high latency responses
   */
  instanceContributorsToRegionalHighLatency?: CfnInsightRule;

  /**
   * A rule that shows which instances are contributing to faults
   */
  instanceContributorsToRegionalFaults?: CfnInsightRule;
}
