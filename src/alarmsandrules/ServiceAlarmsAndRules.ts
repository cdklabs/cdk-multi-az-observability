// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { Fn } from 'aws-cdk-lib';
import {
  Alarm,
  AlarmRule,
  ComparisonOperator,
  CompositeAlarm,
  IAlarm,
  IMetric,
  MathExpression,
} from 'aws-cdk-lib/aws-cloudwatch';
import { Construct } from 'constructs';
import { ICanaryOperationRegionalAlarmsAndRules } from './ICanaryOperationRegionalAlarmsAndRules';
import { IOperationAlarmsAndRules } from './IOperationAlarmsAndRules';
import { IServiceAlarmsAndRules } from './IServiceAlarmsAndRules';
import { ServiceAlarmsAndRulesProps } from './props/ServiceAlarmsAndRulesProps';
import { RegionalAvailabilityMetrics } from '../metrics/RegionalAvailabilityMetrics';
import { IService } from '../services/IService';
import { AvailabilityMetricType } from '../utilities/AvailabilityMetricType';
import { MetricsHelper } from '../utilities/MetricsHelper';

/**
 * Service level alarms and rules using critical operations
 */
export class ServiceAlarmsAndRules
  extends Construct
  implements IServiceAlarmsAndRules {
  /**
   * The service these alarms and rules are for
   */
  service: IService;

  /**
   * The zonal aggregate isolated impact alarms. There is 1 alarm per AZ that
   * triggers for availability or latency impact to any critical operation in that AZ
   * that indicates it has isolated impact as measured by canaries or server-side.
   */
  zonalAggregateIsolatedImpactAlarms: {[key: string]: IAlarm};

  /**
   * The zonal server-side isolated impact alarms. There is 1 alarm per AZ that triggers
   * on availability or atency impact to any critical operation in that AZ. These are useful
   * for deployment monitoring to not inadvertently fail when a canary can't contact an AZ
   * during a deployment.
   */
  zonalServerSideIsolatedImpactAlarms: {[key: string]: IAlarm};

  /**
   * An alarm for regional availability or latency impact of any critical operation as measured by the canary.
   */
  regionalAvailabilityOrLatencyCanaryAlarm?: IAlarm;

  /**
   * An alarm for regional availability impact of any critical operation as measured by the canary.
   */
  regionalAvailabilityCanaryAlarm?: IAlarm;

  /**
   * An alarm for regional availability or latency impact of any critical operation as measured by the server-side.
   */
  //regionalAvailabilityOrLatencyServerSideAlarm: IAlarm;

  /**
   * An alarm for regional availability impact of any critical operation as measured by the server-side.
   */
  //regionalAvailabilityServerSideAlarm: IAlarm;

  /**
   * An alarm for fault count exceeding a regional threshold for all critical operations.
   */
  regionalFaultCountServerSideAlarm: IAlarm;

  constructor(scope: Construct, id: string, props: ServiceAlarmsAndRulesProps) {
    super(scope, id);
    this.service = props.service;

    let criticalOperations: string[] = props.service.operations
      .filter((x) => x.critical == true)
      .map((x) => x.operationName);
    this.zonalAggregateIsolatedImpactAlarms = {};
    this.zonalServerSideIsolatedImpactAlarms = {};

    props.service.availabilityZoneNames.forEach((availabilityZone: string, index: number) => {
      let azLetter: string = availabilityZone.substring(availabilityZone.length - 1);
      let availabilityZonedId: string = props.azMapper.availabilityZoneIdFromAvailabilityZoneLetter(azLetter);

      this.zonalAggregateIsolatedImpactAlarms[availabilityZone] = new CompositeAlarm(
        this,
        'AZ' + index + 'ServiceAggregateIsolatedImpactAlarm',
        {
          compositeAlarmName:
            availabilityZonedId +
            '-' +
            props.service.serviceName.toLowerCase() +
            '-isolated-impact-aggregate-alarm',
          alarmRule: AlarmRule.anyOf(
            ...Object.values(
              Object.entries(props.perOperationAlarmsAndRules).reduce(
                (filtered, [key, value]) => {
                  if (criticalOperations.indexOf(key) > -1) {
                    filtered[key] = value;
                  }

                  return filtered;
                },
                {} as { [key: string]: IOperationAlarmsAndRules },
              ),
            ).map((x) => x.aggregateZonalAlarms[availabilityZone]),
          ),
        },
      );

      this.zonalServerSideIsolatedImpactAlarms[availabilityZone] = new CompositeAlarm(
        this,
        'AZ' + index + 'ServiceServerSideIsolatedImpactAlarm',
        {
          compositeAlarmName:
            availabilityZonedId +
            '-' +
            props.service.serviceName.toLowerCase() +
            '-isolated-impact-server-side-alarm',
          alarmRule: AlarmRule.anyOf(
            ...Object.values(
              Object.entries(props.perOperationAlarmsAndRules).reduce(
                (filtered, [key, value]) => {
                  if (criticalOperations.indexOf(key) > -1) {
                    filtered[key] = value;
                  }
                  return filtered;
                },
                {} as { [key: string]: IOperationAlarmsAndRules },
              ),
            ).map((x) => x.serverSideZonalAlarmsAndRules[availabilityZone].isolatedImpactAlarm),
          ),
        },
      );
    });

    let keyPrefix: string = '';

    let regionalOperationFaultCountMetrics: { [key: string]: IMetric } = {};

    props.service.operations
      .filter((x) => x.critical == true)
      .forEach((x) => {
        keyPrefix = MetricsHelper.nextChar(keyPrefix);

        regionalOperationFaultCountMetrics[keyPrefix] =
          RegionalAvailabilityMetrics.createRegionalAvailabilityMetric({
            label: x.operationName + ' fault count',
            metricDetails: x.serverSideAvailabilityMetricDetails,
            metricType: AvailabilityMetricType.FAULT_COUNT,
          });
      });

    let regionalFaultCount: IMetric = new MathExpression({
      usingMetrics: regionalOperationFaultCountMetrics,
      expression: Object.keys(regionalOperationFaultCountMetrics).join('+'),
      label: props.service.serviceName + ' fault count',
      period: props.service.period,
    });

    this.regionalFaultCountServerSideAlarm = new Alarm(
      this,
      'RegionalFaultCount',
      {
        alarmName:
          Fn.ref('AWS::Region') +
          '-' +
          props.service.serviceName.toLowerCase() +
          '-fault-count',
        datapointsToAlarm: 3,
        evaluationPeriods: 5,
        comparisonOperator: ComparisonOperator.GREATER_THAN_THRESHOLD,
        threshold: props.service.faultCountThreshold,
        alarmDescription:
          'Counts faults from all critical operation in the service',
        metric: regionalFaultCount,
      },
    );

    let canaryAlarms: IAlarm[] = Object.values(
      Object.entries(props.perOperationAlarmsAndRules).reduce(
        (filtered, [key, value]) => {
          if (criticalOperations.indexOf(key) > -1) {
            filtered[key] = value;
          }

          return filtered;
        },
        {} as { [key: string]: IOperationAlarmsAndRules },
      ),
    )
      .reduce((filtered, value) => {
        if (value.canaryRegionalAlarmsAndRules !== undefined) {
          filtered.push(value.canaryRegionalAlarmsAndRules);
        }
        return filtered;
      }, [] as ICanaryOperationRegionalAlarmsAndRules[])
      .map((x) => x.availabilityOrLatencyAlarm);

    if (
      canaryAlarms !== undefined &&
      canaryAlarms !== null &&
      canaryAlarms.length > 0
    ) {
      this.regionalAvailabilityOrLatencyCanaryAlarm = new CompositeAlarm(
        this,
        'ServiceCanaryAvailabilityOrLatencyAggregateAlarm',
        {
          compositeAlarmName:
            Fn.ref('AWS::Region') +
            '-' +
            props.service.serviceName.toLowerCase() +
            '-canary-availability-or-latency-aggregate-alarm',
          alarmRule: AlarmRule.anyOf(...canaryAlarms),
        },
      );
    }

    let canaryAvailabilityAlarms: IAlarm[] = Object.values(
      Object.entries(props.perOperationAlarmsAndRules).reduce(
        (filtered, [key, value]) => {
          if (criticalOperations.indexOf(key) > -1) {
            filtered[key] = value;
          }

          return filtered;
        },
        {} as { [key: string]: IOperationAlarmsAndRules },
      ),
    )
      .reduce((filtered, value) => {
        if (value.canaryRegionalAlarmsAndRules !== undefined) {
          filtered.push(value.canaryRegionalAlarmsAndRules);
        }
        return filtered;
      }, [] as ICanaryOperationRegionalAlarmsAndRules[])
      .map((x) => x.availabilityAlarm);

    if (
      canaryAvailabilityAlarms !== undefined &&
      canaryAvailabilityAlarms !== null &&
      canaryAvailabilityAlarms.length > 0
    ) {
      this.regionalAvailabilityCanaryAlarm = new CompositeAlarm(
        this,
        'ServiceCanaryAvailabilityAggregateAlarm',
        {
          compositeAlarmName:
            Fn.ref('AWS::Region') +
            '-' +
            props.service.serviceName.toLowerCase() +
            '-canary-availability-aggregate-alarm',
          alarmRule: AlarmRule.anyOf(...canaryAvailabilityAlarms),
        },
      );
    }

    /*this.regionalAvailabilityOrLatencyServerSideAlarm = new CompositeAlarm(
      this,
      'ServiceServerSideAggregateIsolatedImpactAlarm',
      {
        compositeAlarmName:
          Fn.ref('AWS::Region') +
          '-' +
          props.service.serviceName.toLowerCase() +
          '-server-side-aggregate-alarm',
        alarmRule: AlarmRule.anyOf(
          ...Object.values(
            Object.entries(props.perOperationAlarmsAndRules).reduce(
              (filtered, [key, value]) => {
                if (criticalOperations.indexOf(key) > -1) {
                  filtered[key] = value;
                }

                return filtered;
              },
              {} as { [key: string]: IOperationAlarmsAndRules },
            ),
          )
            .map((x) => x.serverSideRegionalAlarmsAndRules)
            .map((x) => x.availabilityOrLatencyAlarm),
        ),
      },
    );*/

    /*this.regionalAvailabilityServerSideAlarm = new CompositeAlarm(
      this,
      'ServiceServerSideAvailabilityAlarm',
      {
        compositeAlarmName:
          Fn.ref('AWS::Region') +
          '-' +
          props.service.serviceName.toLowerCase() +
          '-server-side-availability-alarm',
        alarmRule: AlarmRule.anyOf(
          ...Object.values(
            Object.entries(props.perOperationAlarmsAndRules).reduce(
              (filtered, [key, value]) => {
                if (criticalOperations.indexOf(key) > -1) {
                  filtered[key] = value;
                }

                return filtered;
              },
              {} as { [key: string]: IOperationAlarmsAndRules },
            ),
          )
            .map((x) => x.serverSideRegionalAlarmsAndRules)
            .map((x) => x.availabilityAlarm),
        ),
      },
    );*/
  }
}
