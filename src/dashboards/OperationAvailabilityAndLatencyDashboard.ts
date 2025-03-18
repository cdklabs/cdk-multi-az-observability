// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { Aws, Fn } from 'aws-cdk-lib';
import {
  Dashboard,
  IMetric,
  PeriodOverride,
  IWidget,
  TextWidget,
  AlarmStatusWidget,
  GraphWidget,
  Color,
  AlarmWidget,
  LegendPosition,
} from 'aws-cdk-lib/aws-cloudwatch';
import { Construct } from 'constructs';
import { ContributorInsightsWidget } from './ContributorInsightsWidget';
import { IOperationAvailabilityAndLatencyDashboard } from './IOperationAvailabilityAndLatencyDashboard';
import { OperationAvailabilityAndLatencyDashboardProps } from './props/OperationAvailabilityAndLatencyDashboardProps';
import { OperationAvailabilityWidgetProps } from './props/OperationAvailabilityWidgetProps';
import { OperationLatencyWidgetProps } from './props/OperationLatencyWidgetProps';
import { RegionalLatencyMetrics } from '../metrics/RegionalLatencyMetrics';
import { ZonalLatencyMetrics } from '../metrics/ZonalLatencyMetrics';
import { AvailabilityMetricType } from '../utilities/AvailabilityMetricType';
import { LatencyMetricType } from '../utilities/LatencyMetricType';
import { MetricsHelper } from '../utilities/MetricsHelper';
import { AvailabilityAndLatencyMetrics } from '../metrics/AvailabilityAndLatencyMetrics';

/**
 * Creates an operation level availability and latency dashboard
 */
