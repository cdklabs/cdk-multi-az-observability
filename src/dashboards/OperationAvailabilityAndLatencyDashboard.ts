// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { Aws, Fn } from 'aws-cdk-lib';
import {
  Dashboard,
  PeriodOverride,
  IWidget,
  AlarmStatusWidget,
  GraphWidget,
  Color,
  LegendPosition,
  TextWidget,
  TextWidgetBackground,
  AlarmWidget
} from 'aws-cdk-lib/aws-cloudwatch';
import { Construct } from 'constructs';
import { ContributorInsightsWidget } from './ContributorInsightsWidget';
import { IOperationAvailabilityAndLatencyDashboard } from './IOperationAvailabilityAndLatencyDashboard';
import { OperationAvailabilityAndLatencyDashboardProps } from './props/OperationAvailabilityAndLatencyDashboardProps';
import { ZonalLatencyMetrics } from '../metrics/ZonalLatencyMetrics';
import { AvailabilityMetricType } from '../utilities/AvailabilityMetricType';
import { LatencyMetricType } from '../utilities/LatencyMetricType';
import { MetricsHelper } from '../utilities/MetricsHelper';
import { AvailabilityAndLatencyMetrics } from '../metrics/AvailabilityAndLatencyMetrics';
import { IOperation } from '../services/IOperation';

/**
 * Creates an operation level availability and latency dashboard
 */
