// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { Fn } from 'aws-cdk-lib';
import {
  AlarmStatusWidget,
  Color,
  Dashboard,
  GraphWidget,
  IMetric,
  IWidget,
  MathExpression,
  PeriodOverride,
  TextWidget,
} from 'aws-cdk-lib/aws-cloudwatch';
import {
  CfnLoadBalancer,
  IApplicationLoadBalancer,
} from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import { Construct } from 'constructs';
import { IServiceAvailabilityAndLatencyDashboard } from './IServiceAvailabilityAndLatencyDashboard';
import { ServiceAvailabilityAndLatencyDashboardProps } from './props/ServiceAvailabilityAndLatencyDashboardProps';
import { ApplicationLoadBalancerMetrics } from '../metrics/ApplicationLoadBalancerMetrics';
import { AvailabilityMetricProps } from '../metrics/props/AvailabilityMetricProps';
import { LatencyMetricProps } from '../metrics/props/LatencyMetricProps';
import { RegionalAvailabilityMetrics } from '../metrics/RegionalAvailabilityMetrics';
import { RegionalLatencyMetrics } from '../metrics/RegionalLatencyMetrics';
import { ZonalAvailabilityMetrics } from '../metrics/ZonalAvailabilityMetrics';
import { ZonalLatencyMetrics } from '../metrics/ZonalLatencyMetrics';
import { IOperation } from '../services/IOperation';
import { IOperationMetricDetails } from '../services/IOperationMetricDetails';
import { AvailabilityMetricType } from '../utilities/AvailabilityMetricType';
import { LatencyMetricType } from '../utilities/LatencyMetricType';
import { MetricsHelper } from '../utilities/MetricsHelper';

/**
 * Creates a service level availability and latency dashboard
 */