export class OperationAvailabilityAndLatencyDashboard
  extends Construct
  implements IOperationAvailabilityAndLatencyDashboard {
  
  private static createTopLevelAggregateAlarmWidgets(
    props: OperationAvailabilityAndLatencyDashboardProps
  ): IWidget[] {

    let topLevelOperationAlarmsAndMetrics: IWidget[] = [
      new AlarmStatusWidget({
        height: 2,
        width: 24,
        alarms: [
          props.regionalImpactAlarm,
        ...props.isolatedAZImpactAlarms
        ],
        title: "Aggregate Alarms"
      }),
    ];

    let zonalServerSideHighLatencyMetrics: IMetric[] = [];
    let zonalServerSideFaultCountMetrics: IMetric[] = [];

    let zonalCanaryHighLatencyMetrics: IMetric[] = [];
    let zonalCanaryFaultCountMetrics: IMetric[] = [];

    let keyPrefix: string = MetricsHelper.nextChar();

    props.availabilityZones.forEach((availabilityZone: string, index: number) => {
      let azLetter: string = availabilityZone.substring(availabilityZone.length - 1);
      let availabilityZoneId: string = props.azMapper.availabilityZoneIdFromAvailabilityZoneLetter(azLetter);

      zonalServerSideHighLatencyMetrics.push(
        ZonalLatencyMetrics.createZonalCountLatencyMetric({
          availabilityZoneId: availabilityZoneId,
          availabilityZone: availabilityZone,
          metricDetails: props.operation.serverSideLatencyMetricDetails,
          label: availabilityZoneId,
          metricType: LatencyMetricType.SUCCESS_LATENCY,
          statistic: `TC(${props.operation.serverSideLatencyMetricDetails.successAlarmThreshold}:)`,
          keyPrefix: keyPrefix,
          color: MetricsHelper.colors[index]
        })
      );

      zonalServerSideHighLatencyMetrics.push(
        ZonalLatencyMetrics.createZonalCountLatencyMetric({
          availabilityZoneId: availabilityZoneId,
          availabilityZone: availabilityZone,
          metricDetails: props.operation.serverSideLatencyMetricDetails,
          label: availabilityZoneId,
          metricType: LatencyMetricType.SUCCESS_LATENCY,
          statistic: `TC(${props.operation.serverSideLatencyMetricDetails.successAlarmThreshold}:)`,
          keyPrefix: keyPrefix,
          color: MetricsHelper.colors[index]
        }),
      );

      zonalServerSideFaultCountMetrics.push(
        AvailabilityAndLatencyMetrics.createZonalAvailabilityMetric({
          availabilityZoneId: availabilityZoneId,
          availabilityZone: availabilityZone,
          metricDetails: props.operation.serverSideAvailabilityMetricDetails,
          label: availabilityZoneId,
          metricType: AvailabilityMetricType.FAULT_COUNT,
          keyPrefix: keyPrefix,
          color: MetricsHelper.colors[index]
        },
        props.operation.serverSideLatencyMetricDetails.metricDimensions.zonalDimensions(
          availabilityZoneId,
          Aws.REGION
        ))
      );

      if (
        props.operation.canaryMetricDetails !== undefined &&
        props.operation.canaryMetricDetails != null
      ) {
        zonalCanaryHighLatencyMetrics.push(
          ZonalLatencyMetrics.createZonalCountLatencyMetric({
            availabilityZoneId: availabilityZoneId,
            availabilityZone: availabilityZone,
            metricDetails:
              props.operation.canaryMetricDetails.canaryLatencyMetricDetails,
            label: availabilityZoneId,
            metricType: LatencyMetricType.SUCCESS_LATENCY,
            statistic: `TC(${props.operation.canaryMetricDetails.canaryLatencyMetricDetails.successAlarmThreshold}:)`,
            keyPrefix: keyPrefix,
            color: MetricsHelper.colors[index]
          }),
        );

        zonalCanaryFaultCountMetrics.push(
          AvailabilityAndLatencyMetrics.createZonalAvailabilityMetric({
            availabilityZoneId: availabilityZoneId,
            availabilityZone: availabilityZone,
            metricDetails:
              props.operation.canaryMetricDetails
                .canaryAvailabilityMetricDetails,
            label: availabilityZoneId,
            metricType: AvailabilityMetricType.FAULT_COUNT,
            keyPrefix: keyPrefix,
            color: MetricsHelper.colors[index]
          },
          props.operation.serverSideLatencyMetricDetails.metricDimensions.zonalDimensions(
            availabilityZoneId,
            Aws.REGION
          )),
        );
      }
    });

    topLevelOperationAlarmsAndMetrics.push(
      new GraphWidget({
        height: 6,
        width: 6,
        title: "Request Count",
        region: Aws.REGION,
        left: props.availabilityZones.map((availabilityZone: string, index: number) => {
          let azLetter: string = availabilityZone.substring(availabilityZone.length - 1);
          let availabilityZoneId: string = props.azMapper.availabilityZoneIdFromAvailabilityZoneLetter(azLetter);

          return AvailabilityAndLatencyMetrics.createZonalAvailabilityMetric({
            availabilityZoneId: availabilityZoneId,
            availabilityZone: availabilityZone,
            label: availabilityZoneId,
            metricDetails:
              props.operation.serverSideAvailabilityMetricDetails,
            metricType: AvailabilityMetricType.REQUEST_COUNT,
            color: MetricsHelper.colors[index]
          },
          props.operation.serverSideLatencyMetricDetails.metricDimensions.zonalDimensions(
            availabilityZoneId,
            Aws.REGION
          ))
        }),
        statistic: 'Sum',
        leftYAxis: {
          label: 'Count',
          showUnits: false,
        },
      }),
    );

    topLevelOperationAlarmsAndMetrics.push(
      new GraphWidget({
        height: 6,
        width: 6,
        title: 'Server-side Fault Count',
        left: zonalServerSideFaultCountMetrics,
        leftYAxis: {
          min: 0,
          showUnits: false,
          label: "Count"
        }
      }),
    );

    if (zonalCanaryFaultCountMetrics.length > 0) {
      topLevelOperationAlarmsAndMetrics.push(
        new GraphWidget({
          height: 6,
          width: 6,
          title: 'Canary Fault Count',
          left: zonalCanaryFaultCountMetrics,
          leftYAxis: {
            min: 0,
            showUnits: false,
            label: "Count"
          }
        }),
      );
    }

    topLevelOperationAlarmsAndMetrics.push(
      new GraphWidget({
        height: 6,
        width: 6,
        title: 'Server-side High Latency Request Count',
        left: zonalServerSideHighLatencyMetrics,
      }),
    );

    if (zonalCanaryHighLatencyMetrics.length > 0) {
      topLevelOperationAlarmsAndMetrics.push(
        new GraphWidget({
          height: 6,
          width: 6,
          title: 'Canary High Latency Request count',
          left: zonalCanaryHighLatencyMetrics,
        }),
      );
    }

    return topLevelOperationAlarmsAndMetrics;
  }

  private static createAvailabilityWidgets(
    props: OperationAvailabilityWidgetProps,
    title: string,
  ): IWidget[] {
    let availabilityWidgets: IWidget[] = [];
    availabilityWidgets.push(
      new TextWidget({ height: 2, width: 24, markdown: title }),
    );

    availabilityWidgets.push(
      new GraphWidget({
        height: 6,
        width: 24,
        title: 'Server-side Availability',
        region: Aws.REGION,
        left: props.availabilityZones.map((availabilityZone: string) => {
          let azLetter: string = availabilityZone.substring(availabilityZone.length - 1);
          let availabilityZoneId: string = props.azMapper.availabilityZoneIdFromAvailabilityZoneLetter(azLetter);

          return AvailabilityAndLatencyMetrics.createZonalAvailabilityMetric({
            availabilityZoneId: availabilityZoneId,
            availabilityZone: availabilityZone,
            label: availabilityZoneId,
            metricDetails: props.availabilityMetricDetails,
            metricType: AvailabilityMetricType.SUCCESS_RATE
          },
          props.operation.serverSideLatencyMetricDetails.metricDimensions.zonalDimensions(
            availabilityZoneId,
            Aws.REGION
          ))
        }),
        statistic: 'Sum',
        leftYAxis: {
          max: 100,
          min: 95,
          label: 'Availability',
          showUnits: false,
        },
        leftAnnotations: [
          {
            value: props.availabilityMetricDetails.successAlarmThreshold,
            visible: true,
            color: Color.RED,
            label: 'High Severity',
          },
        ],
        right: props.availabilityZones.map((availabilityZone: string) => {
          let azLetter: string = availabilityZone.substring(availabilityZone.length - 1);
          let availabilityZoneId: string = props.azMapper.availabilityZoneIdFromAvailabilityZoneLetter(azLetter);

          return AvailabilityAndLatencyMetrics.createZonalAvailabilityMetric({
            availabilityZoneId: availabilityZoneId,
            availabilityZone: availabilityZone,
            label: availabilityZoneId,
            metricDetails: props.availabilityMetricDetails,
            metricType: AvailabilityMetricType.FAULT_COUNT
          },
          props.operation.serverSideLatencyMetricDetails.metricDimensions.zonalDimensions(
            availabilityZoneId,
            Aws.REGION
          ))
        }),
        rightYAxis: {
          label: 'Fault Count',
          showUnits: false,
        },
      }),
    );

    props.availabilityZones.forEach((availabilityZone: string, index: number) => {
      let azLetter: string = availabilityZone.substring(availabilityZone.length - 1);
      let availabilityZoneId: string = props.azMapper.availabilityZoneIdFromAvailabilityZoneLetter(azLetter);

      new AlarmWidget({
        height: 2,
        width: Math.floor(24 / props.zonalEndpointAvailabilityAlarms.length),
        region: Aws.REGION,
        alarm: props.zonalEndpointAvailabilityAlarms[index], // TODO: instead of assuming the alarms are in the same order as the ids, use a map with az letter and get the az id from the letter
        title: availabilityZoneId,
      })
    });

    if (!props.isCanary && props.instanceContributorsToFaults ) {
      availabilityWidgets.push(
        new ContributorInsightsWidget({
          height: 6,
          width: 24,
          title: 'Individual Instance Contributors to Fault Count',
          insightRule: props.instanceContributorsToFaults,
          period: props.availabilityMetricDetails.period,
          legendPosition: LegendPosition.BOTTOM,
          orderStatistic: 'Sum',
          accountId: Fn.ref('AWS::AccountId'),
          topContributors: 10,
        }),
      );
    }

    return availabilityWidgets;
  }

  private static createLatencyWidgets(
    props: OperationLatencyWidgetProps,
    title: string,
  ): IWidget[] {
    let latencyWidgets: IWidget[] = [];
    latencyWidgets.push(
      new TextWidget({ height: 2, width: 24, markdown: title }),
    );

    let keyPrefix: string = MetricsHelper.nextChar();

    let latencyMetrics: IMetric[] = [];

    let stats: string[] =
      props.latencyMetricDetails.graphedSuccessStatistics !== undefined
        ? props.latencyMetricDetails.graphedSuccessStatistics
        : ['p99'];

    let latencySuccessMetrics: IMetric[] = stats.map((x) => {
      
      return RegionalLatencyMetrics.createRegionalAverageLatencyMetric({
        label: x + ' Success Latency',
        metricDetails: props.latencyMetricDetails,
        metricType: LatencyMetricType.SUCCESS_LATENCY,
        statistic: x,
        keyPrefix: keyPrefix,
      });

      keyPrefix = MetricsHelper.nextChar(keyPrefix);
    });

    stats =
      props.latencyMetricDetails.graphedFaultStatistics !== undefined
        ? props.latencyMetricDetails.graphedFaultStatistics
        : ['p99'];

    let latencyFaultMetrics: IMetric[] = stats.map((x) => {
      keyPrefix = MetricsHelper.nextChar(keyPrefix);
      return RegionalLatencyMetrics.createRegionalAverageLatencyMetric({
        label: x + ' Fault Latency',
        metricDetails: props.latencyMetricDetails,
        metricType: LatencyMetricType.FAULT_LATENCY,
        statistic: x,
        keyPrefix: keyPrefix,
      });
    });

    latencyMetrics = latencySuccessMetrics.concat(latencyFaultMetrics);

    if (latencyMetrics.length > 0) {
      latencyWidgets.push(
        new GraphWidget({
          height: 8,
          width: 24,
          title: Fn.sub('${AWS::Region} Latency'),
          region: Aws.REGION,
          left: latencyMetrics,
          leftYAxis: {
            max: props.latencyMetricDetails.successAlarmThreshold * 1.5,
            min: 0,
            label: 'Latency',
            showUnits: false,
          },
          leftAnnotations: [
            {
              value: props.latencyMetricDetails.successAlarmThreshold,
              visible: true,
              color: Color.RED,
              label: 'High Severity',
            },
          ],
        }),
      );
    }

    latencyWidgets.push(
      new AlarmWidget({
        height: 2,
        width: 24,
        region: Aws.REGION,
        alarm: props.regionalEndpointLatencyAlarm,
      }),
    );

    keyPrefix = '';

    props.availabilityZones.forEach((availabilityZone: string) => {
      let azLetter: string = availabilityZone.substring(availabilityZone.length - 1);
      let availabilityZoneId: string = props.azMapper.availabilityZoneIdFromAvailabilityZoneLetter(azLetter);

      let latencyMetrics2: IMetric[] = [];

      let stats2: string[] = props.latencyMetricDetails.graphedSuccessStatistics
        ? props.latencyMetricDetails.graphedSuccessStatistics
        : ['p99'];

      let zonalSuccessLatencyMetrics: IMetric[] = stats2.map((x) => {
        keyPrefix = MetricsHelper.nextChar(keyPrefix);
        return ZonalLatencyMetrics.createZonalAverageLatencyMetric({
          label: x + ' Success Latency',
          metricDetails: props.latencyMetricDetails,
          metricType: LatencyMetricType.SUCCESS_LATENCY,
          statistic: x,
          availabilityZoneId: availabilityZoneId,
          availabilityZone: availabilityZone
        });
      });

      stats2 = props.latencyMetricDetails.graphedFaultStatistics
        ? props.latencyMetricDetails.graphedFaultStatistics
        : ['p99'];

      let zonalFaultLatencyMetrics: IMetric[] = stats2.map((x) => {
        keyPrefix = MetricsHelper.nextChar(keyPrefix);
        return ZonalLatencyMetrics.createZonalAverageLatencyMetric({
          label: x + ' Fault Latency',
          metricDetails: props.latencyMetricDetails,
          metricType: LatencyMetricType.FAULT_LATENCY,
          statistic: x,
          availabilityZoneId: availabilityZoneId,
          availabilityZone: availabilityZone
        });
      });

      latencyMetrics2 = zonalSuccessLatencyMetrics.concat(
        zonalFaultLatencyMetrics,
      );

      if (latencyMetrics2.length > 0) {
        latencyWidgets.push(
          new GraphWidget({
            height: 6,
            width: 8,
            title: availabilityZoneId + ' Latency',
            region: Aws.REGION,
            left: latencyMetrics2,
            leftAnnotations: [
              {
                value: props.latencyMetricDetails.successAlarmThreshold,
                visible: true,
                color: Color.RED,
                label: 'High Severity',
              },
            ],
            leftYAxis: {
              max: props.latencyMetricDetails.successAlarmThreshold * 1.5,
              min: 0,
              label: 'Latency',
              showUnits: false,
            },
          }),
        );
      }
    });

    if (
      !props.isCanary &&
      props.instanceContributorsToHighLatency !== undefined &&
      props.instanceContributorsToHighLatency != null
    ) {
      latencyWidgets.push(
        new ContributorInsightsWidget({
          height: 6,
          width: 24,
          title: 'Individual Instance Contributors to High Latency',
          insightRule: props.instanceContributorsToHighLatency,
          period: props.latencyMetricDetails.period,
          legendPosition: LegendPosition.BOTTOM,
          orderStatistic: 'Sum',
          accountId: Fn.ref('AWS::AccountId'),
          topContributors: 10,
        }),
      );
    }

    return latencyWidgets;
  }

  /**
   * The operation level dashboard
   */
  dashboard: Dashboard;

  constructor(
    scope: Construct,
    id: string,
    props: OperationAvailabilityAndLatencyDashboardProps,
  ) {
    super(scope, id);

    let widgets: IWidget[][] = [];

    widgets.push(
      OperationAvailabilityAndLatencyDashboard.createTopLevelAggregateAlarmWidgets(
        props
      ),
    );

    widgets.push(
      OperationAvailabilityAndLatencyDashboard.createAvailabilityWidgets(
        {
          operation: props.operation,
          availabilityMetricDetails:
            props.operation.serverSideAvailabilityMetricDetails,
          availabilityZones: props.availabilityZones,
          isCanary: false,
          zonalEndpointAvailabilityAlarms:
            props.zonalEndpointServerAvailabilityAlarms,
          regionalEndpointAvailabilityAlarm:
            props.regionalEndpointServerAvailabilityAlarm,
          instanceContributorsToFaults: props.instanceContributorsToFaults,
          azMapper: props.azMapper
        },
        '**Server-side Availability**',
      ),
    );

    widgets.push(
      OperationAvailabilityAndLatencyDashboard.createLatencyWidgets(
        {
          operation: props.operation,
          latencyMetricDetails: props.operation.serverSideLatencyMetricDetails,
          availabilityZones: props.availabilityZones,
          isCanary: false,
          zonalEndpointLatencyAlarms: props.zonalEndpointServerLatencyAlarms,
          regionalEndpointLatencyAlarm:
            props.regionalEndpointServerLatencyAlarm,
          instanceContributorsToHighLatency:
            props.instanceContributorsToHighLatency,
          azMapper: props.azMapper
        },
        '**Server-side Latency**',
      ),
    );

    if (
      props.operation.canaryMetricDetails !== undefined &&
      props.operation.canaryMetricDetails != null
    ) {
      if (
        props.zonalEndpointCanaryAvailabilityAlarms &&
        props.zonalEndpointCanaryLatencyAlarms &&
        props.regionalEndpointCanaryAvailabilityAlarm &&
        props.regionalEndpointCanaryLatencyAlarm
      ) {
        widgets.push(
          OperationAvailabilityAndLatencyDashboard.createAvailabilityWidgets(
            {
              operation: props.operation,
              availabilityMetricDetails:
                props.operation.canaryMetricDetails
                  .canaryAvailabilityMetricDetails,
              availabilityZones: props.availabilityZones,
              isCanary: true,
              zonalEndpointAvailabilityAlarms:
                props.zonalEndpointCanaryAvailabilityAlarms,
              regionalEndpointAvailabilityAlarm:
                props.regionalEndpointCanaryAvailabilityAlarm,
              azMapper: props.azMapper
            },
            '**Canary Measured Availability**',
          ),
        );

        widgets.push(
          OperationAvailabilityAndLatencyDashboard.createLatencyWidgets(
            {
              operation: props.operation,
              latencyMetricDetails:
                props.operation.canaryMetricDetails.canaryLatencyMetricDetails,
              availabilityZones: props.availabilityZones,
              isCanary: true,
              zonalEndpointLatencyAlarms:
                props.zonalEndpointCanaryLatencyAlarms,
              regionalEndpointLatencyAlarm:
                props.regionalEndpointCanaryLatencyAlarm,
              azMapper: props.azMapper
            },
            '**Canary Measured Latency**',
          ),
        );
      }
    }

    this.dashboard = new Dashboard(this, 'Dashboard', {
      dashboardName:
        props.operation.service.serviceName.toLowerCase() +
        '-' +
        props.operation.operationName.toLowerCase() +
        Fn.sub('-availability-and-latency-${AWS::Region}'),
      defaultInterval: props.interval,
      periodOverride: PeriodOverride.AUTO,
      widgets: widgets,
    });
  }
}
