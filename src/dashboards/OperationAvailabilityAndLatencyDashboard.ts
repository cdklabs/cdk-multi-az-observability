// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { Fn } from 'aws-cdk-lib';
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
import {
  BaseLoadBalancer,
  CfnLoadBalancer,
  IApplicationLoadBalancer,
} from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import { Construct } from 'constructs';
import { ContributorInsightsWidget } from './ContributorInsightsWidget';
import { IOperationAvailabilityAndLatencyDashboard } from './IOperationAvailabilityAndLatencyDashboard';
import { OperationAvailabilityAndLatencyDashboardProps } from './props/OperationAvailabilityAndLatencyDashboardProps';
import { OperationAvailabilityWidgetProps } from './props/OperationAvailabilityWidgetProps';
import { OperationLatencyWidgetProps } from './props/OperationLatencyWidgetProps';
import { IAvailabilityZoneMapper } from '../azmapper/IAvailabilityZoneMapper';
import { ApplicationLoadBalancerMetrics } from '../metrics/ApplicationLoadBalancerMetrics';
import { NetworkLoadBalancerMetrics } from '../metrics/NetworkLoadBalancerMetrics';
import { RegionalAvailabilityMetrics } from '../metrics/RegionalAvailabilityMetrics';
import { RegionalLatencyMetrics } from '../metrics/RegionalLatencyMetrics';
import { ZonalAvailabilityMetrics } from '../metrics/ZonalAvailabilityMetrics';
import { ZonalLatencyMetrics } from '../metrics/ZonalLatencyMetrics';
import { AvailabilityMetricType } from '../utilities/AvailabilityMetricType';
import { LatencyMetricType } from '../utilities/LatencyMetricType';
import { MetricsHelper } from '../utilities/MetricsHelper';

/**
 * Creates an operation level availability and latency dashboard
 */
