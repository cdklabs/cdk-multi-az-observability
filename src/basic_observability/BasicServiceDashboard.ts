// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { Aws, Duration, Fn } from 'aws-cdk-lib';
import {
  AlarmStatusWidget,
  Color,
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
import { ApplicationLoadBalancerMetrics } from '../metrics/ApplicationLoadBalancerMetrics';
import { IApplicationLoadBalancer } from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import { CfnNatGateway } from 'aws-cdk-lib/aws-ec2';
import { NatGatewayMetrics } from '../metrics/NatGatewayMetrics';

export class BasicServiceDashboard extends Construct {

  private static generateLoadBalancerWidgets(
    albs: IApplicationLoadBalancer[],
    azMapper: AvailabilityZoneMapper,
    period: Duration,
    latencyStatistic: string,
    latencyThreshold: number,
    faultRateThreshold: number
  ): IWidget[] {
    let albWidgets: IWidget[] = [];

    albWidgets.push(new TextWidget({ height: 2, width: 24, markdown: "Load Balancer Metrics" }));

    let successCountPerZone: {[key: string]: IMetric} = 
      ApplicationLoadBalancerMetrics.getTotalAlbSuccessCountPerZone(albs, period, azMapper);
    let faultCountPerZone: {[key: string]: IMetric} = 
      ApplicationLoadBalancerMetrics.getTotalAlbFaultCountPerZone(albs, period, azMapper);
    let processedBytesPerZone: {[key: string]: IMetric} = 
      ApplicationLoadBalancerMetrics.getTotalAlbProcessedBytesPerZone(albs, period, azMapper);
    let latencyPerZone: {[key: string]: IMetric} = 
      ApplicationLoadBalancerMetrics.getTotalAlbLatencyPerZone(albs, latencyStatistic, period, azMapper);
    let requestsPerZone: {[key: string]: IMetric} = 
      ApplicationLoadBalancerMetrics.getTotalAlbRequestsPerZone(albs, period, azMapper);  
    let faultRatePerZone: {[key: string]: IMetric} =
      ApplicationLoadBalancerMetrics.getTotalAlbFaultRatePerZone(albs, period, azMapper);  

    albWidgets.push(
      new GraphWidget({
        height: 8,
        width: 8,
        title: Fn.sub('${AWS::Region} Zonal Success Count'),
        region: Fn.sub('${AWS::Region}'),
        left: Object.values(successCountPerZone),
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
        title: Fn.sub('${AWS::Region} Zonal Fault Rate'),
        region: Fn.sub('${AWS::Region}'),
        left: Object.values(faultRatePerZone),
        leftYAxis: {
          min: 0,
          label: 'Percent',
          showUnits: false,
        },
        leftAnnotations: [
          {
            label: "High Severity",
            value: faultRateThreshold,
            color: Color.RED
          }
        ]       
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
          showUnits: false,
          label: 'Bytes'
        }
      })
    );

    albWidgets.push(
      new GraphWidget({
        height: 8,
        width: 8,
        title: Fn.sub('${AWS::Region} Zonal Target Response Time (' + latencyStatistic + ')'),
        region: Fn.sub('${AWS::Region}'),
        left: Object.values(latencyPerZone),
        leftYAxis: {
          min: 0,
          label: "Milliseconds",
          showUnits: false,
        },
        leftAnnotations: [
          {
            label: "High Severity",
            value: latencyThreshold,
            color: Color.RED
          }
        ]
      })
    );

    return albWidgets;
  }

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

    if (!(props.albs) && !(props.natgws)) {
      throw new Error("You must define either ALBs or NAT Gateways for this service in order to create a dashboard.");
    }

    let widgets: IWidget[][] = [];

    widgets.push(
      BasicServiceDashboard.createTopLevelAlarmWidgets(
        props.zonalAggregateIsolatedImpactAlarms,
        props.azMapper,
      ),
    );

    if (props.albs) {
      widgets.push(
        BasicServiceDashboard.generateLoadBalancerWidgets(
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
      widgets.push(
        BasicServiceDashboard.generateNatGatewayWidgets(
          props.natgws.natGateways,
          props.azMapper,
          props.period,
          props.natgws.packetLossPercentThreshold ? props.natgws.packetLossPercentThreshold : 0.01
        ),
      );
    }

    this.dashboard = new Dashboard(this, 'BasicServiceDashboard', {
      dashboardName:
        props.serviceName.toLowerCase() +
        Fn.sub('-per-az-health-${AWS::Region}'),
      defaultInterval: props.interval,
      periodOverride: PeriodOverride.AUTO,
      widgets: widgets,
    });
  }
}
