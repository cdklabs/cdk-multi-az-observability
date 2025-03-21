// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
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
   * The aggregate zonal alarm indexed by Availability Zone Id.
   */
  readonly aggregateZonalAlarms: { [key: string]: IAlarm };

  /**
   * An alarm indicating availability or latency impact has been detected by the server-side 
   * and/or canary (if present) and the impact is regionally scoped, not zonal
   */
  readonly regionalImpactAlarm: IAlarm;

  /**
   * The server side zonal alarms and rules, indexed by Availability Zone name.
   */
  readonly serverSideZonalAlarmsAndRules: {[key: string]: IServerSideOperationZonalAlarmsAndRules};

  /**
   * The canary zonal alarms and rules, indexed by Availability Zone name.
   * 
   * @default - This is an empty dictionary if canary metric details are not provided
   */
  readonly canaryZonalAlarmsAndRules?: {[key: string]: ICanaryOperationZonalAlarmsAndRules};

  constructor(
    scope: Construct,
    id: string,
    props: OperationAlarmsAndRulesProps,
  ) {
    super(scope, id);

    this.operation = props.operation;
    this.aggregateZonalAlarms = {};
    this.serverSideZonalAlarmsAndRules = {};
    this.canaryZonalAlarmsAndRules = {};

    let loadBalancerArn: string = '';

    if (props.loadBalancer) {
      loadBalancerArn = (props.loadBalancer as BaseLoadBalancer)
        .loadBalancerArn;
    }

    // Creates the regional impact alarms and contributor insight rules
    // for contributors to regional faults and latency
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

    // If canary metrics are defined, create the regional impact
    // alarms 
    if (props.operation.canaryMetricDetails) {
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
    }

    // Create the zonal isolated impact alarms
    props.operation.service.availabilityZoneNames.forEach((availabilityZone: string, index: number) => {
      let azLetter: string = availabilityZone.substring(availabilityZone.length - 1);
      let availabilityZoneId: string = props.azMapper.availabilityZoneIdFromAvailabilityZoneLetter(azLetter);

      let serverSideZonalAlarmsAndRules: IServerSideOperationZonalAlarmsAndRules = new ServerSideOperationZonalAlarmsAndRules(
        this,
        props.operation.operationName +
          'AZ' +
          index +
          'ServerSideZonalAlarmsAndRules',
        {
          availabilityZone: availabilityZone,
          operationAlarmsAndRulesProps: props,
          counter: index,
          nameSuffix: '-server'
        },
      );

      this.serverSideZonalAlarmsAndRules[availabilityZone] = serverSideZonalAlarmsAndRules;

      if (props.operation.canaryMetricDetails) {
        let canaryZonalAlarmsAndRules: ICanaryOperationZonalAlarmsAndRules = new CanaryOperationZonalAlarmsAndRules(
          this,
          props.operation.operationName +
            'AZ' +
            index +
            'CanaryZonalAlarmsAndRules',
          {
            availabilityZone: availabilityZone,
            operationAlarmsAndRulesProps: props,
            counter: index,
            nameSuffix: '-canary'
          },
        );

        this.canaryZonalAlarmsAndRules![availabilityZone] = canaryZonalAlarmsAndRules;

        let aggAlarm: IAlarm = new CompositeAlarm(
          this,
          props.operation.operationName +
            'AZ' +
            index +
            'AggregateZonalIsolatedImpactAlarm',
          {
            compositeAlarmName:
              availabilityZoneId +
              '-' +
              props.operation.operationName.toLowerCase() +
              '-aggregate-isolated-az-impact',
            alarmRule: AlarmRule.anyOf(
              this.canaryZonalAlarmsAndRules![availabilityZone].isolatedImpactAlarm,
              this.serverSideZonalAlarmsAndRules[availabilityZone].isolatedImpactAlarm
            ),
            actionsEnabled: false,
            alarmDescription:
              '{"loadBalancer":"' +
              loadBalancerArn +
              '","az-id":"' +
              availabilityZoneId +
              '"}',
          },
        );
        
        this.aggregateZonalAlarms[availabilityZone] = aggAlarm;
      } else {       
        this.aggregateZonalAlarms[availabilityZone] = this.serverSideZonalAlarmsAndRules[availabilityZone].isolatedImpactAlarm    
      }
    });

    // Create a regional impact alarm that is triggered if regional
    // metrics for availability or latency drop and there isn't a single
    // AZ impact alarm 
    if (props.operation.canaryMetricDetails) {
      this.regionalImpactAlarm = new CompositeAlarm(this, props.operation.operationName + "-regional-impact-alarm", {
        compositeAlarmName: `${props.operation.service.serviceName.toLowerCase()}-${props.operation.operationName.toLowerCase()}-regional-impact`,
        alarmRule: AlarmRule.allOf(
          AlarmRule.anyOf(
            this.serverSideRegionalAlarmsAndRules.availabilityOrLatencyAlarm,
            this.canaryRegionalAlarmsAndRules!.availabilityOrLatencyAlarm
          ),
          AlarmRule.not(
            AlarmRule.anyOf(
              ...Object.values(this.aggregateZonalAlarms)
            )
          )
        )
      });
    }
    else {
      this.regionalImpactAlarm = new CompositeAlarm(this, props.operation.operationName + "-regional-impact-alarm", {
        compositeAlarmName: `${props.operation.service.serviceName.toLowerCase()}-${props.operation.operationName.toLowerCase()}-regional-impact`,
        alarmRule: AlarmRule.allOf(
          this.serverSideRegionalAlarmsAndRules.availabilityOrLatencyAlarm,     
          AlarmRule.not(
            AlarmRule.anyOf(
              ...Object.values(this.aggregateZonalAlarms)
            )
          )
        )
      });
    }
  }
}