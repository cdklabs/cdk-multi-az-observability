// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import {
  AlarmRule,
  CompositeAlarm,
  IAlarm,
} from 'aws-cdk-lib/aws-cloudwatch';
import { Construct } from 'constructs';
import { IOperationAlarmsAndRules } from './IOperationAlarmsAndRules';
import { IServiceAlarmsAndRules } from './IServiceAlarmsAndRules';
import { ServiceAlarmsAndRulesProps } from './props/ServiceAlarmsAndRulesProps';
import { IService } from '../services/IService';
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
   * on availability or latency impact to any critical operation in that AZ. These are useful
   * for deployment monitoring to not inadvertently fail when a canary can't contact an AZ
   * during a deployment.
   */
  zonalServerSideIsolatedImpactAlarms: {[key: string]: IAlarm};

  /**
   * An alarm indicating the canary has discovered an availability or latency impact on a critical
   * operation while testing the regional endpoint.
   */
  regionalCanaryAlarm?: IAlarm;

  /**
   * An alarm indicating there is availability or latency impact on a critical operation
   * that is not scoped to a single availability zone as measured by the server-side and/or canary (if present)
   */
  regionalImpactAlarm: IAlarm;

  /**
   * An alarm indicating there is availability or latency impact on a critical operation
   * that is not scoped to a single availability zone as measured by the server-side
   */
  regionalServerSideImpactAlarm: IAlarm;

  /**
   * This is the top level alarm you should tie notifications/paging/alerting to. It triggers
   * on any impact to a critical operation either zonally scoped or regionally scoped.
   */
  serviceImpactAlarm: IAlarm;

  constructor(scope: Construct, id: string, props: ServiceAlarmsAndRulesProps) {
    super(scope, id);
    this.service = props.service;

    // Critical operation alarms and rules
    let criticalOperationAlarmsAndRules: IOperationAlarmsAndRules[] = Object.values(props.perOperationAlarmsAndRules).filter((operation: IOperationAlarmsAndRules) => operation.operation.critical == true);

    // Get the zonal impact alarms for the server side and in aggregate
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
            ...criticalOperationAlarmsAndRules.map((x) => x.aggregateZonalAlarms[availabilityZone]),
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
            ...criticalOperationAlarmsAndRules.map((x) => x.serverSideZonalAlarmsAndRules[availabilityZone].isolatedImpactAlarm),
          ),
        },
      );
    });

    this.regionalImpactAlarm = new CompositeAlarm(
      this,
      "regional-impact-alarm",
      {
        compositeAlarmName: `${props.service.serviceName.toLowerCase()}-regional-impact-alarm`,
        alarmRule: AlarmRule.anyOf(
          ...criticalOperationAlarmsAndRules.map((operation: IOperationAlarmsAndRules) => 
            operation.regionalImpactAlarm
          )
        )
      }
    );

    this.serviceImpactAlarm = new CompositeAlarm(
      this,
      "service-impact-alarm",
      {
        compositeAlarmName: `${props.service.serviceName.toLowerCase()}-impact-alarm`,
        alarmRule: AlarmRule.anyOf(
          this.regionalImpactAlarm,
          ...Object.values(this.zonalAggregateIsolatedImpactAlarms)
        )
      }
    )

    let serverSideRegionalAvailabilityOrLatencyAlarmsForCriticalOperations: IAlarm[] = criticalOperationAlarmsAndRules
      .map((operation: IOperationAlarmsAndRules) => operation.serverSideRegionalImpactAlarm);

    this.regionalServerSideImpactAlarm = new CompositeAlarm(
      this,
      "server-side-regional-alarm",
      {
        compositeAlarmName: `${props.service.serviceName.toLowerCase()}-server-side-regional-impact`,
        alarmRule: AlarmRule.anyOf(...serverSideRegionalAvailabilityOrLatencyAlarmsForCriticalOperations)
      }
    );

    let canaryRegionalAvailabilityOrLatencyAlarmsForCriticalOperations: IAlarm[] = criticalOperationAlarmsAndRules
      .filter((operation: IOperationAlarmsAndRules) => operation.canaryRegionalImpactAlarm)
      .map((operation: IOperationAlarmsAndRules) => operation.canaryRegionalImpactAlarm!);

    if (canaryRegionalAvailabilityOrLatencyAlarmsForCriticalOperations) {
      this.regionalCanaryAlarm = new CompositeAlarm(
        this,
        "canary-regional-alarm",
        {
          compositeAlarmName: `${props.service.serviceName.toLowerCase()}-canary-regional-impact`,
          alarmRule: AlarmRule.anyOf(...canaryRegionalAvailabilityOrLatencyAlarmsForCriticalOperations)
        }
      );
    }
  }
}
