// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { Fn } from "aws-cdk-lib";
import { ConcreteWidget, IWidget } from "aws-cdk-lib/aws-cloudwatch";
import { ContributorInsightWidgetProps } from "./props/ContributorInsightWidgetProps";

/**
 * A Contributor Insight dashboard widget
 */
export class ContributorInsightsWidget
  extends ConcreteWidget
  implements IWidget
{
  /**
   * The widget properties
   */
  properties: ContributorInsightWidgetProps;

  /**
   * Creates the widget
   * @param props
   */
  constructor(props: ContributorInsightWidgetProps) {
    super(
      props.width === undefined ? 6 : props.width,
      props.height === undefined ? 6 : props.height,
    );
    this.properties = props;
  }

  /**
   * Converts the widget into an array of JSON objects (not string), this returns
   * a single item in the array
   * @returns An array of dictionaries
   */
  toJson(): any[] {
    return [
      {
        type: "metric",
        width: this.width,
        height: this.height,
        x: this.x,
        y: this.y,
        properties: {
          insightRule: {
            maxContributorCount: this.properties.topContributors,
            orderBy: this.properties.orderStatistic,
            ruleName: this.properties.insightRule.attrRuleName,
          },
          region:
            this.properties.region !== undefined
              ? this.properties.region
              : Fn.ref("AWS::Region"),
          legend: {
            position: this.properties.legendPosition,
          },
          view: "timeSeries",
          period: this.properties.period.toSeconds(),
          title: this.properties.title,
          accountId: this.properties.accountId,
        },
      },
    ];
  }
}
