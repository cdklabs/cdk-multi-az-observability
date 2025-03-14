// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { Duration, Fn } from 'aws-cdk-lib';
import {
  AlarmStatusWidget,
  Dashboard,
  GraphWidget,
  IAlarm,
  IMetric,
  IWidget,
  PeriodOverride,
  TextWidget,
} from 'aws-cdk-lib/aws-cloudwatch';
import { Construct } from 'constructs';
import { BasicServiceDashboardProps } from './props/BasicServiceDashboardProps';
import { AvailabilityZoneMapper } from '../azmapper/AvailabilityZoneMapper';
import { MetricsHelper } from '../utilities/MetricsHelper';
import { ApplicationLoadBalancerMetrics } from '../metrics/ApplicationLoadBalancerMetrics';
import { IApplicationLoadBalancer } from 'aws-cdk-lib/aws-elasticloadbalancingv2';

export class BasicServiceDashboard extends Construct {

  private static generateLoadBalancerWidgets(
    albs: IApplicationLoadBalancer[],
    azMapper: AvailabilityZoneMapper,
    period: Duration
  ): IWidget[] {
    let albWidgets: IWidget[] = [];

    albWidgets.push(new TextWidget({ height: 2, width: 24, markdown: "Load Balancer Metrics" }));

    let faultCountPerZone: {[key: string]: IMetric} = ApplicationLoadBalancerMetrics.getTotalAlbFaultCountPerZone(albs, period, azMapper);
    let processedBytesPerZone: {[key: string]: IMetric} = ApplicationLoadBalancerMetrics.getTotalAlbProcessedBytesPerZone(albs, period, azMapper);
    let latencyPerZone: {[key: string]: IMetric} = ApplicationLoadBalancerMetrics.getTotalAlbLatencyPerZone(albs, "p99", period, azMapper);
    let requestsPerZone: {[key: string]: IMetric} = ApplicationLoadBalancerMetrics.getTotalAlbRequestsPerZone(albs, period, azMapper);

    albWidgets.push(
      new GraphWidget({
        height: 8,
        width: 8,
        title: Fn.sub('${AWS::Region} Zonal Fault Count'),
        region: Fn.sub('${AWS::Region}'),
        left: Object.values(faultCountPerZone),
        leftYAxis: {
          min: 0,
          label: 'Sum',
          showUnits: false,
        }
      })
    );

    albWidgets.push(
      new GraphWidget({
        height: 8,
        width: 8,
        title: Fn.sub('${AWS::Region} Zonal Request Count'),
        region: Fn.sub('${AWS::Region}'),
        left: Object.values(requestsPerZone),
        leftYAxis: {
          min: 0,
          label: 'Sum',
          showUnits: false,
        }
      })
    );

    albWidgets.push(
      new GraphWidget({
        height: 8,
        width: 8,
        title: Fn.sub('${AWS::Region} Zonal Processed Bytes'),
        region: Fn.sub('${AWS::Region}'),
        left: Object.values(processedBytesPerZone),
        leftYAxis: {
          min: 0,
          showUnits: true,
        }
      })
    );

    albWidgets.push(
      new GraphWidget({
        height: 8,
        width: 8,
        title: Fn.sub('${AWS::Region} Zonal Latency'),
        region: Fn.sub('${AWS::Region}'),
        left: Object.values(latencyPerZone),
        leftYAxis: {
          min: 0,
          label: "Milliseconds",
          showUnits: false,
        }
      })
    );

    return albWidgets;
  }

  private static createLoadBalancerWidgets(
    alarms: { [key: string]: IAlarm },
    metrics: { [key: string]: IMetric },
    azMapper: AvailabilityZoneMapper,
  ): IWidget[] {
    let widgets: IWidget[] = [];

    widgets.push(
      new TextWidget({
        markdown: 'Load Balancer Metrics',
        height: 2,
        width: 24,
      }),
    );

    let rowTracker: number = 0;

    Object.keys(alarms).forEach((azLetter, index) => {
      let availabilityZoneId: string = azMapper.availabilityZoneIdFromAvailabilityZoneLetter(azLetter);

      widgets.push(
        new GraphWidget({
          height: 6,
          width: 8,
          title: availabilityZoneId + ' Load Balancer Faults',
          region: Fn.sub('${AWS::Region}'),
          left: [metrics[azLetter]],
          statistic: 'Sum',
          leftYAxis: {
            min: 0,
            label: 'Fault Count',
            showUnits: false,
          },
        }),
      );

      //We're on the third one for this set, add 3 alarms
      //or if we're at the end, at the necessary amount
      //of alarms, 1, 2, or 3
      if (index % 3 == 2 || index - 1 == Object.keys(alarms).length) {
        for (let k = rowTracker; k <= index; k++) {
          let azId: string = Object.keys(alarms).at(k)!;
          widgets.push(
            new AlarmStatusWidget({
              height: 2,
              width: 8,
              alarms: [alarms[azId]],
            }),
          );
        }

        rowTracker += index + 1;
      }
    });

    return widgets;
  }

