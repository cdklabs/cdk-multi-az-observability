// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { Aws, Fn } from 'aws-cdk-lib';
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
import { AvailabilityAndLatencyMetrics } from '../metrics/AvailabilityAndLatencyMetrics';
import { ZonalAvailabilityMetricProps } from '../metrics/props/ZonalAvailabilityMetricProps';

/**
 * Creates a service level availability and latency dashboard
 */
export class ServiceAvailabilityAndLatencyDashboard
  extends Construct
  implements IServiceAvailabilityAndLatencyDashboard {
 
  private static generateTPSWidgets(
    props: ServiceAvailabilityAndLatencyDashboardProps
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

    props.service.availabilityZoneNames.forEach((availabilityZone: string) => {
      let azLetter: string = availabilityZone.substring(availabilityZone.length - 1);
      let availabilityZoneId: string = props.azMapper.availabilityZoneIdFromAvailabilityZoneLetter(azLetter);

      widgets.push(
        new GraphWidget({
          height: 6,
          width: 8,
          title: availabilityZoneId + ' TPS',
          region: Fn.ref('AWS::Region'),
          left: ZonalAvailabilityMetrics.createZonalServiceAvailabilityMetrics(
            props.service.operations
            .filter((x) => x.critical)
            .map((x) => {
              return {
                availabilityZoneId: availabilityZoneId,
                availabilityZone: availabilityZone,
                label: x.operationName,
                metricDetails: x.serverSideAvailabilityMetricDetails,
                metricType: AvailabilityMetricType.REQUEST_COUNT,
              };
            }),
            props.service.period,
            availabilityZoneId
          ),
          statistic: 'Sum',
          leftYAxis: {
            label: 'TPS',
            showUnits: false,
          },
        }),
      );
    });

    return widgets;
  }

  private static generateServerSideAndCanaryAvailabilityWidgets(
    props: ServiceAvailabilityAndLatencyDashboardProps
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

    widgets.push(
      ...ServiceAvailabilityAndLatencyDashboard.generateAvailabilityWidgets(
        props,
        false
      )
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

      widgets.push(
        ...ServiceAvailabilityAndLatencyDashboard.generateAvailabilityWidgets(
          props,
          true
        ),
      );
    }

    return widgets;
  }

  private static generateServerSideAndCanaryLatencyWidgets(
    props: ServiceAvailabilityAndLatencyDashboardProps
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
        false
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
          true
        ),
      );
    }

    return widgets;
  }

  private static generateAvailabilityWidgets(
    props: ServiceAvailabilityAndLatencyDashboardProps,
    isCanary: boolean
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

    props.service.availabilityZoneNames.forEach((availabilityZone: string) => {
      let azLetter: string = availabilityZone.substring(availabilityZone.length - 1);
      let availabilityZoneId: string = props.azMapper.availabilityZoneIdFromAvailabilityZoneLetter(azLetter);

      widgets.push(
        new GraphWidget({
          height: 6,
          width: 8,
          title: availabilityZoneId + ' Availability',
          region: Fn.ref('AWS::Region'),
          left: ZonalAvailabilityMetrics.createZonalServiceAvailabilityMetrics(
            this.createZonalAvailabilityMetricProps(
              props.service.operations.filter((x) => x.critical),
              availabilityZone,
              availabilityZoneId,
              isCanary,
              AvailabilityMetricType.SUCCESS_RATE,
            ),
            props.service.period,
            availabilityZoneId
          ),
          statistic: 'Sum',
          leftYAxis: {
            max: 100,
            min: 95,
            label: 'Availability',
            showUnits: false,
          },
          right: ZonalAvailabilityMetrics.createZonalServiceAvailabilityMetrics(
            this.createZonalAvailabilityMetricProps(
              props.service.operations.filter((x) => x.critical),
              availabilityZone,
              availabilityZoneId,
              isCanary,
              AvailabilityMetricType.FAULT_COUNT,
            ),
            props.service.period,
            availabilityZoneId
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
    });

    return widgets;
  }

  private static generateLatencyMetricWidgets(
    props: ServiceAvailabilityAndLatencyDashboardProps,
    isCanary: boolean
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

    props.service.availabilityZoneNames.forEach((availabilityZone: string) => {
      let azLetter: string = availabilityZone.substring(availabilityZone.length - 1);
      let availabilityZoneId: string = props.azMapper.availabilityZoneIdFromAvailabilityZoneLetter(azLetter);

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
    });

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
    availabilityZone: string,
    availabilityZoneId: string,
    isCanary: boolean,
    metricType: AvailabilityMetricType,
  ): ZonalAvailabilityMetricProps[] {
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
          availabilityZone: availabilityZone
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

    props.service.availabilityZoneNames.forEach((availabilityZone: string, index: number) => {
      let azLetter: string = availabilityZone.substring(availabilityZone.length - 1);
      let availabilityZoneId: string = props.azMapper.availabilityZoneIdFromAvailabilityZoneLetter(azLetter);
      
      topLevelAggregateAlarmWidgets.push(
        new AlarmStatusWidget({
          height: 2,
          width: 8,
          alarms: [props.zonalAggregateAlarms[index]],
          title:
            availabilityZoneId +
            ' Zonal Isolated Impact Alarm (any critical operation in this AZ shows impact from server-side or canary)',
        }),
      );

      let usingMetrics: { [key: string]: IMetric } = {};

      props.service.operations
        .filter((x) => x.critical == true)
        .forEach((x: IOperation, index: number) => {
          usingMetrics[`${keyPrefix}${index}`] =
            AvailabilityAndLatencyMetrics.createZonalAvailabilityMetric({
              availabilityZoneId: availabilityZoneId,
              metricDetails: x.serverSideAvailabilityMetricDetails,
              label:
                availabilityZoneId + ' ' + x.operationName + ' fault count',
              metricType: AvailabilityMetricType.FAULT_COUNT,
              availabilityZone: availabilityZone
            },
            x.serverSideAvailabilityMetricDetails.metricDimensions.zonalDimensions(
              availabilityZoneId,
              Aws.REGION
            ));
        });

      let zonalFaultCount: IMetric = new MathExpression({
        expression: Object.keys(usingMetrics).join('+'),
        label: availabilityZoneId,
        usingMetrics: usingMetrics,
        period: props.service.period
      });

      perOperationAZFaultsMetrics.push(zonalFaultCount);
      keyPrefix = MetricsHelper.nextChar(keyPrefix);

    });

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
        props
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
          props
        ),
        ServiceAvailabilityAndLatencyDashboard.generateServerSideAndCanaryLatencyWidgets(
          props
        ),
      ],
    });

    let lb: CfnLoadBalancer = props.service.loadBalancer?.node
      .defaultChild as CfnLoadBalancer;

    if (lb && lb.type == 'application') {
      this.dashboard.addWidgets(
        new TextWidget({ height: 2, width: 24, markdown: "**Load Balancer Metrics**" })
      );

      this.dashboard.addWidgets(
        ...ApplicationLoadBalancerMetrics.generateLoadBalancerWidgets(
          [ props.service.loadBalancer as IApplicationLoadBalancer ],
          props.azMapper,
          props.service.period,
          props.service.defaultLatencyMetricDetails.alarmStatistic,
          props.service.defaultLatencyMetricDetails.successAlarmThreshold,
          props.service.defaultLatencyMetricDetails.faultAlarmThreshold
        )
      );
    }
  }
}