export class OperationAvailabilityAndLatencyDashboard
  extends Construct
  implements IOperationAvailabilityAndLatencyDashboard {

  private static createServerSideWidgets(
    dashboard: Dashboard,
    props: OperationAvailabilityAndLatencyDashboardProps
  ): void {

    let operation: IOperation = props.operationAlarmsAndRules.operation;
    let availabilityZones: string[] = props.operationAlarmsAndRules.operation.service.availabilityZoneNames;
    
    dashboard.addWidgets(
      new TextWidget({
        markdown: "## **Server-side Metrics**",
        background: TextWidgetBackground.TRANSPARENT,
        height: 1,
        width: 24
      })
    );

    dashboard.addWidgets(

      // Server-side availability
      new GraphWidget({
        height: 8,
        width: 6,
        title: 'Server-side Availability',
        region: Aws.REGION,
        left: [
          ...availabilityZones.map((availabilityZone: string, index: number) => {
            let azLetter: string = availabilityZone.substring(availabilityZone.length - 1);
            let availabilityZoneId: string = props.azMapper.availabilityZoneIdFromAvailabilityZoneLetter(azLetter);

            return AvailabilityAndLatencyMetrics.createZonalAvailabilityMetric({
              availabilityZoneId: availabilityZoneId,
              availabilityZone: availabilityZone,
              label: availabilityZoneId + " (avg: ${AVG}  min: ${MIN})",
              metricDetails: operation.serverSideAvailabilityMetricDetails,
              metricType: AvailabilityMetricType.SUCCESS_RATE,
              color: MetricsHelper.colors[index]
            },
            operation.serverSideLatencyMetricDetails.metricDimensions.zonalDimensions(
              availabilityZoneId,
              Aws.REGION
            ))
          }),
          AvailabilityAndLatencyMetrics.createAvailabilityMetric({
            label: Aws.REGION + " (avg: ${AVG}  min: ${MIN})",
            metricDetails: operation.serverSideAvailabilityMetricDetails,
            metricType: AvailabilityMetricType.SUCCESS_RATE,
            color: MetricsHelper.regionColor
          },
          operation.serverSideLatencyMetricDetails.metricDimensions.regionalDimensions(
            Aws.REGION
          ))
        ],
        statistic: 'Sum',
        leftYAxis: {
          max: 100,
          min: 95,
          label: 'Percent',
          showUnits: false,
        },
        leftAnnotations: [
          {
            value: operation.serverSideAvailabilityMetricDetails.successAlarmThreshold,
            visible: true,
            color: Color.RED,
            label: 'High Severity',
          },
        ]
      }),

      // Server-side fault count
      new GraphWidget({
        height: 8,
        width: 6,
        title: 'Server-side Fault Count',
        region: Aws.REGION,
        left: availabilityZones.map((availabilityZone: string, index: number) => {
          let azLetter: string = availabilityZone.substring(availabilityZone.length - 1);
          let availabilityZoneId: string = props.azMapper.availabilityZoneIdFromAvailabilityZoneLetter(azLetter);

          return AvailabilityAndLatencyMetrics.createZonalAvailabilityMetric({
            availabilityZoneId: availabilityZoneId,
            availabilityZone: availabilityZone,
            label: availabilityZoneId + " (avg: ${AVG}  max: ${MAX})",
            metricDetails: operation.serverSideAvailabilityMetricDetails,
            metricType: AvailabilityMetricType.FAULT_COUNT,
            color: MetricsHelper.colors[index]
          },
          operation.serverSideLatencyMetricDetails.metricDimensions.zonalDimensions(
            availabilityZoneId,
            Aws.REGION
          ))
        }),
        statistic: 'Sum',
        leftYAxis: {
          min: 0,
          label: 'Count',
          showUnits: false,
        }
      }),

      // Server-side request count
      new GraphWidget({
        height: 8,
        width: 6,
        title: "Server-side Request Count",
        region: Aws.REGION,
        left: availabilityZones.map((availabilityZone: string, index: number) => {
          let azLetter: string = availabilityZone.substring(availabilityZone.length - 1);
          let availabilityZoneId: string = props.azMapper.availabilityZoneIdFromAvailabilityZoneLetter(azLetter);

          return AvailabilityAndLatencyMetrics.createZonalAvailabilityMetric({
            availabilityZoneId: availabilityZoneId,
            availabilityZone: availabilityZone,
            label: availabilityZoneId + " (avg: ${AVG}  max: ${MAX})",
            metricDetails: operation.serverSideAvailabilityMetricDetails,
            metricType: AvailabilityMetricType.REQUEST_COUNT,
            color: MetricsHelper.colors[index]
          },
          operation.serverSideLatencyMetricDetails.metricDimensions.zonalDimensions(
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

      // Server-side instance contributors to faults
      ... props.operationAlarmsAndRules.serverSideRegionalAlarmsAndRules.instanceContributorsToRegionalFaults ?
        [ 
          new ContributorInsightsWidget({
            height: 8,
            width: 6,
            title: 'Individual Instance Contributors to Fault Count',
            insightRule: props.operationAlarmsAndRules.serverSideRegionalAlarmsAndRules.instanceContributorsToRegionalFaults,
            period: operation.serverSideAvailabilityMetricDetails.period,
            legendPosition: LegendPosition.BOTTOM,
            orderStatistic: 'Sum',
            accountId: Aws.ACCOUNT_ID, 
            topContributors: 10,
          }) 
        ] : []
      );

    // Server-side latency
    let latencyWidgets: IWidget[] = [];
    operation.serverSideLatencyMetricDetails.successMetricNames.forEach((metricName: string) => {

      operation.serverSideLatencyMetricDetails.graphedSuccessStatistics?.forEach((statistic: string) => {

        latencyWidgets.push(
          new GraphWidget({
            height: 8,
            width: 6,
            title: `Server-side ${metricName} ${statistic} Latency`,
            region: Aws.REGION,
            left: [
              ...availabilityZones.map((availabilityZone: string, index: number) => {
                let azLetter: string = availabilityZone.substring(availabilityZone.length - 1);
                let availabilityZoneId: string = props.azMapper.availabilityZoneIdFromAvailabilityZoneLetter(azLetter);
        
                return ZonalLatencyMetrics.createZonalLatencyMetric({
                  metricName: metricName,
                  label: availabilityZoneId + " (avg: ${AVG}  max: ${MAX})",
                  metricDetails: operation.serverSideLatencyMetricDetails,
                  metricType: LatencyMetricType.SUCCESS_LATENCY,
                  statistic: statistic,
                  availabilityZoneId: availabilityZoneId,
                  availabilityZone: availabilityZone,
                  color: MetricsHelper.colors[index]
                });
              }),
              AvailabilityAndLatencyMetrics.createLatencyMetric({
                metricName: metricName,
                label: Aws.REGION + " (avg: ${AVG}  max: ${MAX})",
                metricDetails: operation.serverSideLatencyMetricDetails,
                metricType: LatencyMetricType.SUCCESS_LATENCY,
                statistic: statistic,
                color: MetricsHelper.regionColor
              },
              operation.serverSideLatencyMetricDetails.metricDimensions.regionalDimensions(
                Aws.REGION
              ))
            ],
            leftYAxis: {
              max: operation.serverSideLatencyMetricDetails.successAlarmThreshold * 1.5,
              min: 0,
              label: operation.serverSideLatencyMetricDetails.unit,
              showUnits: false,
            },
            leftAnnotations: [
              {
                value: operation.serverSideLatencyMetricDetails.successAlarmThreshold,
                visible: true,
                color: Color.RED,
                label: 'High Severity',
              },
            ],
          }),
        );
      });
    });

    dashboard.addWidgets(
      ...latencyWidgets,

      // Server-side high latency request count
      new GraphWidget({
        height: 8,
        width: 6,
        title: 'Server-side High Latency Request Count',
        left: availabilityZones.map((availabilityZone: string, index: number) => {
          let azLetter: string = availabilityZone.substring(availabilityZone.length - 1);
          let availabilityZoneId: string = props.azMapper.availabilityZoneIdFromAvailabilityZoneLetter(azLetter);

          return ZonalLatencyMetrics.createZonalCountLatencyMetric({
            availabilityZoneId: availabilityZoneId,
            availabilityZone: availabilityZone,
            metricDetails: operation.serverSideLatencyMetricDetails,
            label: availabilityZoneId,
            metricType: LatencyMetricType.SUCCESS_LATENCY,
            statistic: `TC(${operation.serverSideLatencyMetricDetails.successAlarmThreshold}:)`,
            color: MetricsHelper.colors[index]
          })
        }),
        statistic: 'Sum',
        leftYAxis: {
          label: 'Count',
          showUnits: false,
        },
      }),

      // Server-side instance contributors to latency
      ... props.operationAlarmsAndRules.serverSideRegionalAlarmsAndRules.instanceContributorsToRegionalHighLatency ?
        [
          new ContributorInsightsWidget({
            height: 8,
            width: 6,
            title: 'Individual Instance Contributors to High Latency',
            insightRule: props.operationAlarmsAndRules.serverSideRegionalAlarmsAndRules.instanceContributorsToRegionalHighLatency,
            period: operation.serverSideLatencyMetricDetails.period,
            legendPosition: LegendPosition.BOTTOM,
            orderStatistic: 'Sum',
            accountId: Aws.ACCOUNT_ID,
            topContributors: 10,
          }) 
        ] : []
    );

    dashboard.addWidgets(
      new TextWidget({
        height: 1,
        width: 24,
        markdown: "### Alarms",
        background: TextWidgetBackground.TRANSPARENT
      })
    );

    let availabilityAlarmWidgets: IWidget[] = []

    Object.keys(props.operationAlarmsAndRules.serverSideZonalAlarmsAndRules).forEach((availabilityZone: string) => {
      let azLetter: string = availabilityZone.substring(availabilityZone.length - 1);
      let availabilityZoneId: string = props.azMapper.availabilityZoneIdFromAvailabilityZoneLetter(azLetter);

      availabilityAlarmWidgets.push(new AlarmWidget({
        alarm: props.operationAlarmsAndRules.serverSideZonalAlarmsAndRules[availabilityZone].availabilityAlarm,
        title: `${availabilityZoneId} Availability`,
        height: 2,
        width: 8
      }));
    });

    dashboard.addWidgets(...availabilityAlarmWidgets);

    let latencyAlarmWidgets: IWidget[] = [];

    Object.keys(props.operationAlarmsAndRules.serverSideZonalAlarmsAndRules).forEach((availabilityZone: string) => {
      let azLetter: string = availabilityZone.substring(availabilityZone.length - 1);
      let availabilityZoneId: string = props.azMapper.availabilityZoneIdFromAvailabilityZoneLetter(azLetter);

      latencyAlarmWidgets.push(new AlarmWidget({
        alarm: props.operationAlarmsAndRules.serverSideZonalAlarmsAndRules[availabilityZone].latencyAlarm,
        title: `${availabilityZoneId} Latency`,
        height: 2,
        width: 8
      }));
    });

    dashboard.addWidgets(...latencyAlarmWidgets);
  }
  
  private static createCanaryWidgets(
    dashboard: Dashboard,
    props: OperationAvailabilityAndLatencyDashboardProps
  ): void {

    let operation: IOperation = props.operationAlarmsAndRules.operation;
    let availabilityZones: string[] = operation.service.availabilityZoneNames;

    dashboard.addWidgets(
      new TextWidget({
        markdown: "## **Canary Metrics**",
        background: TextWidgetBackground.TRANSPARENT,
        height: 1,
        width: 24
      })
    );

    dashboard.addWidgets(
      // Canary availability
      new GraphWidget({
        height: 8,
        width: 6,
        title: 'Canary Measured Availability',
        region: Aws.REGION,
        left: [
          ...availabilityZones.map((availabilityZone: string, index: number) => {
            let azLetter: string = availabilityZone.substring(availabilityZone.length - 1);
            let availabilityZoneId: string = props.azMapper.availabilityZoneIdFromAvailabilityZoneLetter(azLetter);

            return AvailabilityAndLatencyMetrics.createZonalAvailabilityMetric({
              availabilityZoneId: availabilityZoneId,
              availabilityZone: availabilityZone,
              label: availabilityZoneId + " (avg: ${AVG}  min: ${MIN})",
              metricDetails: operation.canaryMetricDetails!.canaryAvailabilityMetricDetails,
              metricType: AvailabilityMetricType.SUCCESS_RATE,
              color: MetricsHelper.colors[index]
            },
            operation.canaryMetricDetails!.canaryAvailabilityMetricDetails.metricDimensions.zonalDimensions(
              availabilityZoneId,
              Aws.REGION
            ))
          }),
          AvailabilityAndLatencyMetrics.createAvailabilityMetric({
            label: Aws.REGION + " (avg: ${AVG}  min: ${MIN})",
            metricDetails: operation.canaryMetricDetails!.canaryAvailabilityMetricDetails,
            metricType: AvailabilityMetricType.SUCCESS_RATE,
            color: MetricsHelper.regionColor
          },
          operation.canaryMetricDetails!.canaryAvailabilityMetricDetails.metricDimensions.regionalDimensions(
            Aws.REGION
          ))
        ],
        statistic: 'Sum',
        leftYAxis: {
          max: 100,
          min: 95,
          label: 'Percent',
          showUnits: false,
        },
        leftAnnotations: [
          {
            value: operation.canaryMetricDetails!.canaryAvailabilityMetricDetails.successAlarmThreshold,
            visible: true,
            color: Color.RED,
            label: 'High Severity',
          },
        ]
      }),

      // Canary fault count
      new GraphWidget({
        height: 8,
        width: 6,
        title: 'Canary Measured Fault Count',
        region: Aws.REGION,
        left: [
          ...availabilityZones.map((availabilityZone: string, index: number) => {
            let azLetter: string = availabilityZone.substring(availabilityZone.length - 1);
            let availabilityZoneId: string = props.azMapper.availabilityZoneIdFromAvailabilityZoneLetter(azLetter);

            return AvailabilityAndLatencyMetrics.createZonalAvailabilityMetric({
              availabilityZoneId: availabilityZoneId,
              availabilityZone: availabilityZone,
              metricDetails: operation.canaryMetricDetails!.canaryAvailabilityMetricDetails,
              label: availabilityZoneId + " (avg: ${AVG}  max: ${MAX})",
              metricType: AvailabilityMetricType.FAULT_COUNT,
              color: MetricsHelper.colors[index]
            },
            operation.canaryMetricDetails!.canaryAvailabilityMetricDetails.metricDimensions.zonalDimensions(
              availabilityZoneId,
              Aws.REGION
            ))
          }),
          AvailabilityAndLatencyMetrics.createAvailabilityMetric({
            metricDetails: operation.canaryMetricDetails!.canaryAvailabilityMetricDetails,
            label: Aws.REGION + " (avg: ${AVG}  max: ${MAX})",
            metricType: AvailabilityMetricType.FAULT_COUNT,
            color: MetricsHelper.regionColor
          },
          operation.canaryMetricDetails!.canaryAvailabilityMetricDetails.metricDimensions.regionalDimensions(
            Aws.REGION
          ))
        ],
        statistic: 'Sum',
        leftYAxis: {
          min: 0,
          label: 'Count',
          showUnits: false,
        }
      }),

      // Canary request count
      new GraphWidget({
        height: 8,
        width: 6,
        title: 'Canary Measured Request Count',
        region: Aws.REGION,
        left: [
          ...availabilityZones.map((availabilityZone: string, index: number) => {
            let azLetter: string = availabilityZone.substring(availabilityZone.length - 1);
            let availabilityZoneId: string = props.azMapper.availabilityZoneIdFromAvailabilityZoneLetter(azLetter);
            return AvailabilityAndLatencyMetrics.createZonalAvailabilityMetric({
              availabilityZoneId: availabilityZoneId,
              availabilityZone: availabilityZone,
              metricDetails: operation.canaryMetricDetails!.canaryAvailabilityMetricDetails,
              label: availabilityZoneId + " (avg: ${AVG}  max: ${MAX})",
              metricType: AvailabilityMetricType.REQUEST_COUNT,
              color: MetricsHelper.colors[index]
            },
            operation.canaryMetricDetails!.canaryAvailabilityMetricDetails.metricDimensions.zonalDimensions(
              availabilityZoneId,
              Aws.REGION
            ))
          }),
          AvailabilityAndLatencyMetrics.createAvailabilityMetric({
            metricDetails: operation.canaryMetricDetails!.canaryAvailabilityMetricDetails,
            label: Aws.REGION + " (avg: ${AVG}  max: ${MAX})",
            metricType: AvailabilityMetricType.REQUEST_COUNT,
            color: MetricsHelper.regionColor
          },
          operation.canaryMetricDetails!.canaryAvailabilityMetricDetails.metricDimensions.regionalDimensions(
            Aws.REGION
          ))
        ],
        statistic: 'Sum',
        leftYAxis: {
          label: 'Count',
          showUnits: false,
        }
      })
    );

    let latencyWidgets: IWidget[] = [];

    // Canary latency
    operation.canaryMetricDetails!.canaryLatencyMetricDetails.successMetricNames.forEach((metricName: string) => {
      operation.canaryMetricDetails!.canaryLatencyMetricDetails.graphedSuccessStatistics?.forEach((statistic: string) => {

        latencyWidgets.push(
          new GraphWidget({
            height: 8,
            width: 6,
            title: `Canary Measured ${metricName} ${statistic} Latency`,
            region: Aws.REGION,
            left: [
              ...availabilityZones.map((availabilityZone: string, index: number) => {
                let azLetter: string = availabilityZone.substring(availabilityZone.length - 1);
                let availabilityZoneId: string = props.azMapper.availabilityZoneIdFromAvailabilityZoneLetter(azLetter);
        
                return ZonalLatencyMetrics.createZonalLatencyMetric({
                  metricName: metricName,
                  label: availabilityZoneId + " (avg: ${AVG}  max: ${MAX})",
                  metricDetails: operation.canaryMetricDetails!.canaryLatencyMetricDetails,
                  metricType: LatencyMetricType.SUCCESS_LATENCY,
                  statistic: statistic,
                  availabilityZoneId: availabilityZoneId,
                  availabilityZone: availabilityZone,
                  color: MetricsHelper.colors[index]
                });
              }),
              AvailabilityAndLatencyMetrics.createLatencyMetric({
                metricName: metricName,
                label: Aws.REGION + " (avg: ${AVG}  max: ${MAX})",
                metricDetails: operation.canaryMetricDetails!.canaryLatencyMetricDetails,
                metricType: LatencyMetricType.SUCCESS_LATENCY,
                statistic: statistic,
                color: MetricsHelper.regionColor
              },
              operation.canaryMetricDetails!.canaryLatencyMetricDetails.metricDimensions.regionalDimensions(
                Aws.REGION
              ))
            ],
            leftYAxis: {
              max: operation.canaryMetricDetails!.canaryLatencyMetricDetails.successAlarmThreshold * 1.5,
              min: 0,
              label: operation.canaryMetricDetails!.canaryLatencyMetricDetails.unit,
              showUnits: false,
            },
            leftAnnotations: [
              {
                value: operation.canaryMetricDetails!.canaryLatencyMetricDetails.successAlarmThreshold,
                visible: true,
                color: Color.RED,
                label: 'High Severity',
              },
            ],
          }),
        );
      });
    });

    dashboard.addWidgets(
      ...latencyWidgets,

      // Canary high-latency request count
      new GraphWidget({
        height: 8,
        width: 6,
        title: 'Canary Measured High Latency Request Count',
        left: [
          ...availabilityZones.map((availabilityZone: string, index: number) => {
            let azLetter: string = availabilityZone.substring(availabilityZone.length - 1);
            let availabilityZoneId: string = props.azMapper.availabilityZoneIdFromAvailabilityZoneLetter(azLetter);
            
            return ZonalLatencyMetrics.createZonalCountLatencyMetric({
              availabilityZoneId: availabilityZoneId,
              availabilityZone: availabilityZone,
              metricDetails: operation.canaryMetricDetails!.canaryLatencyMetricDetails,
              label: availabilityZoneId,
              metricType: LatencyMetricType.SUCCESS_LATENCY,
              statistic: `TC(${operation.canaryMetricDetails!.canaryLatencyMetricDetails.successAlarmThreshold}:)`,
              color: MetricsHelper.colors[index]
            })
          }),
          AvailabilityAndLatencyMetrics.createLatencyCountMetric({
            label: Aws.REGION,
            metricDetails: operation.canaryMetricDetails!.canaryLatencyMetricDetails,
            metricType: LatencyMetricType.SUCCESS_LATENCY,
            statistic: `TC(${operation.canaryMetricDetails!.canaryLatencyMetricDetails.successAlarmThreshold}:)`,
            color: MetricsHelper.regionColor
          },
          operation.canaryMetricDetails!.canaryLatencyMetricDetails.metricDimensions.regionalDimensions(
            Aws.REGION
          ))
        ],
        statistic: 'Sum',
        leftYAxis: {
          label: 'Count',
          showUnits: false,
        },
      }),
    );

    dashboard.addWidgets(
      new TextWidget({
        height: 1,
        width: 24,
        markdown: "### Alarms",
        background: TextWidgetBackground.TRANSPARENT
      })
    );

    dashboard.addWidgets(
      new AlarmWidget({
        alarm: props.operationAlarmsAndRules.canaryRegionalAlarmsAndRules!.availabilityAlarm,
        title: "Regional Availability",
        height: 2,
        width: 8
      }),
      new AlarmWidget({
        alarm: props.operationAlarmsAndRules.canaryRegionalAlarmsAndRules!.latencyAlarm,
        title: "Regional Latency",
        height: 2,
        width: 8
      }),
    );

    let availabilityAlarmWidgets: IWidget[] = []

    Object.keys(props.operationAlarmsAndRules.canaryZonalAlarmsAndRules!).forEach((availabilityZone: string) => {
      let azLetter: string = availabilityZone.substring(availabilityZone.length - 1);
      let availabilityZoneId: string = props.azMapper.availabilityZoneIdFromAvailabilityZoneLetter(azLetter);
      
      availabilityAlarmWidgets.push(new AlarmWidget({
        alarm: props.operationAlarmsAndRules.canaryZonalAlarmsAndRules![availabilityZone].availabilityAlarm,
        title: `${availabilityZoneId} Availability`,
        height: 2,
        width: 8
      }));
    });

    dashboard.addWidgets(...availabilityAlarmWidgets);

    let latencyAlarmWidgets: IWidget[] = [];

    Object.keys(props.operationAlarmsAndRules.canaryZonalAlarmsAndRules!).forEach((availabilityZone: string) => {
      let azLetter: string = availabilityZone.substring(availabilityZone.length - 1);
      let availabilityZoneId: string = props.azMapper.availabilityZoneIdFromAvailabilityZoneLetter(azLetter);

      latencyAlarmWidgets.push(new AlarmWidget({
        alarm: props.operationAlarmsAndRules.canaryZonalAlarmsAndRules![availabilityZone].latencyAlarm,
        title: `${availabilityZoneId} Latency`,
        height: 2,
        width: 8
      }));
    });
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

    this.dashboard = new Dashboard(this, 'Dashboard', {
      dashboardName:
        props.operationAlarmsAndRules.operation.service.serviceName.toLowerCase() +
        '-' +
        props.operationAlarmsAndRules.operation.operationName.toLowerCase() +
        Fn.sub('-availability-and-latency-${AWS::Region}'),
      defaultInterval: props.interval,
      periodOverride: PeriodOverride.AUTO
    });

    this.dashboard.addWidgets(
      new AlarmStatusWidget({
        height: 2,
        width: 24,
        alarms: [
          props.operationAlarmsAndRules.regionalImpactAlarm,
          ...Object.values(props.operationAlarmsAndRules.aggregateZonalAlarms)
        ],
        title: "Aggregate Alarms"
      }
    ));

    OperationAvailabilityAndLatencyDashboard.createServerSideWidgets(this.dashboard, props);

    if (props.operationAlarmsAndRules.operation.canaryMetricDetails) {
      OperationAvailabilityAndLatencyDashboard.createCanaryWidgets(this.dashboard, props);
    }
  }
}