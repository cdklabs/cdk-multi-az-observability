// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { CfnInsightRule } from "aws-cdk-lib/aws-cloudwatch";
import { Construct } from "constructs";
import { AvailabilityAndLatencyAlarmsAndRules } from "./AvailabilityAndLatencyAlarmsAndRules";
import { BaseOperationRegionalAlarmsAndRules } from "./BaseOperationRegionalAlarmsAndRules";
import { IServerSideOperationRegionalAlarmsAndRules } from "./IServerSideOperationRegionalAlarmsAndRules";
import { ServerSideOperationRegionalAlarmsAndRulesProps } from "./props/ServerSideOperationRegionalAlarmsAndRulesProps";

/**
 * The server side regional alarms and rules for an operation
 */
export class ServerSideOperationRegionalAlarmsAndRules
  extends BaseOperationRegionalAlarmsAndRules
  implements IServerSideOperationRegionalAlarmsAndRules
{
  /**
   * A rule that shows which instances are contributing to high latency responses
   */
  instanceContributorsToRegionalHighLatency?: CfnInsightRule;

  /**
   * A rule that shows which instances are contributing to faults
   */
  instanceContributorsToRegionalFaults?: CfnInsightRule;

  constructor(
    scope: Construct,
    id: string,
    props: ServerSideOperationRegionalAlarmsAndRulesProps,
  ) {
    super(scope, id, props);

    if (props.contributorInsightRuleDetails) {
      this.instanceContributorsToRegionalFaults =
        AvailabilityAndLatencyAlarmsAndRules.createRegionalInstanceContributorsToFaults(
          this,
          props.availabilityMetricDetails,
          props.contributorInsightRuleDetails,
        );
      this.instanceContributorsToRegionalHighLatency =
        AvailabilityAndLatencyAlarmsAndRules.createRegionalInstanceContributorsToHighLatency(
          this,
          props.latencyMetricDetails,
          props.contributorInsightRuleDetails,
        );
    }
  }
}