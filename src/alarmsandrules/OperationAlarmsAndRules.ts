// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { Fn } from 'aws-cdk-lib';
import { AlarmRule, CompositeAlarm, IAlarm } from 'aws-cdk-lib/aws-cloudwatch';
import { BaseLoadBalancer } from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import { Construct } from 'constructs';
import { CanaryOperationRegionalAlarmsAndRules } from './CanaryOperationRegionalAlarmsAndRules';
import { CanaryOperationZonalAlarmsAndRules } from './CanaryOperationZonalAlarmsAndRules';
import { ICanaryOperationRegionalAlarmsAndRules } from './ICanaryOperationRegionalAlarmsAndRules';
import { ICanaryOperationZonalAlarmsAndRules } from './ICanaryOperationZonalAlarmsAndRules';
import { IOperationAlarmsAndRules } from './IOperationAlarmsAndRules';
import { IServerSideOperationRegionalAlarmsAndRules } from './IServerSideOperationRegionalAlarmsAndRules';
import { IServerSideOperationZonalAlarmsAndRules } from './IServerSideOperationZonalAlarmsAndRules';
import { OperationAlarmsAndRulesProps } from './props/OperationAlarmsAndRulesProps';
import { ServerSideOperationRegionalAlarmsAndRules } from './ServerSideOperationRegionalAlarmsAndRules';
import { ServerSideOperationZonalAlarmsAndRules } from './ServerSideOperationZonalAlarmsAndRules';
import { IOperation } from '../services/IOperation';

/**
 * Creates alarms and rules for an operation for both regional and zonal metrics
 */
