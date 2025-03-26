// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { ConcreteWidget, IWidget } from 'aws-cdk-lib/aws-cloudwatch';
import { ContributorInsightWidgetProps } from './props/ContributorInsightWidgetProps';
import { Aws } from 'aws-cdk-lib';

/**
 * A Contributor Insight dashboard widget
 */
export class ContributorInsightsWidget
  extends ConcreteWidget
  implements IWidget {
  /**
   * The widget properties
   */
  private readonly props: ContributorInsightWidgetProps;

  /**
   * Creates the widget
   * @param props
   */
  constructor(props: ContributorInsightWidgetProps) {
    super(props.width || 6, props.height || 6);
    this.props = props;
  }

  /**
   * Converts the widget into an array of JSON objects (not string), this returns
   * a single item in the array
   * @returns An array of dictionaries
   */
  toJson(): any[] {
    return [
      {
        type: 'metric',
        width: this.width,
        height: this.height,
        x: this.x,
        y: this.y,
        properties: {
          view: 'timeSeries',
          title: this.props.title,
          region: this.props.region|| Aws.REGION,     
          insightRule: {
            maxContributorCount: this.props.topContributors,
            orderBy: this.props.orderStatistic,
            ruleName: this.props.insightRule.attrRuleName,
          },
          legend: this.props.legendPosition !== undefined ? { position: this.props.legendPosition } : undefined,
          period: this.props.period?.toSeconds(),
          accountId: this.props.accountId
        },
      },
    ];
  }
}