export class ServiceAvailabilityAndLatencyDashboard
  extends Construct
  implements IServiceAvailabilityAndLatencyDashboard {
  private static generateTPSWidgets(
    props: ServiceAvailabilityAndLatencyDashboardProps,
    availabilityZoneIds: string[],
  ): IWidget[] {
    let widgets: IWidget[] = [];

    widgets.push(
      new TextWidget({ height: 2, width: 24, markdown: '**TPS Metrics**' }),
    );

    widgets.push(
      new GraphWidget({
        height: 6,
        width: 24,
        title: Fn.ref('AWS::Region') + ' TPS',
        region: Fn.ref('AWS::Region'),
        left: RegionalAvailabilityMetrics.createRegionalServiceAvailabilityMetrics(
          {
            label: Fn.ref('AWS::Region') + ' tps',
            period: props.service.period,
            availabilityMetricProps: props.service.operations
              .filter((x) => x.critical)
              .map((x) => {
                return {
                  label: x.operationName,
                  metricDetails: x.serverSideAvailabilityMetricDetails,
                  metricType: AvailabilityMetricType.REQUEST_COUNT,
                };
              }),
          },
        ),
        statistic: 'Sum',
        leftYAxis: {
          label: 'TPS',
          showUnits: false,
        },
      }),
    );

    for (let i = 0; i < availabilityZoneIds.length; i++) {
      let availabilityZoneId: string = availabilityZoneIds[i];

      let zonalMetricProps = {
        availabilityMetricProps: props.service.operations
          .filter((x) => x.critical)
          .map((x) => {
            return {
              availabilityZoneId: availabilityZoneId,
              label: x.operationName,
              metricDetails: x.serverSideAvailabilityMetricDetails,
              metricType: AvailabilityMetricType.REQUEST_COUNT,
            };
          }),
        period: props.service.period,
        label: availabilityZoneId + 'tps',
      };

      widgets.push(
        new GraphWidget({
          height: 6,
          width: 8,
          title: availabilityZoneId + ' TPS',
          region: Fn.ref('AWS::Region'),
          left: ZonalAvailabilityMetrics.createZonalServiceAvailabilityMetrics(
            zonalMetricProps,
          ),
          statistic: 'Sum',
          leftYAxis: {
            label: 'TPS',
            showUnits: false,
          },
        }),
      );
    }

    return widgets;
  }

  private static generateServerSideAndCanaryAvailabilityWidgets(
    props: ServiceAvailabilityAndLatencyDashboardProps,
    availabilityZoneIds: string[],
  ): IWidget[] {
    let widgets: IWidget[] = [];

    widgets.push(
      new TextWidget({
        height: 2,
        width: 24,
        markdown:
          '**Server-side Availability**\n(Each critical operation is equally weighted regardless of request volume)',
      }),
    );

    widgets = widgets.concat(
      ServiceAvailabilityAndLatencyDashboard.generateAvailabilityWidgets(
        props,
        false,
        availabilityZoneIds,
      ),
    );

    if (
      props.service.operations.filter(
        (x) => x.critical && x.canaryMetricDetails !== undefined,
      ).length > 0
    ) {
      widgets.push(
        new TextWidget({
          height: 2,
          width: 24,
          markdown:
            '**Canary Measured Availability**\n(Each operation is equally weighted regardless of request volume)',
        }),
      );

      widgets = widgets.concat(
        ServiceAvailabilityAndLatencyDashboard.generateAvailabilityWidgets(
          props,
          true,
          availabilityZoneIds,
        ),
      );
    }

    return widgets;
  }

  private static generateServerSideAndCanaryLatencyWidgets(
    props: ServiceAvailabilityAndLatencyDashboardProps,
    availabilityZoneIds: string[],
  ): IWidget[] {
    let widgets: IWidget[] = [];

    widgets.push(
      new TextWidget({
        height: 2,
        width: 24,
        markdown:
          '**Server-side Latency**\n(Counts of requests exceeding the per-operation latency threshold)',
      }),
    );

    widgets = widgets.concat(
      ServiceAvailabilityAndLatencyDashboard.generateLatencyMetricWidgets(
        props,
        false,
        availabilityZoneIds,
      ),
    );

    if (
      props.service.operations.filter(
        (x) => x.critical && x.canaryMetricDetails !== undefined,
      ).length > 0
    ) {
      widgets.push(
        new TextWidget({
          height: 2,
          width: 24,
          markdown:
            '**Canary Measured Latency**\n(Counts of requests exceeding the per-operation latency threshold)',
        }),
      );

      widgets = widgets.concat(
        ServiceAvailabilityAndLatencyDashboard.generateLatencyMetricWidgets(
          props,
          true,
          availabilityZoneIds,
        ),
      );
    }

    return widgets;
  }

  private static generateAvailabilityWidgets(
    props: ServiceAvailabilityAndLatencyDashboardProps,
    isCanary: boolean,
    availabilityZoneIds: string[],
  ): IWidget[] {
    let widgets: IWidget[] = [];

    widgets.push(
      new GraphWidget({
        height: 6,
        width: 24,
        title: Fn.ref('AWS::Region') + ' Availability',
        region: Fn.ref('AWS::Region'),
        left: RegionalAvailabilityMetrics.createRegionalServiceAvailabilityMetrics(
          {
            label: Fn.ref('AWS::Region') + ' availability',
            period: props.service.period,
            availabilityMetricProps: this.createRegionalAvailabilityMetricProps(
              props.service.operations.filter((x) => x.critical),
              isCanary,
              AvailabilityMetricType.SUCCESS_RATE,
            ),
          },
        ),
        statistic: 'Sum',
        leftYAxis: {
          max: 100,
          min: 95,
          label: 'Availability',
          showUnits: false,
        },
        right:
          RegionalAvailabilityMetrics.createRegionalServiceAvailabilityMetrics({
            label: Fn.ref('AWS::Region') + ' faults',
            period: props.service.period,
            availabilityMetricProps: this.createRegionalAvailabilityMetricProps(
              props.service.operations.filter((x) => x.critical),
              isCanary,
              AvailabilityMetricType.FAULT_COUNT,
            ),
          }),
        rightYAxis: {
          label: 'Faults',
          showUnits: false,
          min: 0,
          max: Math.ceil(props.service.faultCountThreshold * 1.5),
        },
        rightAnnotations: [
          {
            color: Color.RED,
            label: 'High severity',
            value: props.service.faultCountThreshold,
          },
        ],
      }),
    );

    for (let i = 0; i < availabilityZoneIds.length; i++) {
      let availabilityZoneId = availabilityZoneIds[i];

      widgets.push(
        new GraphWidget({
          height: 6,
          width: 8,
          title: availabilityZoneId + ' Availability',
          region: Fn.ref('AWS::Region'),
          left: ZonalAvailabilityMetrics.createZonalServiceAvailabilityMetrics({
            label: availabilityZoneId + ' availability',
            period: props.service.period,
            availabilityMetricProps: this.createZonalAvailabilityMetricProps(
              props.service.operations.filter((x) => x.critical),
              availabilityZoneId,
              isCanary,
              AvailabilityMetricType.SUCCESS_RATE,
            ),
          }),
          statistic: 'Sum',
          leftYAxis: {
            max: 100,
            min: 95,
            label: 'Availability',
            showUnits: false,
          },
          right: ZonalAvailabilityMetrics.createZonalServiceAvailabilityMetrics(
            {
              label: availabilityZoneId + ' faults',
              period: props.service.period,
              availabilityMetricProps: this.createZonalAvailabilityMetricProps(
                props.service.operations.filter((x) => x.critical),
                availabilityZoneId,
                isCanary,
                AvailabilityMetricType.FAULT_COUNT,
              ),
            },
          ),
          rightYAxis: {
            label: 'Faults',
            showUnits: false,
            min: 0,
            max: Math.ceil(props.service.faultCountThreshold * 1.5),
          },
          rightAnnotations: [
            {
              color: Color.RED,
              label: 'High severity',
              value: props.service.faultCountThreshold,
            },
          ],
        }),
      );
    }

    return widgets;
  }

  private static generateLatencyMetricWidgets(
    props: ServiceAvailabilityAndLatencyDashboardProps,
    isCanary: boolean,
    availabilityZoneIds: string[],
  ): IWidget[] {
    let widgets: IWidget[] = [];

    widgets.push(
      new GraphWidget({
        height: 6,
        width: 24,
        title: Fn.ref('AWS::Region') + ' High Latency Count',
        region: Fn.ref('AWS::Region'),
        left: RegionalLatencyMetrics.createRegionalServiceLatencyCountMetrics({
          label: Fn.ref('AWS::Region'),
          period: props.service.period,
          latencyMetricProps: this.createRegionalLatencyMetricProps(
            props.service.operations.filter((x) => x.critical),
            isCanary,
            LatencyMetricType.SUCCESS_LATENCY,
          ),
        }),
        statistic: 'Sum',
        leftYAxis: {
          max: props.service.faultCountThreshold * 1.5,
          min: 0,
          label: 'Sum',
          showUnits: false,
        },
        leftAnnotations: [
          {
            color: Color.RED,
            label: 'High severity',
            value: props.service.faultCountThreshold,
          },
        ],
      }),
    );

    for (let i = 0; i < availabilityZoneIds.length; i++) {
      let availabilityZoneId = availabilityZoneIds[i];

      widgets.push(
        new GraphWidget({
          height: 6,
          width: 8,
          title: availabilityZoneId + ' High Latency Count',
          region: Fn.ref('AWS::Region'),
          left: ZonalLatencyMetrics.createZonalServiceLatencyMetrics({
            label: availabilityZoneId,
            period: props.service.period,
            latencyMetricProps: this.createZonalLatencyMetricProps(
              props.service.operations.filter((x) => x.critical),
              availabilityZoneId,
              isCanary,
              LatencyMetricType.SUCCESS_LATENCY,
            ),
          }),
          statistic: 'Sum',
          leftYAxis: {
            max: props.service.faultCountThreshold * 1.5,
            min: 0,
            label: 'Sum',
            showUnits: false,
          },
          leftAnnotations: [
            {
              color: Color.RED,
              label: 'High severity',
              value: props.service.faultCountThreshold,
            },
          ],
        }),
      );
    }

    return widgets;
  }

  private static createRegionalAvailabilityMetricProps(
    criticalOperations: IOperation[],
    isCanary: boolean,
    metricType: AvailabilityMetricType,
  ): AvailabilityMetricProps[] {
    return criticalOperations
      .reduce((filtered, value) => {
        if (isCanary && value.canaryMetricDetails) {
          filtered.push(
            value.canaryMetricDetails.canaryAvailabilityMetricDetails,
          );
        } else if (!isCanary) {
          filtered.push(value.serverSideAvailabilityMetricDetails);
        }
        return filtered;
      }, [] as IOperationMetricDetails[])
      .map((x) => {
        return {
          label:
            x.operationName + ' ' + metricType.toString().replace('_', ' '),
          metricDetails: x,
          metricType: metricType,
        };
      });
  }

  private static createRegionalLatencyMetricProps(
    criticalOperations: IOperation[],
    isCanary: boolean,
    metricType: LatencyMetricType,
  ): LatencyMetricProps[] {
    return criticalOperations
      .reduce((filtered, value) => {
        if (isCanary && value.canaryMetricDetails) {
          filtered.push(value.canaryMetricDetails.canaryLatencyMetricDetails);
        } else if (!isCanary) {
          filtered.push(value.serverSideLatencyMetricDetails);
        }
        return filtered;
      }, [] as IOperationMetricDetails[])
      .map((x) => {
        return {
          label:
            x.operationName,
          metricDetails: x,
          metricType: metricType,
          statistic: 'TC(' + x.successAlarmThreshold + ':)',
        };
      });
  }

  private static createZonalAvailabilityMetricProps(
    criticalOperations: IOperation[],
    availabilityZoneId: string,
    isCanary: boolean,
    metricType: AvailabilityMetricType,
  ): AvailabilityMetricProps[] {
    return criticalOperations
      .reduce((filtered, value) => {
        if (
          isCanary &&
          value.canaryMetricDetails !== undefined &&
          value.canaryMetricDetails != null
        ) {
          filtered.push(
            value.canaryMetricDetails.canaryAvailabilityMetricDetails,
          );
        } else if (!isCanary) {
          filtered.push(value.serverSideAvailabilityMetricDetails);
        }
        return filtered;
      }, [] as IOperationMetricDetails[])
      .map((x) => {
        return {
          label:
            x.operationName + ' ' + metricType.toString().replace('_', ' '),
          metricDetails: x,
          metricType: metricType,
          availabilityZoneId: availabilityZoneId,
        };
      });
  }

  private static createZonalLatencyMetricProps(
    criticalOperations: IOperation[],
    availabilityZoneId: string,
    isCanary: boolean,
    metricType: LatencyMetricType,
  ): LatencyMetricProps[] {
    return criticalOperations
      .reduce((filtered, value) => {
        if (
          isCanary &&
          value.canaryMetricDetails !== undefined &&
          value.canaryMetricDetails != null
        ) {
          filtered.push(value.canaryMetricDetails.canaryLatencyMetricDetails);
        } else if (!isCanary) {
          filtered.push(value.serverSideLatencyMetricDetails);
        }
        return filtered;
      }, [] as IOperationMetricDetails[])
      .map((x) => {
        return {
          label:
            x.operationName,
          metricDetails: x,
          metricType: metricType,
          availabilityZoneId: availabilityZoneId,
          statistic: 'TC(' + x.successAlarmThreshold + ':)',
        };
      });
  }

  private static generateLoadBalancerWidgets(
    props: ServiceAvailabilityAndLatencyDashboardProps,
    title: string,
    availabilityZoneNames: string[],
  ): IWidget[] {
    let albWidgets: IWidget[] = [];

    albWidgets.push(new TextWidget({ height: 2, width: 24, markdown: title }));

    let keyprefix = MetricsHelper.nextChar();

    let faultRateMetrics: IMetric[] = [];
    let requestCountMetrics: IMetric[] = [];
    let processedBytesMetrics: IMetric[] = [];

    availabilityZoneNames.forEach((availabilityZoneName) => {
      let availabilityZoneId: string =
        props.azMapper.availabilityZoneIdFromAvailabilityZoneLetter(
          availabilityZoneName.substring(availabilityZoneName.length - 1),
        );

      keyprefix = MetricsHelper.nextChar(keyprefix);

      let faultMetric: IMetric = ApplicationLoadBalancerMetrics.getPerAZAvailabilityMetric(
        props.service.loadBalancer as IApplicationLoadBalancer,
        {
          availabilityZone: availabilityZoneName,
          availabilityZoneId: availabilityZoneId,
          metricType: AvailabilityMetricType.FAULT_RATE,
          label: availabilityZoneId,
          period: props.service.period,
          keyprefix: keyprefix
        }
      );

      faultRateMetrics.push(faultMetric);

      let requestCountMetric: IMetric = ApplicationLoadBalancerMetrics.getPerAZAvailabilityMetric(
        props.service.loadBalancer as IApplicationLoadBalancer,
        {
          availabilityZone: availabilityZoneName,
          availabilityZoneId: availabilityZoneId,
          metricType: AvailabilityMetricType.REQUEST_COUNT,
          label: availabilityZoneId,
          period: props.service.period,
          keyprefix: keyprefix
        }
      );

      requestCountMetrics.push(requestCountMetric);

      let processedBytesMetric: IMetric = ApplicationLoadBalancerMetrics.getPerAZProcessedBytesMetric(
        props.service.loadBalancer as IApplicationLoadBalancer,
        availabilityZoneName,
        availabilityZoneId,
        props.service.period
      );

      processedBytesMetrics.push(processedBytesMetric);
    });

    albWidgets.push(
      new GraphWidget({
        height: 8,
        width: 8,
        title: Fn.sub('${AWS::Region} Fault Rate'),
        region: Fn.sub('${AWS::Region}'),
        left: faultRateMetrics,
        leftYAxis: {
          max: 35,
          min: 0,
          label: 'Fault Rate',
          showUnits: false,
        }
      })
    );

    albWidgets.push(
      new GraphWidget({
        height: 8,
        width: 8,
        title: Fn.sub('${AWS::Region} Request Count'),
        region: Fn.sub('${AWS::Region}'),
        left: requestCountMetrics,
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
        title: Fn.sub('${AWS::Region} Processed Bytes'),
        region: Fn.sub('${AWS::Region}'),
        left: processedBytesMetrics,
        leftYAxis: {
          min: 0,
          showUnits: true,
        }
      })
    );

    return albWidgets;
  }
  /**
   * The service level dashboard
   */
  dashboard: Dashboard;

  constructor(
    scope: Construct,
    id: string,
    props: ServiceAvailabilityAndLatencyDashboardProps,
  ) {
    super(scope, id);

    let topLevelAggregateAlarmWidgets: IWidget[] = [];

    let availabilityZoneIds: string[] = props.service.availabilityZoneNames.map(
      (x) => {
        return props.azMapper.availabilityZoneIdFromAvailabilityZoneLetter(
          x.substring(x.length - 1),
        );
      },
    );

    topLevelAggregateAlarmWidgets.push(
      new TextWidget({
        height: 2,
        width: 24,
        markdown: '***Availability and Latency Alarms***',
      }),
    );

    topLevelAggregateAlarmWidgets.push(
      new AlarmStatusWidget({
        height: 2,
        width: 24,
        alarms: [props.aggregateRegionalAlarm],
        title:
          'Customer Experience - Regional Aggregate Impact Alarm (measures fault count in aggregate across all critical operations)',
      }),
    );

    let keyPrefix: string = MetricsHelper.nextChar();
    let perOperationAZFaultsMetrics: IMetric[] = [];

    for (let i = 0; i < availabilityZoneIds.length; i++) {
      let counter: number = 1;
      let availabilityZoneId: string = availabilityZoneIds[i];

      topLevelAggregateAlarmWidgets.push(
        new AlarmStatusWidget({
          height: 2,
          width: 8,
          alarms: [props.zonalAggregateAlarms[i]],
          title:
            availabilityZoneId +
            ' Zonal Isolated Impact Alarm (any critical operation in this AZ shows impact from server-side or canary)',
        }),
      );

      let usingMetrics: { [key: string]: IMetric } = {};

      props.service.operations
        .filter((x) => x.critical == true)
        .forEach((x) => {
          usingMetrics[`${keyPrefix}${counter++}`] =
            ZonalAvailabilityMetrics.createZonalAvailabilityMetric({
              availabilityZoneId: availabilityZoneId,
              metricDetails: x.serverSideAvailabilityMetricDetails,
              label:
                availabilityZoneId + ' ' + x.operationName + ' fault count',
              metricType: AvailabilityMetricType.FAULT_COUNT,
              keyPrefix: keyPrefix,
            });
        });

      let zonalFaultCount: IMetric = new MathExpression({
        expression: Object.keys(usingMetrics).join('+'),
        label: availabilityZoneId,
        usingMetrics: usingMetrics,
        period: props.service.period
      });

      perOperationAZFaultsMetrics.push(zonalFaultCount);
      keyPrefix = MetricsHelper.nextChar(keyPrefix);
    }

    let azContributorWidgets: IWidget[] = [
      new TextWidget({
        height: 2,
        width: 24,
        markdown: '**AZ Contributors To Faults**',
      }),
      new GraphWidget({
        height: 6,
        width: 24,
        title: 'AZ Fault Count',
        period: props.service.period,
        left: perOperationAZFaultsMetrics,
      }),
    ];

    topLevelAggregateAlarmWidgets.concat(
      ServiceAvailabilityAndLatencyDashboard.generateTPSWidgets(
        props,
        availabilityZoneIds,
      ),
    );

    this.dashboard = new Dashboard(this, 'TopLevelDashboard', {
      dashboardName:
        props.service.serviceName.toLowerCase() +
        Fn.sub('-availability-and-latency-${AWS::Region}'),
      defaultInterval: props.interval,
      periodOverride: PeriodOverride.AUTO,
      widgets: [
        topLevelAggregateAlarmWidgets,
        azContributorWidgets,
        ServiceAvailabilityAndLatencyDashboard.generateServerSideAndCanaryAvailabilityWidgets(
          props,
          availabilityZoneIds,
        ),
        ServiceAvailabilityAndLatencyDashboard.generateServerSideAndCanaryLatencyWidgets(
          props,
          availabilityZoneIds,
        ),
      ],
    });

    let lb: CfnLoadBalancer = props.service.loadBalancer?.node
      .defaultChild as CfnLoadBalancer;

    if (lb !== undefined && lb != null && lb.type == 'application') {
      this.dashboard.addWidgets(
        ...ServiceAvailabilityAndLatencyDashboard.generateLoadBalancerWidgets(
          props,
          '**Application Load Balancer Metrics**',
          props.service.availabilityZoneNames,
        ),
      );
    }
  }
}