export class OperationAlarmsAndRules
  extends Construct
  implements IOperationAlarmsAndRules {
  /**
   * The operation the alarms and rules are created for
   */
  readonly operation: IOperation;

  /**
   * The server side regional alarms and rules
   */
  readonly serverSideRegionalAlarmsAndRules: IServerSideOperationRegionalAlarmsAndRules;

  /**
   * The canary regional alarms and rules
   */
  readonly canaryRegionalAlarmsAndRules?: ICanaryOperationRegionalAlarmsAndRules;

  /**
   * The aggregate regional alarm that looks at both canary and server
   * side impact alarms for latency and availability
   */
  readonly aggregateRegionalAlarm: IAlarm;

  /**
   * The server side zonal alarms and rules
   */
  readonly serverSideZonalAlarmsAndRules: IServerSideOperationZonalAlarmsAndRules[];

  /**
   * The canary zonal alarms and rules
   */
  readonly canaryZonalAlarmsAndRules?: ICanaryOperationZonalAlarmsAndRules[];

  /**
   * The aggregate zonal alarms, one per AZ. Each alarm indicates there is either
   * latency or availability impact in that AZ, and the AZ is an outlier for
   * availability or latency impact. Both server side and canary metrics are
   * evaluated
   */
  readonly aggregateZonalAlarms: IAlarm[];

  /**
   * The aggregate zonal alarm indexed by Availability Zone Id.
   */
  readonly aggregateZonalAlarmsMap: { [key: string]: IAlarm };

  /**
   * Just the server side zonal alarms
   */
  readonly serverSideZonalAlarmsMap: { [key: string]: IAlarm };

  constructor(
    scope: Construct,
    id: string,
    props: OperationAlarmsAndRulesProps,
  ) {
    super(scope, id);
    this.serverSideZonalAlarmsAndRules = [];
    this.canaryZonalAlarmsAndRules = [];
    this.aggregateZonalAlarms = [];
    this.operation = props.operation;
    this.aggregateZonalAlarmsMap = {};
    this.serverSideZonalAlarmsMap = {};

    let availabilityZoneIds: string[] =
      props.operation.service.availabilityZoneNames.map((x) => {
        return props.azMapper.availabilityZoneIdFromAvailabilityZoneLetter(
          x.substring(x.length - 1),
        );
      });

    let loadBalancerArn: string = '';

    if (props.loadBalancer !== undefined) {
      loadBalancerArn = (props.loadBalancer as BaseLoadBalancer)
        .loadBalancerArn;
    }

    this.serverSideRegionalAlarmsAndRules =
      new ServerSideOperationRegionalAlarmsAndRules(
        this,
        props.operation.operationName + 'ServerSideRegionalAlarms',
        {
          availabilityMetricDetails:
            props.operation.serverSideAvailabilityMetricDetails,
          latencyMetricDetails: props.operation.serverSideLatencyMetricDetails,
          contributorInsightRuleDetails: props.operation
            .serverSideContributorInsightRuleDetails
            ? props.operation.serverSideContributorInsightRuleDetails
            : props.operation.service.defaultContributorInsightRuleDetails,
          nameSuffix: '-server',
        },
      );

    if (
      props.operation.canaryMetricDetails !== undefined &&
      props.operation.canaryMetricDetails != null
    ) {
      this.canaryRegionalAlarmsAndRules =
        new CanaryOperationRegionalAlarmsAndRules(
          this,
          props.operation.operationName + 'CanaryRegionalAlarms',
          {
            availabilityMetricDetails:
              props.operation.canaryMetricDetails
                .canaryAvailabilityMetricDetails,
            latencyMetricDetails:
              props.operation.canaryMetricDetails.canaryLatencyMetricDetails,
            nameSuffix: '-canary',
          },
        );

      this.aggregateRegionalAlarm = new CompositeAlarm(
        this,
        props.operation.operationName + 'AggregateRegionalAlarm',
        {
          actionsEnabled: false,
          compositeAlarmName:
            Fn.ref('AWS::Region') +
            '-' +
            props.operation.operationName.toLowerCase() +
            '-' +
            'aggregate-alarm',
          alarmRule: AlarmRule.anyOf(
            this.serverSideRegionalAlarmsAndRules.availabilityOrLatencyAlarm,
            this.canaryRegionalAlarmsAndRules.availabilityOrLatencyAlarm,
          ),
        },
      );
    } else {
      this.aggregateRegionalAlarm =
        this.serverSideRegionalAlarmsAndRules.availabilityOrLatencyAlarm;
    }

    let counter: number = 1;

    for (let i = 0; i < availabilityZoneIds.length; i++) {
      let availabilityZoneId: string = availabilityZoneIds[i];

      this.serverSideZonalAlarmsAndRules.push(
        new ServerSideOperationZonalAlarmsAndRules(
          this,
          props.operation.operationName +
            'AZ' +
            counter +
            'ServerSideZonalAlarmsAndRules',
          {
            availabilityZoneId: availabilityZoneId,
            availabilityMetricDetails:
              props.operation.serverSideAvailabilityMetricDetails,
            latencyMetricDetails:
              props.operation.serverSideLatencyMetricDetails,
            contributorInsightRuleDetails: props.operation
              .serverSideContributorInsightRuleDetails
              ? props.operation.serverSideContributorInsightRuleDetails
              : props.operation.service.defaultContributorInsightRuleDetails,
            counter: counter,
            outlierThreshold: props.outlierThreshold,
            outlierDetectionAlgorithm: props.outlierDetectionAlgorithm,
            nameSuffix: '-server',
            operation: props.operation,
            azMapper: props.azMapper,
            outlierDetectionFunction: props.outlierDetectionFunction,
          },
        ),
      );

      this.serverSideZonalAlarmsMap[availabilityZoneId] =
        this.serverSideZonalAlarmsAndRules[i].isolatedImpactAlarm;

      if (
        props.operation.canaryMetricDetails !== undefined &&
        props.operation.canaryMetricDetails != null
      ) {
        this.canaryZonalAlarmsAndRules.push(
          new CanaryOperationZonalAlarmsAndRules(
            this,
            props.operation.operationName +
              'AZ' +
              counter +
              'CanaryZonalAlarmsAndRules',
            {
              availabilityZoneId: availabilityZoneId,
              availabilityMetricDetails:
                props.operation.canaryMetricDetails
                  .canaryAvailabilityMetricDetails,
              latencyMetricDetails:
                props.operation.canaryMetricDetails.canaryLatencyMetricDetails,
              counter: counter,
              outlierThreshold: props.outlierThreshold,
              outlierDetectionAlgorithm: props.outlierDetectionAlgorithm,
              nameSuffix: '-canary',
              operation: props.operation,
              azMapper: props.azMapper,
              outlierDetectionFunction: props.outlierDetectionFunction,
            },
          ),
        );

        this.aggregateZonalAlarms.push(
          new CompositeAlarm(
            this,
            props.operation.operationName +
              'AZ' +
              counter +
              'AggregateZonalIsolatedImpactAlarm',
            {
              compositeAlarmName:
                availabilityZoneId +
                '-' +
                props.operation.operationName.toLowerCase() +
                '-aggregate-isolated-az-impact',
              alarmRule: AlarmRule.anyOf(
                this.canaryZonalAlarmsAndRules[i].isolatedImpactAlarm,
                this.serverSideZonalAlarmsAndRules[i].isolatedImpactAlarm,
              ),
              actionsEnabled: false,
              alarmDescription:
                '{"loadBalancer":"' +
                loadBalancerArn +
                '","az-id":"' +
                availabilityZoneId +
                '"}',
            },
          ),
        );
      } else {
        this.aggregateZonalAlarms.push(
          this.serverSideZonalAlarmsAndRules[i].isolatedImpactAlarm,
        );
      }

      this.aggregateZonalAlarmsMap[availabilityZoneId] =
        this.aggregateZonalAlarms[-1];

      counter++;
    }
  }
}
