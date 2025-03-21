// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { Aws } from 'aws-cdk-lib';
import {
  AlarmStatusWidget,
  Dashboard,
  PeriodOverride,
  TextWidget,
  TextWidgetBackground,
} from 'aws-cdk-lib/aws-cloudwatch';
import { Construct } from 'constructs';
import { BasicServiceDashboardProps } from './props/BasicServiceDashboardProps';
import { ApplicationLoadBalancerMetrics } from '../metrics/ApplicationLoadBalancerMetrics';
import { NatGatewayMetrics } from '../metrics/NatGatewayMetrics';

export class BasicServiceDashboard extends Construct {

  dashboard: Dashboard;

  constructor(scope: Construct, id: string, props: BasicServiceDashboardProps) {
    super(scope, id);

    if (!(props.albs) && !(props.natgws)) {
      throw new Error("You must define either ALBs or NAT Gateways for this service in order to create a dashboard.");
    }

    this.dashboard = new Dashboard(this, 'BasicServiceDashboard', {
      dashboardName: `${props.serviceName.toLowerCase()}-per-az-health-${Aws.REGION}`,
      defaultInterval: props.interval,
      periodOverride: PeriodOverride.AUTO
    });

    this.dashboard.addWidgets(new AlarmStatusWidget({
      alarms: Object.values(props.zonalAggregateIsolatedImpactAlarms),
      height: 2,
      width: 24,
      title: 'Aggregate Alarms',
    }));

    if (props.albs) {
      this.dashboard.addWidgets(

      new TextWidget({
        markdown: "## **Load Balancer Metrics**",
        background: TextWidgetBackground.TRANSPARENT,
        height: 1,
        width: 24
      }),
      ...ApplicationLoadBalancerMetrics.generateLoadBalancerWidgets(
          props.albs.applicationLoadBalancers,
          props.azMapper,
          props.period,
          props.albs.latencyStatistic,
          props.albs.latencyThreshold,
          props.albs.faultCountPercentThreshold
        )
      )
    }

    if (props.natgws) {
      this.dashboard.addWidgets(
        ...NatGatewayMetrics.generateNatGatewayWidgets(
          props.natgws.natGateways,
          props.azMapper,
          props.period,
          props.natgws.packetLossPercentThreshold ? props.natgws.packetLossPercentThreshold : 0.01
        )
      );
    }
  }
}
