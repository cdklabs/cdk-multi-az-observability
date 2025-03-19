// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { Aws, Duration, Fn } from 'aws-cdk-lib';
import {
  AlarmStatusWidget,
  Dashboard,
  GraphWidget,
  IMetric,
  IWidget,
  PeriodOverride,
  TextWidget,
  TextWidgetBackground,
} from 'aws-cdk-lib/aws-cloudwatch';
import { Construct } from 'constructs';
import { BasicServiceDashboardProps } from './props/BasicServiceDashboardProps';
import { AvailabilityZoneMapper } from '../azmapper/AvailabilityZoneMapper';
import { CfnNatGateway } from 'aws-cdk-lib/aws-ec2';
import { NatGatewayMetrics } from '../metrics/NatGatewayMetrics';
import { ApplicationLoadBalancerMetrics } from '../metrics/ApplicationLoadBalancerMetrics';

export class BasicServiceDashboard extends Construct {

  private static generateNatGatewayWidgets(
    natgws: {[key: string]: CfnNatGateway[]},
    azMapper: AvailabilityZoneMapper,
    period: Duration,
    packetDropRateThreshold: number,
  ): IWidget[] {
    let widgets: IWidget[] = [];

    widgets.push(
      new TextWidget({
        markdown: 'NAT Gateway Metrics',
        height: 2,
        width: 24,
      }),
    );

    let totalPacketsMetrics: {[key: string]: IMetric} = NatGatewayMetrics.getTotalPacketCountForEveryAZ(natgws, azMapper, period);
    let packetDropMetrics: {[key: string]: IMetric} = NatGatewayMetrics.getTotalPacketDropsForEveryAZ(natgws, azMapper, period);
    let packetDropRateMetrics: {[key: string]: IMetric} = NatGatewayMetrics.getTotalPacketDropRateForEveryAZ(natgws, azMapper, period);

    widgets.push(
      new GraphWidget({
        height: 6,
        width: 8,
        title: Aws.REGION + ' NAT Gateway Total Packets',
        region: Aws.REGION,
        left: Object.values(totalPacketsMetrics),
        statistic: 'Sum',
        leftYAxis: {
          min: 0,
          label: 'Count',
          showUnits: false,
        }
      }),
    );

    widgets.push(
      new GraphWidget({
        height: 6,
        width: 8,
        title: Aws.REGION + ' NAT Gateway Dropped Packets',
        region: Aws.REGION,
        left: Object.values(packetDropMetrics),
        statistic: 'Sum',
        leftYAxis: {
          min: 0,
          label: 'Count',
          showUnits: false,
        }
      }),
    );

    widgets.push(
      new GraphWidget({
        height: 6,
        width: 8,
        title: Aws.REGION + ' NAT Gateway Dropped Packet Rate',
        region: Aws.REGION,
        left: Object.values(packetDropRateMetrics),
        leftYAxis: {
          min: 0,
          label: 'Percent',
          showUnits: false,
        },
        leftAnnotations: [
          {
            label: "High Severity",
            value: packetDropRateThreshold
          }
        ]
      }),
    );

    return widgets;
  }

  dashboard: Dashboard;

  constructor(scope: Construct, id: string, props: BasicServiceDashboardProps) {
    super(scope, id);

    if (!(props.albs) && !(props.natgws)) {
      throw new Error("You must define either ALBs or NAT Gateways for this service in order to create a dashboard.");
    }

    this.dashboard = new Dashboard(this, 'BasicServiceDashboard', {
      dashboardName:
        props.serviceName.toLowerCase() +
        Fn.sub('-per-az-health-${AWS::Region}'),
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
        ...BasicServiceDashboard.generateNatGatewayWidgets(
          props.natgws.natGateways,
          props.azMapper,
          props.period,
          props.natgws.packetLossPercentThreshold ? props.natgws.packetLossPercentThreshold : 0.01
        )
      );
    }
  }
}