export class OperationAvailabilityAndLatencyDashboard
  extends Construct
  implements IOperationAvailabilityAndLatencyDashboard {
  private static createTopLevelAggregateAlarmWidgets(
    props: OperationAvailabilityAndLatencyDashboardProps,
    title: string,
    availabilityZoneIds: string[],
  ): IWidget[] {
    let topLevelAggregateAlarms: IWidget[] = [
      new TextWidget({ height: 2, width: 24, markdown: title }),
      new AlarmStatusWidget({
        height: 2,
        width: 24,
        alarms: [props.regionalImpactAlarm],
        title: props.operation.operationName + ' Regional Impact',
      }),
    ];

    for (let i = 0; i < availabilityZoneIds.length; i++) {
      let availabilityZoneId = availabilityZoneIds[i];

      topLevelAggregateAlarms.push(
        new AlarmStatusWidget({
          height: 2,
          width: 8,
          alarms: [props.isolatedAZImpactAlarms[i]],
          title: availabilityZoneId + ' Isolated Impact',
        }),
      );
    }

    topLevelAggregateAlarms.push(
      new TextWidget({ height: 2, width: 24, markdown: '**AZ Contributors**' }),
    );

    let zonalServerSideHighLatencyMetrics: IMetric[] = [];
    let zonalServerSideFaultCountMetrics: IMetric[] = [];

    let zonalCanaryHighLatencyMetrics: IMetric[] = [];
    let zonalCanaryFaultCountMetrics: IMetric[] = [];

    let keyPrefix: string = MetricsHelper.nextChar('');

    for (let i = 0; i < availabilityZoneIds.length; i++) {
      let availabilityZoneId: string = availabilityZoneIds[i];

      zonalServerSideHighLatencyMetrics.push(
        ZonalLatencyMetrics.createZonalCountLatencyMetric({
          availabilityZoneId: availabilityZoneId,
          metricDetails: props.operation.serverSideLatencyMetricDetails,
          label: availabilityZoneId + ' high latency responses',
          metricType: LatencyMetricType.SUCCESS_LATENCY,
          statistic: `TC(${props.operation.serverSideLatencyMetricDetails.successAlarmThreshold}:)`,
          keyPrefix: keyPrefix,
        }),
      );

      zonalServerSideFaultCountMetrics.push(
        ZonalAvailabilityMetrics.createZonalAvailabilityMetric({
          availabilityZoneId: availabilityZoneId,
          metricDetails: props.operation.serverSideAvailabilityMetricDetails,
          label: availabilityZoneId + ' fault count',
          metricType: AvailabilityMetricType.FAULT_COUNT,
          keyPrefix: keyPrefix,
        }),
      );

      if (
        props.operation.canaryMetricDetails !== undefined &&
        props.operation.canaryMetricDetails != null
      ) {
        zonalCanaryHighLatencyMetrics.push(
          ZonalLatencyMetrics.createZonalCountLatencyMetric({
            availabilityZoneId: availabilityZoneId,
            metricDetails:
              props.operation.canaryMetricDetails.canaryLatencyMetricDetails,
            label: availabilityZoneId + ' high latency responses',
            metricType: LatencyMetricType.SUCCESS_LATENCY,
            statistic: `TC(${props.operation.canaryMetricDetails.canaryLatencyMetricDetails.successAlarmThreshold}:)`,
            keyPrefix: keyPrefix,
          }),
        );

        zonalCanaryFaultCountMetrics.push(
          ZonalAvailabilityMetrics.createZonalAvailabilityMetric({
            availabilityZoneId: availabilityZoneId,
            metricDetails:
              props.operation.canaryMetricDetails
                .canaryAvailabilityMetricDetails,
            label: availabilityZoneId + ' fault count',
            metricType: AvailabilityMetricType.FAULT_COUNT,
            keyPrefix: keyPrefix,
          }),
        );
      }

      keyPrefix = MetricsHelper.nextChar(keyPrefix);
    }

    topLevelAggregateAlarms.push(
      new GraphWidget({
        height: 6,
        width: 24,
        title: 'Server-side AZ Fault Contributors',
        left: zonalServerSideFaultCountMetrics,
      }),
    );

    if (zonalCanaryFaultCountMetrics.length > 0) {
      topLevelAggregateAlarms.push(
        new GraphWidget({
          height: 6,
          width: 24,
          title: 'Canary AZ Fault Contributors',
          left: zonalCanaryFaultCountMetrics,
        }),
      );
    }

    topLevelAggregateAlarms.push(
      new GraphWidget({
        height: 6,
        width: 24,
        title: 'Server-side High Latency Contributors',
        left: zonalServerSideHighLatencyMetrics,
      }),
    );

    if (zonalCanaryHighLatencyMetrics.length > 0) {
      topLevelAggregateAlarms.push(
        new GraphWidget({
          height: 6,
          width: 24,
          title: 'Canary High Latency Contributors',
          left: zonalCanaryHighLatencyMetrics,
        }),
      );
    }

    topLevelAggregateAlarms.push(
      new TextWidget({ height: 2, width: 24, markdown: '**TPS Metrics**' }),
    );

    topLevelAggregateAlarms.push(
      new GraphWidget({
        height: 6,
        width: 24,
        title: Fn.sub('${AWS::Region} TPS'),
        region: Fn.sub('${AWS::Region}'),
        left: [
          RegionalAvailabilityMetrics.createRegionalAvailabilityMetric({
            label: Fn.ref('AWS::Region') + ' tps',
            metricDetails: props.operation.serverSideAvailabilityMetricDetails,
            metricType: AvailabilityMetricType.REQUEST_COUNT,
          }),
        ],
        statistic: 'Sum',
        leftYAxis: {
          label: 'TPS',
          showUnits: false,
        },
      }),
    );

    for (let i = 0; i < availabilityZoneIds.length; i++) {
      let availabilityZoneId: string = availabilityZoneIds[i];

      topLevelAggregateAlarms.push(
        new GraphWidget({
          height: 6,
          width: 8,
          title: availabilityZoneId + ' TPS',
          region: Fn.sub('${AWS::Region}'),
          left: [
            ZonalAvailabilityMetrics.createZonalAvailabilityMetric({
              availabilityZoneId: availabilityZoneId,
              label: availabilityZoneId + ' tps',
              metricDetails:
                props.operation.serverSideAvailabilityMetricDetails,
              metricType: AvailabilityMetricType.REQUEST_COUNT,
            }),
          ],
          statistic: 'Sum',
          leftYAxis: {
            label: 'TPS',
            showUnits: false,
          },
        }),
      );
    }

    return topLevelAggregateAlarms;
  }

  private static createAvailabilityWidgets(
    props: OperationAvailabilityWidgetProps,
    title: string,
  ): IWidget[] {
    let availabilityWidgets: IWidget[] = [];
    availabilityWidgets.push(
      new TextWidget({ height: 2, width: 24, markdown: title }),
    );

    let rowTracker: number = 0;
    let keyPrefix1: string = MetricsHelper.nextChar('');
    let keyPrefix2: string = MetricsHelper.nextChar(keyPrefix1);

    // Create regional availability and fault metrics and availability alarm widgets
    availabilityWidgets.push(
      new GraphWidget({
        height: 8,
        width: 24,
        title: Fn.sub('${AWS::Region} Availability'),
        region: Fn.sub('${AWS::Region}'),
        left: [
          RegionalAvailabilityMetrics.createRegionalAvailabilityMetric({
            label: Fn.ref('AWS::Region') + ' availability',
            metricDetails: props.availabilityMetricDetails,
            metricType: AvailabilityMetricType.SUCCESS_RATE,
            keyPrefix: keyPrefix1,
          }),
        ],
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
        right: [
          RegionalAvailabilityMetrics.createRegionalAvailabilityMetric({
            label: Fn.ref('AWS::Region') + ' fault count',
            metricDetails: props.availabilityMetricDetails,
            metricType: AvailabilityMetricType.FAULT_COUNT,
            keyPrefix: keyPrefix2,
          }),
        ],
        rightYAxis: {
          label: 'Fault Count',
          showUnits: false,
        },
      }),
    );

    availabilityWidgets.push(
      new AlarmWidget({
        height: 2,
        width: 24,
        region: Fn.sub('${AWS::Region}'),
        alarm: props.regionalEndpointAvailabilityAlarm,
        title: 'Success Rate',
      }),
    );

    for (let i = 0; i < props.availabilityZoneIds.length; i++) {
      let availabilityZoneId: string = props.availabilityZoneIds[i];

      let keyPrefix3: string = MetricsHelper.nextChar('');
      let keyPrefix4: string =
        MetricsHelper.nextChar(keyPrefix3);

      availabilityWidgets.push(
        new GraphWidget({
          height: 6,
          width: 8,
          title: availabilityZoneId + ' Availability',
          region: Fn.sub('${AWS::Region}'),
          left: [
            ZonalAvailabilityMetrics.createZonalAvailabilityMetric({
              availabilityZoneId: availabilityZoneId,
              label: availabilityZoneId + ' availability',
              metricDetails: props.availabilityMetricDetails,
              metricType: AvailabilityMetricType.SUCCESS_RATE,
              keyPrefix: keyPrefix3,
            }),
          ],
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
          right: [
            ZonalAvailabilityMetrics.createZonalAvailabilityMetric({
              availabilityZoneId: availabilityZoneId,
              label: availabilityZoneId + ' fault count',
              metricDetails: props.availabilityMetricDetails,
              metricType: AvailabilityMetricType.FAULT_COUNT,
              keyPrefix: keyPrefix4,
            }),
          ],
          rightYAxis: {
            label: 'Fault Count',
            showUnits: false,
          },
        }),
      );

      //We're on the third one for this set, add 3 alarms
      //or if we're at the end, at the necessary amount
      //of alarms, 1, 2, or 3
      if (i % 3 == 2 || i - 1 == props.availabilityZoneIds.length) {
        for (let k = rowTracker; k <= i; k++) {
          availabilityWidgets.push(
            new AlarmWidget({
              height: 2,
              width: 8,
              region: Fn.sub('${AWS::Region}'),
              alarm: props.zonalEndpointAvailabilityAlarms[k],
              title: 'Success Rate',
            }),
          );
        }

        rowTracker += i + 1;
      }
    }

    if (
      !props.isCanary &&
      props.instanceContributorsToFaults !== undefined &&
      props.instanceContributorsToFaults != null
    ) {
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

    let rowTracker: number = 0;
    let keyPrefix: string = '';

    let latencyMetrics: IMetric[] = [];

    let stats: string[] =
      props.latencyMetricDetails.graphedSuccessStatistics !== undefined
        ? props.latencyMetricDetails.graphedSuccessStatistics
        : ['p99'];

    let latencySuccessMetrics: IMetric[] = stats.map((x) => {
      keyPrefix = MetricsHelper.nextChar(keyPrefix);
      return RegionalLatencyMetrics.createRegionalAverageLatencyMetric({
        label: x + ' Success Latency',
        metricDetails: props.latencyMetricDetails,
        metricType: LatencyMetricType.SUCCESS_LATENCY,
        statistic: x,
        keyPrefix: keyPrefix,
      });
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
          region: Fn.sub('${AWS::Region}'),
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
        region: Fn.sub('${AWS::Region}'),
        alarm: props.regionalEndpointLatencyAlarm,
      }),
    );

    keyPrefix = '';

    for (let i = 0; i < props.availabilityZoneIds.length; i++) {
      let availabilityZoneId: string = props.availabilityZoneIds[i];

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
          keyPrefix: keyPrefix,
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
          keyPrefix: keyPrefix,
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
            region: Fn.sub('${AWS::Region}'),
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

      //We're on the third one for this set, add 3 alarms
      //or if we're at the end, at the necessary amount
      //of alarms, 1, 2, or 3
      if (i % 3 == 2 || i - 1 == props.availabilityZoneIds.length) {
        for (let k = rowTracker; k <= i; k++) {
          latencyWidgets.push(
            new AlarmWidget({
              height: 2,
              width: 8,
              region: Fn.sub('${AWS::Region}'),
              alarm: props.zonalEndpointLatencyAlarms[k],
            }),
          );
        }
        rowTracker += i + 1;
      }
    }

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

  private static createApplicationLoadBalancerWidgets(
    props: OperationAvailabilityAndLatencyDashboardProps,
    title: string,
    availabilityZoneNames: string[],
  ): IWidget[] {
    let albWidgets: IWidget[] = [];

    albWidgets.push(new TextWidget({ height: 2, width: 24, markdown: title }));

    albWidgets.push(
      new GraphWidget({
        height: 8,
        width: 24,
        title: Fn.sub('${AWS::Region} Processed Bytes'),
        region: Fn.sub('${AWS::Region}'),
        left: [
          ApplicationLoadBalancerMetrics.getRegionalProcessedBytesMetric(
            props.loadBalancer as IApplicationLoadBalancer,
            props.operation.serverSideAvailabilityMetricDetails.period,
          ),
        ],
        leftYAxis: {
          label: 'Processed Bytes',
          showUnits: true,
        },
      }),
    );

    availabilityZoneNames.forEach((availabilityZoneName) => {
      let availabilityZoneId: string =
        props.azMapper.availabilityZoneIdFromAvailabilityZoneLetter(
          availabilityZoneName.substring(availabilityZoneName.length - 1),
        );

      albWidgets.push(
        new GraphWidget({
          height: 6,
          width: 8,
          title: availabilityZoneId + ' Processed Bytes',
          region: Fn.sub('${AWS::Region}'),
          left: [
            ApplicationLoadBalancerMetrics.getPerAZProcessedBytesMetric(
              props.loadBalancer as IApplicationLoadBalancer,
              availabilityZoneName,
              availabilityZoneId,
              props.operation.serverSideAvailabilityMetricDetails.period,
            ),
          ],
          leftYAxis: {
            label: 'Processed Bytes',
            showUnits: true,
          },
        }),
      );
    });

    return albWidgets;
  }

  private static createNetworkLoadBalancerWidgets(
    props: OperationAvailabilityAndLatencyDashboardProps,
    title: string,
    availabilityZoneNames: string[],
  ): IWidget[] {
    let nlbWidgets: IWidget[] = [];
    let loadBalancerFullName: string = (props.loadBalancer as BaseLoadBalancer)
      .loadBalancerFullName;

    nlbWidgets.push(new TextWidget({ height: 2, width: 24, markdown: title }));

    nlbWidgets.push(
      new GraphWidget({
        height: 8,
        width: 24,
        title: Fn.sub('${AWS::Region} Processed Bytes'),
        region: Fn.sub('${AWS::Region}'),
        left: [
          NetworkLoadBalancerMetrics.createRegionalNetworkLoadBalancerProcessedBytesMetric(
            loadBalancerFullName,
            props.operation.serverSideAvailabilityMetricDetails.period,
          ),
        ],
        leftYAxis: {
          label: 'Processed Bytes',
          showUnits: true,
        },
      }),
    );

    availabilityZoneNames.forEach((availabilityZoneName) => {
      let availabilityZoneId: string =
        props.azMapper.availabilityZoneIdFromAvailabilityZoneLetter(
          availabilityZoneName.substring(availabilityZoneName.length - 1),
        );

      nlbWidgets.push(
        new GraphWidget({
          height: 6,
          width: 8,
          title: availabilityZoneId + ' Processed Bytes',
          region: Fn.sub('${AWS::Region}'),
          left: [
            NetworkLoadBalancerMetrics.createZonalNetworkLoadBalancerProcessedBytesMetric(
              loadBalancerFullName,
              availabilityZoneName,
              props.operation.serverSideAvailabilityMetricDetails.period,
            ),
          ],
          leftYAxis: {
            label: 'Processed Bytes',
            showUnits: true,
          },
        }),
      );
    });

    return nlbWidgets;
  }

  /**
   * The operation level dashboard
   */
  dashboard: Dashboard;

  private azMapper: IAvailabilityZoneMapper;

  constructor(
    scope: Construct,
    id: string,
    props: OperationAvailabilityAndLatencyDashboardProps,
  ) {
    super(scope, id);

    let widgets: IWidget[][] = [];

    this.azMapper = props.azMapper;

    let availabilityZoneIds: string[] =
      props.operation.service.availabilityZoneNames.map((x) => {
        return this.azMapper.availabilityZoneIdFromAvailabilityZoneLetter(
          x.substring(x.length - 1),
        );
      });

    widgets.push(
      OperationAvailabilityAndLatencyDashboard.createTopLevelAggregateAlarmWidgets(
        props,
        '**Top Level Aggregate Alarms**',
        availabilityZoneIds,
      ),
    );

    widgets.push(
      OperationAvailabilityAndLatencyDashboard.createAvailabilityWidgets(
        {
          operation: props.operation,
          availabilityMetricDetails:
            props.operation.serverSideAvailabilityMetricDetails,
          availabilityZoneIds: availabilityZoneIds,
          isCanary: false,
          zonalEndpointAvailabilityAlarms:
            props.zonalEndpointServerAvailabilityAlarms,
          regionalEndpointAvailabilityAlarm:
            props.regionalEndpointServerAvailabilityAlarm,
          instanceContributorsToFaults: props.instanceContributorsToFaults,
        },
        '**Server-side Availability**',
      ),
    );

    widgets.push(
      OperationAvailabilityAndLatencyDashboard.createLatencyWidgets(
        {
          operation: props.operation,
          latencyMetricDetails: props.operation.serverSideLatencyMetricDetails,
          availabilityZoneIds: availabilityZoneIds,
          isCanary: false,
          zonalEndpointLatencyAlarms: props.zonalEndpointServerLatencyAlarms,
          regionalEndpointLatencyAlarm:
            props.regionalEndpointServerLatencyAlarm,
          instanceContributorsToHighLatency:
            props.instanceContributorsToHighLatency,
        },
        '**Server-side Latency**',
      ),
    );

    let lb: CfnLoadBalancer = props.loadBalancer?.node
      .defaultChild as CfnLoadBalancer;

    if (lb !== undefined && lb != null) {
      if (lb.type == 'application') {
        widgets.push(
          OperationAvailabilityAndLatencyDashboard.createApplicationLoadBalancerWidgets(
            props,
            '**Application Load Balancer Metrics**',
            props.operation.service.availabilityZoneNames,
          ),
        );
      } else if (lb.type == 'network') {
        widgets.push(
          OperationAvailabilityAndLatencyDashboard.createNetworkLoadBalancerWidgets(
            props,
            '**Network Load Balancer Metrics**',
            props.operation.service.availabilityZoneNames,
          ),
        );
      }
    }

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
              availabilityZoneIds: availabilityZoneIds,
              isCanary: true,
              zonalEndpointAvailabilityAlarms:
                props.zonalEndpointCanaryAvailabilityAlarms,
              regionalEndpointAvailabilityAlarm:
                props.regionalEndpointCanaryAvailabilityAlarm,
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
              availabilityZoneIds: availabilityZoneIds,
              isCanary: true,
              zonalEndpointLatencyAlarms:
                props.zonalEndpointCanaryLatencyAlarms,
              regionalEndpointLatencyAlarm:
                props.regionalEndpointCanaryLatencyAlarm,
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
        Fn.sub('-operation-availability-and-latency-${AWS::Region}'),
      defaultInterval: props.interval,
      periodOverride: PeriodOverride.INHERIT,
      widgets: widgets,
    });
  }
}