  private static createNatGatewayWidgets(
    alarms: { [key: string]: IAlarm },
    metrics: { [key: string]: IMetric },
    azMapper: AvailabilityZoneMapper,
  ): IWidget[] {
    let widgets: IWidget[] = [];

    widgets.push(
      new TextWidget({
        markdown: 'NAT Gateway Dropped Packet Metrics',
        height: 2,
        width: 24,
      }),
    );

    let rowTracker: number = 0;

    Object.keys(alarms).forEach((azLetter, index) => {

      let availabilityZoneId: string = azMapper.availabilityZoneIdFromAvailabilityZoneLetter(azLetter);
      console.log(azLetter);
      console.log(availabilityZoneId);
      console.log(metrics[azLetter]);

      widgets.push(
        new GraphWidget({
          height: 6,
          width: 8,
          title: availabilityZoneId + ' NAT Gateway Dropped Packets',
          region: Fn.sub('${AWS::Region}'),
          left: [metrics[azLetter]],
          statistic: 'Sum',
          leftYAxis: {
            min: 0,
            label: 'Dropped packets',
            showUnits: false,
          },
        }),
      );

      //We're on the third one for this set, add 3 alarms
      //or if we're at the end, at the necessary amount
      //of alarms, 1, 2, or 3
      if (index % 3 == 2 || index - 1 == Object.keys(alarms).length) {
        for (let k = rowTracker; k <= index; k++) {
          let azId: string = Object.keys(alarms).at(k)!;
          widgets.push(
            new AlarmStatusWidget({
              height: 2,
              width: 8,
              alarms: [alarms[azId]],
            }),
          );
        }

        rowTracker += index + 1;
      }
    });

    return widgets;
  }

  private static createTopLevelAlarmWidgets(alarms: {
    [key: string]: IAlarm;
  },
  azMapper: AvailabilityZoneMapper,
  ): IWidget[] {
    let widgets: IWidget[] = [];

    widgets.push(
      new TextWidget({
        markdown: 'Availability Zone Isolated Impact Alarms',
        height: 2,
        width: 24,
      }),
    );

    Object.keys(alarms).forEach((azLetter) => {
      let availabilityZoneId: string = azMapper.availabilityZoneIdFromAvailabilityZoneLetter(azLetter);

      widgets.push(
        new AlarmStatusWidget({
          alarms: [alarms[azLetter]],
          height: 2,
          width: 8,
          title: availabilityZoneId + ' Aggregate Isolated Impact',
        }),
      );
    });

    return widgets;
  }

  dashboard: Dashboard;

  constructor(scope: Construct, id: string, props: BasicServiceDashboardProps) {
    super(scope, id);

    let widgets: IWidget[][] = [];

    widgets.push(
      BasicServiceDashboard.createTopLevelAlarmWidgets(
        props.zonalAggregateIsolatedImpactAlarms,
        props.azMapper,
      ),
    );

    /*if (
      MetricsHelper.isNotEmpty(props.zonalLoadBalancerIsolatedImpactAlarms) &&
      MetricsHelper.isNotEmpty(props.zonalLoadBalancerFaultRateMetrics)
    ) {
      widgets.push(
        BasicServiceDashboard.createLoadBalancerWidgets(
          props.zonalLoadBalancerIsolatedImpactAlarms,
          props.zonalLoadBalancerFaultRateMetrics,
          props.azMapper,
        ),
      );
    }*/

      if (props.albs) {
        widgets.push(
          BasicServiceDashboard.generateLoadBalancerWidgets(
            props.albs,
            props.azMapper,
            props.period
          )
        )
      }

    if (
      MetricsHelper.isNotEmpty(props.zonalNatGatewayIsolatedImpactAlarms) &&
      MetricsHelper.isNotEmpty(props.zonalNatGatewayPacketDropMetrics)
    ) {
      widgets.push(
        BasicServiceDashboard.createNatGatewayWidgets(
          props.zonalNatGatewayIsolatedImpactAlarms,
          props.zonalNatGatewayPacketDropMetrics,
          props.azMapper,
        ),
      );
    }

    this.dashboard = new Dashboard(this, 'BasicServiceDashboard', {
      dashboardName:
        props.serviceName.toLowerCase() +
        Fn.sub('-service-availability-${AWS::Region}'),
      defaultInterval: props.interval,
      periodOverride: PeriodOverride.AUTO,
      widgets: widgets,
    });
  }
}
