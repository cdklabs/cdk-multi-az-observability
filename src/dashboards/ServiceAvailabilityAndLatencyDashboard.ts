// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { Aws } from 'aws-cdk-lib';
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
  TextWidgetBackground,
} from 'aws-cdk-lib/aws-cloudwatch';
import {
  CfnLoadBalancer,
  IApplicationLoadBalancer,
} from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import { Construct } from 'constructs';
import { IServiceAvailabilityAndLatencyDashboard } from './IServiceAvailabilityAndLatencyDashboard';
import { ServiceAvailabilityAndLatencyDashboardProps } from './props/ServiceAvailabilityAndLatencyDashboardProps';
import { ApplicationLoadBalancerMetrics } from '../metrics/ApplicationLoadBalancerMetrics';
import { IOperation } from '../services/IOperation';
import { AvailabilityMetricType } from '../utilities/AvailabilityMetricType';
import { LatencyMetricType } from '../utilities/LatencyMetricType';
import { MetricsHelper } from '../utilities/MetricsHelper';
import { AvailabilityAndLatencyMetrics } from '../metrics/AvailabilityAndLatencyMetrics';

/**
 * Creates a service level availability and latency dashboard
 */
export class ServiceAvailabilityAndLatencyDashboard
  extends Construct
  implements IServiceAvailabilityAndLatencyDashboard {
 
  private static createServerSideWidgets(
    dashboard: Dashboard,
    props: ServiceAvailabilityAndLatencyDashboardProps
  ): void {
  
    let availabilityZones: string[] = props.service.availabilityZoneNames;
    let criticalOperations: IOperation[] =  props.service.operations.filter((x) => x.critical == true);
     
    dashboard.addWidgets(
      new TextWidget({
        markdown: "## **Server-side Metrics**",
        background: TextWidgetBackground.TRANSPARENT,
        height: 1,
        width: 24
      })
    );

    let zonalAvailabilityWidgets: IWidget[] = availabilityZones.map((availabilityZone: string) => {
      let azLetter: string = availabilityZone.substring(availabilityZone.length - 1);
      let availabilityZoneId: string = props.azMapper.availabilityZoneIdFromAvailabilityZoneLetter(azLetter);

      let criticalOperationsZonalMetrics: IMetric[] = criticalOperations.map((operation: IOperation, index: number) => {
        return AvailabilityAndLatencyMetrics.createZonalAvailabilityMetric({
          availabilityZoneId: availabilityZoneId,
          availabilityZone: availabilityZone,
          label: operation.operationName + " (avg: ${AVG}  min: ${MIN})",
          metricDetails: operation.serverSideAvailabilityMetricDetails,
          metricType: AvailabilityMetricType.SUCCESS_RATE,
          color: MetricsHelper.colors[index]
        },
        operation.serverSideAvailabilityMetricDetails.metricDimensions.zonalDimensions(
          availabilityZoneId,
          Aws.REGION
        ));
      });

      return new GraphWidget({
          height: 8,
          width: 6,
          title: `Availability - ${availabilityZoneId}`,
          region: Aws.REGION,
          left: criticalOperationsZonalMetrics,
          statistic: 'Sum',
          leftYAxis: {
            max: 100,
            min: 95,
            label: 'Percent',
            showUnits: false,
          }
        }
      )
    });

    let zonalFaultCountWidgets: IWidget[] = availabilityZones.map((availabilityZone: string) => {
      let azLetter: string = availabilityZone.substring(availabilityZone.length - 1);
      let availabilityZoneId: string = props.azMapper.availabilityZoneIdFromAvailabilityZoneLetter(azLetter);

      let criticalOperationsZonalMetrics: IMetric[] = criticalOperations.map((operation: IOperation, index: number) => {
        return AvailabilityAndLatencyMetrics.createZonalAvailabilityMetric({
          availabilityZoneId: availabilityZoneId,
          availabilityZone: availabilityZone,
          label: operation.operationName + " (avg: ${AVG}  min: ${MIN})",
          metricDetails: operation.serverSideAvailabilityMetricDetails,
          metricType: AvailabilityMetricType.FAULT_COUNT,
          color: MetricsHelper.colors[index]
        },
        operation.serverSideAvailabilityMetricDetails.metricDimensions.zonalDimensions(
          availabilityZoneId,
          Aws.REGION
        ));
      });

      return new GraphWidget({
          height: 6,
          width: 8,
          title: `Fault Count - ${availabilityZoneId} `,
          region: Aws.REGION,
          left: criticalOperationsZonalMetrics,
          statistic: 'Sum',
          leftYAxis: {
            min: 0,
            label: 'Count',
            showUnits: false,
          }
        }
      )
    });

    let perAZWidgetWithPerOperationLatency: IWidget[] = availabilityZones.map((availabilityZone: string) => {
      let azLetter: string = availabilityZone.substring(availabilityZone.length - 1);
      let availabilityZoneId: string = props.azMapper.availabilityZoneIdFromAvailabilityZoneLetter(azLetter);

      let criticalOperationsZonalMetrics: IMetric[] = criticalOperations.map((operation: IOperation, index: number) => {
        return AvailabilityAndLatencyMetrics.createZonalLatencyCountMetric({
          availabilityZoneId: availabilityZoneId,
          availabilityZone: availabilityZone,
          label: `${operation.operationName} (${operation.serverSideLatencyMetricDetails.alarmStatistic})` + " (avg: ${AVG}  min: ${MIN})",
          metricDetails: operation.serverSideLatencyMetricDetails,
          metricType: LatencyMetricType.SUCCESS_LATENCY,
          color: MetricsHelper.colors[index],
          statistic: operation.serverSideLatencyMetricDetails.alarmStatistic
        },
        operation.serverSideLatencyMetricDetails.metricDimensions.zonalDimensions(
          availabilityZoneId,
          Aws.REGION
        ));
      });

      return new GraphWidget({
          height: 6,
          width: 8,
          title: `Latency - ${availabilityZoneId}`,
          region: Aws.REGION,
          left: criticalOperationsZonalMetrics,
          leftYAxis: {
            min: 0,
            label: 'Milliseconds',
            showUnits: false,
          }
        }
      )
    });

    let perAZWidgetWithPerOperationHighLatencyCount: IWidget[] = availabilityZones.map((availabilityZone: string) => {
      let azLetter: string = availabilityZone.substring(availabilityZone.length - 1);
      let availabilityZoneId: string = props.azMapper.availabilityZoneIdFromAvailabilityZoneLetter(azLetter);

      let criticalOperationsZonalMetrics: IMetric[] = criticalOperations.map((operation: IOperation, index: number) => {
        return AvailabilityAndLatencyMetrics.createZonalLatencyCountMetric({
          availabilityZoneId: availabilityZoneId,
          availabilityZone: availabilityZone,
          label: operation.operationName + " (avg: ${AVG}  min: ${MIN})",
          metricDetails: operation.serverSideLatencyMetricDetails,
          metricType: LatencyMetricType.SUCCESS_LATENCY,
          color: MetricsHelper.colors[index],
          statistic: `TC(${operation.serverSideLatencyMetricDetails.successAlarmThreshold}:)`
        },
        operation.serverSideLatencyMetricDetails.metricDimensions.zonalDimensions(
          availabilityZoneId,
          Aws.REGION
        ));
      });

      return new GraphWidget({
          height: 6,
          width: 8,
          title: `High Latency Count - ${availabilityZoneId}`,
          region: Aws.REGION,
          left: criticalOperationsZonalMetrics,
          statistic: 'Sum',
          leftYAxis: {
            min: 0,
            label: 'Count',
            showUnits: false,
          }
        }
      )
    });

    dashboard.addWidgets(

      ...zonalAvailabilityWidgets,

      // Server-side per AZ fault count
      new GraphWidget({
        height: 8,
        width: 6,
        title: 'Fault Count',
        region: Aws.REGION,
        left: availabilityZones.map((availabilityZone: string) => {
          let azLetter: string = availabilityZone.substring(availabilityZone.length - 1);
          let availabilityZoneId: string = props.azMapper.availabilityZoneIdFromAvailabilityZoneLetter(azLetter);      
    
          let usingMetrics: { [key: string]: IMetric } = {};
    
          criticalOperations.forEach((operation: IOperation) => {
              
            usingMetrics[`${azLetter}_${operation.operationName}`] =
              AvailabilityAndLatencyMetrics.createZonalAvailabilityMetric({
                availabilityZoneId: availabilityZoneId,
                metricDetails: operation.serverSideAvailabilityMetricDetails,
                label: availabilityZoneId,
                metricType: AvailabilityMetricType.FAULT_COUNT,
                availabilityZone: availabilityZone
              },
              operation.serverSideAvailabilityMetricDetails.metricDimensions.zonalDimensions(
                availabilityZoneId,
                Aws.REGION
              ));
          });
    
          return new MathExpression({
            expression: Object.keys(usingMetrics).join('+'),
            label: availabilityZoneId,
            usingMetrics: usingMetrics,
            period: props.service.period
          });
        }),
        statistic: 'Sum',
        leftYAxis: {
          min: 0,
          label: 'Count',
          showUnits: false,
        },
        leftAnnotations: [
          {
            value: props.service.faultCountThreshold,
            visible: true,
            color: Color.RED,
            label: 'High Severity',
          },
        ]
      }),
      
      ...zonalFaultCountWidgets,
      ...perAZWidgetWithPerOperationLatency,
      ...perAZWidgetWithPerOperationHighLatencyCount
    );
  }

  private static createCanaryWidgets(
    dashboard: Dashboard,
    props: ServiceAvailabilityAndLatencyDashboardProps
  ): void {
  
    let availabilityZones: string[] = props.service.availabilityZoneNames;
    let criticalOperations: IOperation[] =  props.service.operations.filter((x) => x.critical == true);
     
    dashboard.addWidgets(
      new TextWidget({
        markdown: "## **Canary Metrics**",
        background: TextWidgetBackground.TRANSPARENT,
        height: 1,
        width: 24
      })
    );

    let zonalAvailabilityWidgets: IWidget[] = availabilityZones.map((availabilityZone: string) => {
      let azLetter: string = availabilityZone.substring(availabilityZone.length - 1);
      let availabilityZoneId: string = props.azMapper.availabilityZoneIdFromAvailabilityZoneLetter(azLetter);

      let criticalOperationsZonalMetrics: IMetric[] = criticalOperations.map((operation: IOperation, index: number) => {
        return AvailabilityAndLatencyMetrics.createZonalAvailabilityMetric({
          availabilityZoneId: availabilityZoneId,
          availabilityZone: availabilityZone,
          label: operation.operationName + " (avg: ${AVG}  min: ${MIN})",
          metricDetails: operation.canaryMetricDetails!.canaryAvailabilityMetricDetails,
          metricType: AvailabilityMetricType.SUCCESS_RATE,
          color: MetricsHelper.colors[index]
        },
        operation.canaryMetricDetails!.canaryAvailabilityMetricDetails.metricDimensions.zonalDimensions(
          availabilityZoneId,
          Aws.REGION
        ));
      });

      return new GraphWidget({
          height: 8,
          width: 6,
          title: `Availability - ${availabilityZoneId} `,
          region: Aws.REGION,
          left: criticalOperationsZonalMetrics,
          statistic: 'Sum',
          leftYAxis: {
            max: 100,
            min: 95,
            label: 'Percent',
            showUnits: false,
          }
        }
      )
    });

    let zonalFaultCountWidgets: IWidget[] = availabilityZones.map((availabilityZone: string) => {
      let azLetter: string = availabilityZone.substring(availabilityZone.length - 1);
      let availabilityZoneId: string = props.azMapper.availabilityZoneIdFromAvailabilityZoneLetter(azLetter);

      let criticalOperationsZonalMetrics: IMetric[] = criticalOperations.map((operation: IOperation, index: number) => {
        return AvailabilityAndLatencyMetrics.createZonalAvailabilityMetric({
          availabilityZoneId: availabilityZoneId,
          availabilityZone: availabilityZone,
          label: operation.operationName + " (avg: ${AVG}  min: ${MIN})",
          metricDetails: operation.canaryMetricDetails!.canaryAvailabilityMetricDetails,
          metricType: AvailabilityMetricType.FAULT_COUNT,
          color: MetricsHelper.colors[index]
        },
        operation.canaryMetricDetails!.canaryAvailabilityMetricDetails.metricDimensions.zonalDimensions(
          availabilityZoneId,
          Aws.REGION
        ));
      });

      return new GraphWidget({
          height: 6,
          width: 8,
          title: `Fault Count - ${availabilityZoneId}`,
          region: Aws.REGION,
          left: criticalOperationsZonalMetrics,
          statistic: 'Sum',
          leftYAxis: {
            min: 0,
            label: 'Count',
            showUnits: false,
          }
        }
      )
    });

    let perAZWidgetWithPerOperationLatency: IWidget[] = availabilityZones.map((availabilityZone: string, ) => {
      let azLetter: string = availabilityZone.substring(availabilityZone.length - 1);
      let availabilityZoneId: string = props.azMapper.availabilityZoneIdFromAvailabilityZoneLetter(azLetter);

      let criticalOperationsZonalMetrics: IMetric[] = criticalOperations.map((operation: IOperation, index: number) => {
        return AvailabilityAndLatencyMetrics.createZonalLatencyCountMetric({
          availabilityZoneId: availabilityZoneId,
          availabilityZone: availabilityZone,
          label: `${operation.operationName} (${operation.canaryMetricDetails!.canaryLatencyMetricDetails.alarmStatistic})` + " (avg: ${AVG}  min: ${MIN})",
          metricDetails: operation.canaryMetricDetails!.canaryLatencyMetricDetails,
          metricType: LatencyMetricType.SUCCESS_LATENCY,
          color: MetricsHelper.colors[index],
          statistic: operation.canaryMetricDetails!.canaryLatencyMetricDetails.alarmStatistic
        },
        operation.canaryMetricDetails!.canaryLatencyMetricDetails.metricDimensions.zonalDimensions(
          availabilityZoneId,
          Aws.REGION
        ));
      });

      return new GraphWidget({
          height: 6,
          width: 8,
          title: `Latency - ${availabilityZoneId}`,
          region: Aws.REGION,
          left: criticalOperationsZonalMetrics,
          leftYAxis: {
            min: 0,
            label: 'Milliseconds',
            showUnits: false,
          }
        }
      )
    });

    let perAZWidgetWithPerOperationHighLatencyCount: IWidget[] = availabilityZones.map((availabilityZone: string) => {
      let azLetter: string = availabilityZone.substring(availabilityZone.length - 1);
      let availabilityZoneId: string = props.azMapper.availabilityZoneIdFromAvailabilityZoneLetter(azLetter);

      let criticalOperationsZonalMetrics: IMetric[] = criticalOperations.map((operation: IOperation, index: number) => {
        return AvailabilityAndLatencyMetrics.createZonalLatencyCountMetric({
          availabilityZoneId: availabilityZoneId,
          availabilityZone: availabilityZone,
          label: operation.operationName + " (avg: ${AVG}  min: ${MIN})",
          metricDetails: operation.canaryMetricDetails!.canaryLatencyMetricDetails,
          metricType: LatencyMetricType.SUCCESS_LATENCY,
          color: MetricsHelper.colors[index],
          statistic: `TC(${operation.canaryMetricDetails!.canaryLatencyMetricDetails.successAlarmThreshold}:)`
        },
        operation.canaryMetricDetails!.canaryLatencyMetricDetails.metricDimensions.zonalDimensions(
          availabilityZoneId,
          Aws.REGION
        ));
      });

      return new GraphWidget({
          height: 6,
          width: 8,
          title: `High Latency Count - ${availabilityZoneId}`,
          region: Aws.REGION,
          left: criticalOperationsZonalMetrics,
          statistic: 'Sum',
          leftYAxis: {
            min: 0,
            label: 'Count',
            showUnits: false,
          }
        }
      )
    });

    dashboard.addWidgets(

      ...zonalAvailabilityWidgets,

      // Server-side per AZ fault count
      new GraphWidget({
        height: 8,
        width: 6,
        title: 'Fault Count',
        region: Aws.REGION,
        left: availabilityZones.map((availabilityZone: string) => {
          let azLetter: string = availabilityZone.substring(availabilityZone.length - 1);
          let availabilityZoneId: string = props.azMapper.availabilityZoneIdFromAvailabilityZoneLetter(azLetter);      
    
          let usingMetrics: { [key: string]: IMetric } = {};
    
          criticalOperations.forEach((operation: IOperation) => {
              
            usingMetrics[`${azLetter}_${operation.operationName}`] =
              AvailabilityAndLatencyMetrics.createZonalAvailabilityMetric({
                availabilityZoneId: availabilityZoneId,
                metricDetails: operation.serverSideAvailabilityMetricDetails,
                label: availabilityZoneId,
                metricType: AvailabilityMetricType.FAULT_COUNT,
                availabilityZone: availabilityZone
              },
              operation.serverSideAvailabilityMetricDetails.metricDimensions.zonalDimensions(
                availabilityZoneId,
                Aws.REGION
              ));
          });
    
          return new MathExpression({
            expression: Object.keys(usingMetrics).join('+'),
            label: availabilityZoneId,
            usingMetrics: usingMetrics,
            period: props.service.period
          });
        }),
        statistic: 'Sum',
        leftYAxis: {
          min: 0,
          label: 'Count',
          showUnits: false,
        },
        leftAnnotations: [
          {
            value: props.service.faultCountThreshold,
            visible: true,
            color: Color.RED,
            label: 'High Severity',
          },
        ]
      }),
      
      ...zonalFaultCountWidgets,
      ...perAZWidgetWithPerOperationLatency,
      ...perAZWidgetWithPerOperationHighLatencyCount
    );
     
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

    this.dashboard = new Dashboard(this, 'Dashboard', {
      dashboardName: `${props.service.serviceName.toLowerCase()}-availability-and-latency-${Aws.REGION}`,
      defaultInterval: props.interval,
      periodOverride: PeriodOverride.AUTO
    });

    this.dashboard.addWidgets(
      new AlarmStatusWidget({
        height: 2,
        width: 6,
        alarms: [
          props.serviceAlarmsAndRules.serviceImpactAlarm
        ],
        title: "Service Alarm (any critical operation sees impact zonally or regionally, measured from server-side or canary)"
      }),
      new AlarmStatusWidget({
        height: 2,
        width: 6,
        alarms: [
          props.serviceAlarmsAndRules.regionalImpactAlarm
        ],
        title: "Regional Impact (there is regionally scoped impact to any critical operation, measured from server-side or canary)"
      }),
      new AlarmStatusWidget({
        height: 2,
        width: 6,
        alarms: [
          props.serviceAlarmsAndRules.regionalServerSideImpactAlarm
        ],
        title: "Server-side Regional Impact (there is regionally scoped impact to any critical operation, measured from server-side)"
      }),
      ...props.serviceAlarmsAndRules.regionalCanaryAlarm ? [new AlarmStatusWidget({
        height: 2,
        width: 6,
        alarms: [
          props.serviceAlarmsAndRules.regionalCanaryAlarm
        ],
        title: "Canary Regional Impact (there is regionally scoped impact to any critical operation, measured from the canary)"
      })] : []
    );

    this.dashboard.addWidgets(
      new AlarmStatusWidget({
        height: 2,
        width: 24,
        alarms: [
          ...Object.values(props.serviceAlarmsAndRules.zonalAggregateIsolatedImpactAlarms)
        ],
        title: "Zonal Aggregate Alarms (alarms trigger if any critical operation in the AZ sees availability or latency impact as measured from server-side or canary)"
      }
    ));

    this.dashboard.addWidgets(
      new AlarmStatusWidget({
        height: 2,
        width: 24,
        alarms: [
          ...Object.values(props.serviceAlarmsAndRules.zonalServerSideIsolatedImpactAlarms)
        ],
        title: "Server-side Zonal Alarms (alarms trigger if any critical operation in the AZ sees availability or latency impact as measured from the server-side, these are useful for deployment monitoring, in case the canary sees errors when an AZ is intentionally unavailable)"
      }
    ));

    this.dashboard.addWidgets(
      new TextWidget({
        markdown: "### Per Operation Dashboards\n" + props.operationsDashboard.map(x => `- [${x.dashboardName}](https://${Aws.REGION}.console.aws.amazon.com/cloudwatch/home?region=${Aws.REGION}#dashboards/dashboard/${x.dashboardName})`).join("\n"),
        background: TextWidgetBackground.TRANSPARENT,
        height: 4,
        width: 24
      })
    );

    ServiceAvailabilityAndLatencyDashboard.createServerSideWidgets(this.dashboard, props);

    if (props.service.canaryTestProps) {
      ServiceAvailabilityAndLatencyDashboard.createCanaryWidgets(this.dashboard, props);
    }

    let lb: CfnLoadBalancer = props.service.loadBalancer?.node
      .defaultChild as CfnLoadBalancer;

    if (lb && lb.type == 'application') {
      this.dashboard.addWidgets(
        new TextWidget({
          markdown: "## **Load Balancer Metrics**",
          background: TextWidgetBackground.TRANSPARENT,
          height: 1,
          width: 24
        }),
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
