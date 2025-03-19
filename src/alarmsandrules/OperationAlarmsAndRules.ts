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

    let loadBalancerArn: string = '';

    if (props.loadBalancer) {
      loadBalancerArn = (props.loadBalancer as BaseLoadBalancer)
        .loadBalancerArn;
    }

    // TODO: These are mostly used for the operation level dashboard,
    // may make sense to move this logic and similar canary logic there
    // or at least calculate a regional impact alarm when the operation
    // is impacted, but not in particular AZ

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

      // TODO: Can condense this logic and just pass the parent props as a parameter in these
      // props
      this.serverSideZonalAlarmsAndRules.push(
        new ServerSideOperationZonalAlarmsAndRules(
          this,
          props.operation.operationName +
            'AZ' +
            index +
            'ServerSideZonalAlarmsAndRules',
          {
            availabilityZone: availabilityZone,
            availabilityMetricDetails:
              props.operation.serverSideAvailabilityMetricDetails,
            latencyMetricDetails:
              props.operation.serverSideLatencyMetricDetails,
            contributorInsightRuleDetails: props.operation
              .serverSideContributorInsightRuleDetails
              ? props.operation.serverSideContributorInsightRuleDetails
              : props.operation.service.defaultContributorInsightRuleDetails,
            counter: index,
            availabilityOutlierThreshold: props.outlierThreshold,
            latencyOutlierThreshold: props.outlierThreshold,
            availabilityOutlierDetectionAlgorithm: props.outlierDetectionAlgorithm,
            latencyOutlierDetectionAlgorithm: props.outlierDetectionAlgorithm,
            nameSuffix: '-server',
            operation: props.operation,
            azMapper: props.azMapper,
            outlierDetectionFunction: props.outlierDetectionFunction,
          },
        ),
      );

      // TODO: Move all of the alarms to dictionaries based on AZ name
      // and maybe include AZ ID in that map
      this.serverSideZonalAlarmsMap[availabilityZoneId] =
        this.serverSideZonalAlarmsAndRules[index].isolatedImpactAlarm;

      if (
        props.operation.canaryMetricDetails !== undefined &&
        props.operation.canaryMetricDetails != null
      ) {
        this.canaryZonalAlarmsAndRules!.push(
          new CanaryOperationZonalAlarmsAndRules(
            this,
            props.operation.operationName +
              'AZ' +
              index +
              'CanaryZonalAlarmsAndRules',
            {
              availabilityZone: availabilityZone,
              availabilityMetricDetails:
                props.operation.canaryMetricDetails
                  .canaryAvailabilityMetricDetails,
              latencyMetricDetails:
                props.operation.canaryMetricDetails.canaryLatencyMetricDetails,
              counter: index,
              availabilityOutlierThreshold: props.outlierThreshold,
              latencyOutlierThreshold: props.outlierThreshold,
              latencyOutlierDetectionAlgorithm: props.outlierDetectionAlgorithm,
              availabilityOutlierDetectionAlgorithm: props.outlierDetectionAlgorithm,
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
              index +
              'AggregateZonalIsolatedImpactAlarm',
            {
              compositeAlarmName:
                availabilityZoneId +
                '-' +
                props.operation.operationName.toLowerCase() +
                '-aggregate-isolated-az-impact',
              alarmRule: AlarmRule.anyOf(
                this.canaryZonalAlarmsAndRules![index].isolatedImpactAlarm,
                this.serverSideZonalAlarmsAndRules[index].isolatedImpactAlarm,
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
          this.serverSideZonalAlarmsAndRules[index].isolatedImpactAlarm,
        );
      }

      this.aggregateZonalAlarmsMap[availabilityZoneId] =
        this.aggregateZonalAlarms[-1];
    });
  }
}