// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { Duration, Fn } from "aws-cdk-lib";
import {
  IAlarm,
  Alarm,
  IMetric,
  CompositeAlarm,
  AlarmRule,
  MathExpression,
  CfnInsightRule,
  ComparisonOperator,
  TreatMissingData,
} from "aws-cdk-lib/aws-cloudwatch";
import { CfnNatGateway } from "aws-cdk-lib/aws-ec2";
import {
  BaseLoadBalancer,
  IApplicationLoadBalancer,
  ILoadBalancerV2,
} from "aws-cdk-lib/aws-elasticloadbalancingv2";
import { IFunction } from "aws-cdk-lib/aws-lambda";
import { Construct, IConstruct } from "constructs";
import { IContributionDefinition, InsightRuleBody } from "./InsightRuleBody";
import { IAvailabilityZoneMapper } from "../azmapper/IAvailabilityZoneMapper";
import { RegionalAvailabilityMetrics } from "../metrics/RegionalAvailabilityMetrics";
import { RegionalLatencyMetrics } from "../metrics/RegionalLatencyMetrics";
import { ZonalAvailabilityMetrics } from "../metrics/ZonalAvailabilityMetrics";
import { ZonalLatencyMetrics } from "../metrics/ZonalLatencyMetrics";
import { IContributorInsightRuleDetails } from "../services/IContributorInsightRuleDetails";
import { IOperation } from "../services/IOperation";
import { IOperationMetricDetails } from "../services/IOperationMetricDetails";
import { AvailabilityMetricType } from "../utilities/AvailabilityMetricType";
import { LatencyMetricType } from "../utilities/LatencyMetricType";
import { OutlierDetectionAlgorithm } from "../utilities/OutlierDetectionAlgorithm";

/**
 * Class used to create availability and latency alarms and Contributor Insight rules
 */
export class AvailabilityAndLatencyAlarmsAndRules {
  /**
   * Creates a zonal availability alarm
   * @param scope
   * @param metricDetails
   * @param availabilityZoneId
   * @param nameSuffix
   * @param counter
   * @returns
   */
  static createZonalAvailabilityAlarm(
    scope: Construct,
    metricDetails: IOperationMetricDetails,
    availabilityZoneId: string,
    counter: number,
    nameSuffix?: string,
  ): IAlarm {
    return new Alarm(
      scope,
      metricDetails.operationName + "AZ" + counter + "AvailabilityAlarm",
      {
        alarmName:
          availabilityZoneId +
          "-" +
          metricDetails.operationName.toLowerCase() +
          "-success-rate" +
          nameSuffix,
        evaluationPeriods: metricDetails.evaluationPeriods,
        datapointsToAlarm: metricDetails.datapointsToAlarm,
        comparisonOperator: ComparisonOperator.LESS_THAN_THRESHOLD,
        threshold: metricDetails.successAlarmThreshold,
        actionsEnabled: false,
        treatMissingData: TreatMissingData.IGNORE,
        metric: ZonalAvailabilityMetrics.createZonalAvailabilityMetric({
          availabilityZoneId: availabilityZoneId,
          label: availabilityZoneId + " availability",
          metricDetails: metricDetails,
          metricType: AvailabilityMetricType.SUCCESS_RATE,
        }),
      },
    );
  }

  /**
   * Creates a zonal latency alarm
   * @param scope
   * @param metricDetails
   * @param availabilityZoneId
   * @param nameSuffix
   * @param counter
   * @returns
   */
  static createZonalLatencyAlarm(
    scope: Construct,
    metricDetails: IOperationMetricDetails,
    availabilityZoneId: string,
    counter: number,
    nameSuffix?: string,
  ): IAlarm {
    return new Alarm(
      scope,
      metricDetails.operationName + "AZ" + counter + "LatencyAlarm",
      {
        alarmName:
          availabilityZoneId +
          "-" +
          metricDetails.operationName.toLowerCase() +
          "-success-latency" +
          nameSuffix,
        evaluationPeriods: metricDetails.evaluationPeriods,
        datapointsToAlarm: metricDetails.datapointsToAlarm,
        comparisonOperator: ComparisonOperator.GREATER_THAN_THRESHOLD,
        threshold: metricDetails.successAlarmThreshold,
        actionsEnabled: false,
        treatMissingData: TreatMissingData.IGNORE,
        metric: ZonalLatencyMetrics.createZonalAverageLatencyMetric({
          availabilityZoneId: availabilityZoneId,
          label:
            availabilityZoneId +
            " " +
            metricDetails.alarmStatistic +
            " latency",
          metricDetails: metricDetails,
          metricType: LatencyMetricType.SUCCESS_LATENCY,
          statistic: metricDetails.alarmStatistic,
        }),
      },
    );
  }

  /**
   * Creates a composite alarm when either latency or availability is breached in the Availabiltiy Zone
   * @param scope
   * @param operation
   * @param availabilityZoneId
   * @param nameSuffix
   * @param counter
   * @param zonalAvailabilityAlarm
   * @param zonalLatencyAlarm
   * @returns
   */
  static createZonalAvailabilityOrLatencyCompositeAlarm(
    scope: Construct,
    operationName: string,
    availabilityZoneId: string,
    counter: number,
    zonalAvailabilityAlarm: IAlarm,
    zonalLatencyAlarm: IAlarm,
    nameSuffix?: string,
  ): IAlarm {
    return new CompositeAlarm(scope, "AZ" + counter + "ZonalImpactAlarm", {
      actionsEnabled: false,
      alarmDescription:
        availabilityZoneId +
        " has latency or availability impact. This does not indicate it is an outlier and shows isolated impact.",
      compositeAlarmName:
        availabilityZoneId +
        `-${operationName.toLowerCase()}-impact-aggregate-alarm` +
        nameSuffix,
      alarmRule: AlarmRule.anyOf(zonalAvailabilityAlarm, zonalLatencyAlarm),
    });
  }

  /**
   * An alarm that compares error rate in this AZ to the overall region error based only on metric data
   * @param scope
   * @param metricDetails
   * @param availabilityZoneId
   * @param nameSuffix
   * @param counter
   * @param outlierThreshold
   * @returns
   */
  static createZonalFaultRateStaticOutlierAlarm(
    scope: Construct,
    metricDetails: IOperationMetricDetails,
    availabilityZoneId: string,
    counter: number,
    outlierThreshold: number,
    nameSuffix?: string,
  ): IAlarm {
    let zonalFaults: IMetric =
      ZonalAvailabilityMetrics.createZonalAvailabilityMetric({
        availabilityZoneId: availabilityZoneId,
        metricDetails: metricDetails,
        metricType: AvailabilityMetricType.FAULT_COUNT,
        keyPrefix: "a",
      });

    let regionalFaults: IMetric =
      RegionalAvailabilityMetrics.createRegionalAvailabilityMetric({
        metricDetails: metricDetails,
        metricType: AvailabilityMetricType.FAULT_COUNT,
        keyPrefix: "b",
      });

    return new Alarm(scope, "AZ" + counter + "IsolatedImpactAlarmStatic", {
      alarmName:
        availabilityZoneId +
        `-${metricDetails.operationName.toLowerCase()}-static-majority-errors-impact` +
        nameSuffix,
      metric: new MathExpression({
        expression: "IF(m2 > 0, (m1 / m2), 0)",
        usingMetrics: {
          m1: zonalFaults,
          m2: regionalFaults,
        },
        period: metricDetails.period,
        label: availabilityZoneId + " percent faults",
      }),
      threshold: outlierThreshold,
      comparisonOperator: ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
      treatMissingData: TreatMissingData.NOT_BREACHING,
      evaluationPeriods: metricDetails.evaluationPeriods,
      datapointsToAlarm: metricDetails.datapointsToAlarm,
    });
  }

  static createZonalFaultRateOutlierAlarm(
    scope: IConstruct,
    metricDetails: IOperationMetricDetails,
    availabilityZoneId: string,
    allAvailabilityZoneIds: string[],
    outlierThreshold: number,
    outlierDetectionFunction: IFunction,
    outlierDetectionAlgorithm: OutlierDetectionAlgorithm,
    counter: number,
    nameSuffix?: string,
  ): IAlarm {
    let metricDimensions: { [key: string]: { [key: string]: string }[] } = {};

    allAvailabilityZoneIds.forEach((azId: string) => {
      metricDimensions[azId] = [
        metricDetails.metricDimensions.zonalDimensions(
          azId,
          Fn.ref("AWS::Region"),
        ),
      ];
    });

    let str: string = JSON.stringify(metricDimensions)
      .replace(/[\\]/g, "\\\\")
      .replace(/[\"]/g, '\\"')
      .replace(/[\/]/g, "\\/")
      .replace(/[\b]/g, "\\b")
      .replace(/[\f]/g, "\\f")
      .replace(/[\n]/g, "\\n")
      .replace(/[\r]/g, "\\r")
      .replace(/[\t]/g, "\\t");

    let outlierMetrics: IMetric = new MathExpression({
      expression:
        `MAX(LAMBDA("${outlierDetectionFunction.functionName}",` +
        `"${outlierDetectionAlgorithm.toString()}",` +
        `"${outlierThreshold}",` +
        `"${availabilityZoneId}",` +
        `"${str}",` +
        `"${metricDetails.metricNamespace}",` +
        `"${metricDetails.faultMetricNames.join(":")}",` +
        '"Sum",' +
        '"Count"' +
        "))",
      period: Duration.seconds(60),
    });

    return new Alarm(
      scope,
      "AZ" + counter + "FaultIsolatedImpactAlarmOutlier",
      {
        alarmName:
          availabilityZoneId +
          `-${metricDetails.operationName.toLowerCase()}-majority-errors-impact` +
          nameSuffix,
        metric: outlierMetrics,
        threshold: 1,
        comparisonOperator:
          ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
        treatMissingData: TreatMissingData.NOT_BREACHING,
        evaluationPeriods: metricDetails.evaluationPeriods,
        datapointsToAlarm: metricDetails.datapointsToAlarm,
      },
    );
  }

  static createZonalFaultRateOutlierAlarmForAlb(
    scope: IConstruct,
    loadBalancers: IApplicationLoadBalancer[],
    availabilityZoneId: string,
    outlierThreshold: number,
    outlierDetectionFunction: IFunction,
    outlierDetectionAlgorithm: OutlierDetectionAlgorithm,
    azMapper: IAvailabilityZoneMapper,
    counter: number,
    evaluationPeriods: number,
    datapointsToAlarm: number,
    nameSuffix?: string,
  ): IAlarm {
    let metricDimensions: { [key: string]: { [key: string]: string }[] } = {};

    loadBalancers.forEach((x) => {
      x.vpc?.availabilityZones.forEach((az) => {
        let azId = azMapper.availabilityZoneIdFromAvailabilityZoneLetter(
          az.substring(az.length - 1),
        );
        if (!(azId in metricDimensions)) {
          metricDimensions[azId] = [];
        }

        metricDimensions[azId].push({
          AvailabilityZone: az,
          LoadBalancer: (x as ILoadBalancerV2 as BaseLoadBalancer)
            .loadBalancerFullName,
        });
      });
    });

    let str: string = JSON.stringify(metricDimensions)
      .replace(/[\\]/g, "\\\\")
      .replace(/[\"]/g, '\\"')
      .replace(/[\/]/g, "\\/")
      .replace(/[\b]/g, "\\b")
      .replace(/[\f]/g, "\\f")
      .replace(/[\n]/g, "\\n")
      .replace(/[\r]/g, "\\r")
      .replace(/[\t]/g, "\\t");

    let outlierMetrics: IMetric = new MathExpression({
      expression:
        `MAX(LAMBDA("${outlierDetectionFunction.functionName}",` +
        `"${outlierDetectionAlgorithm.toString()}",` +
        `"${outlierThreshold}",` +
        `"${availabilityZoneId}",` +
        `"${str}",` +
        '"AWS/ApplicationELB",' +
        '"HTTPCode_ELB_5XX_Count:HTTPCode_Target_5XX_Count",' +
        '"Sum",' +
        '"Count"' +
        "))",
      period: Duration.seconds(60),
    });

    return new Alarm(scope, "AZ" + counter + "AlbIsolatedImpactAlarmOutlier", {
      alarmName:
        availabilityZoneId + "-alb-majority-errors-impact" + nameSuffix,
      metric: outlierMetrics,
      threshold: 1,
      comparisonOperator: ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
      treatMissingData: TreatMissingData.NOT_BREACHING,
      evaluationPeriods: evaluationPeriods,
      datapointsToAlarm: datapointsToAlarm,
    });
  }

  static createZonalFaultRateOutlierAlarmForNatGW(
    scope: IConstruct,
    natGateways: { [key: string]: CfnNatGateway[] },
    availabilityZoneId: string,
    outlierThreshold: number,
    outlierDetectionFunction: IFunction,
    outlierDetectionAlgorithm: OutlierDetectionAlgorithm,
    azMapper: IAvailabilityZoneMapper,
    counter: number,
    evaluationPeriods: number,
    datapointsToAlarm: number,
    nameSuffix?: string,
  ): IAlarm {
    let metricDimensions: { [key: string]: { [key: string]: string }[] } = {};

    Object.keys(natGateways).forEach((az) => {
      let azId = azMapper.availabilityZoneIdFromAvailabilityZoneLetter(
        az.substring(az.length - 1),
      );

      if (!(azId in metricDimensions)) {
        metricDimensions[azId] = [];
      }

      natGateways[az].forEach((natgw) => {
        metricDimensions[azId].push({
          NatGatewayId: natgw.attrNatGatewayId,
        });
      });
    });

    let str: string = JSON.stringify(metricDimensions)
      .replace(/[\\]/g, "\\\\")
      .replace(/[\"]/g, '\\"')
      .replace(/[\/]/g, "\\/")
      .replace(/[\b]/g, "\\b")
      .replace(/[\f]/g, "\\f")
      .replace(/[\n]/g, "\\n")
      .replace(/[\r]/g, "\\r")
      .replace(/[\t]/g, "\\t");

    let outlierMetrics: IMetric = new MathExpression({
      expression:
        `MAX(LAMBDA("${outlierDetectionFunction.functionName}",` +
        `"${outlierDetectionAlgorithm.toString()}",` +
        `"${outlierThreshold}",` +
        `"${availabilityZoneId}",` +
        `"${str}",` +
        '"AWS/NATGateway",' +
        '"PacketsDropCount",' +
        '"Sum",' +
        '"Count"' +
        "))",
      period: Duration.seconds(60),
    });

    return new Alarm(
      scope,
      "AZ" + counter + "NatGWIsolatedImpactAlarmOutlier",
      {
        alarmName:
          availabilityZoneId + "-nat-gw-majority-errors-impact" + nameSuffix,
        metric: outlierMetrics,
        threshold: 1,
        comparisonOperator:
          ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
        treatMissingData: TreatMissingData.NOT_BREACHING,
        evaluationPeriods: evaluationPeriods,
        datapointsToAlarm: datapointsToAlarm,
      },
    );
  }

  static createZonalHighLatencyOutlierAlarm(
    scope: IConstruct,
    metricDetails: IOperationMetricDetails,
    availabilityZoneId: string,
    allAvailabilityZoneIds: string[],
    outlierThreshold: number,
    outlierDetectionFunction: IFunction,
    outlierDetectionAlgorithm: OutlierDetectionAlgorithm,
    counter: number,
    nameSuffix?: string,
  ): IAlarm {
    let metricDimensions: { [key: string]: { [key: string]: string }[] } = {};

    allAvailabilityZoneIds.forEach((azId: string) => {
      metricDimensions[azId] = [
        metricDetails.metricDimensions.zonalDimensions(
          azId,
          Fn.ref("AWS::Region"),
        ),
      ];
    });

    let str: string = JSON.stringify(metricDimensions)
      .replace(/[\\]/g, "\\\\")
      .replace(/[\"]/g, '\\"')
      .replace(/[\/]/g, "\\/")
      .replace(/[\b]/g, "\\b")
      .replace(/[\f]/g, "\\f")
      .replace(/[\n]/g, "\\n")
      .replace(/[\r]/g, "\\r")
      .replace(/[\t]/g, "\\t");

    let outlierMetrics: IMetric = new MathExpression({
      expression:
        `MAX(LAMBDA("${outlierDetectionFunction.functionName}",` +
        `"${outlierDetectionAlgorithm.toString()}",` +
        `"${outlierThreshold}",` +
        `"${availabilityZoneId}",` +
        `"${str}",` +
        `"${metricDetails.metricNamespace}",` +
        `"${metricDetails.successMetricNames.join(":")}",` +
        `"TC(${metricDetails.successAlarmThreshold}:)",` +
        '"Milliseconds"' +
        "))",
      period: Duration.seconds(60),
    });

    return new Alarm(
      scope,
      metricDetails.operationName +
        "AZ" +
        counter +
        "LatencyIsolatedImpactAlarmOutlier",
      {
        alarmName:
          availabilityZoneId +
          `-${metricDetails.operationName.toLowerCase()}-majority-high-latency-impact` +
          nameSuffix,
        metric: outlierMetrics,
        threshold: 1,
        comparisonOperator:
          ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
        treatMissingData: TreatMissingData.NOT_BREACHING,
        evaluationPeriods: metricDetails.evaluationPeriods,
        datapointsToAlarm: metricDetails.datapointsToAlarm,
      },
    );
  }

  static createZonalHighLatencyStaticOutlierAlarm(
    scope: Construct,
    metricDetails: IOperationMetricDetails,
    availabilityZoneId: string,
    counter: number,
    outlierThreshold: number,
    nameSuffix?: string,
  ): IAlarm {
    let zonalLatency: IMetric =
      ZonalLatencyMetrics.createZonalCountLatencyMetric({
        availabilityZoneId: availabilityZoneId,
        label:
          availabilityZoneId +
          "-" +
          metricDetails.operationName +
          "-high-latency-requests",
        metricDetails: metricDetails,
        metricType: LatencyMetricType.SUCCESS_LATENCY,
        statistic: `TC(${metricDetails.successAlarmThreshold}:)`,
        keyPrefix: "a",
      });

    let regionalLatency: IMetric =
      RegionalLatencyMetrics.createRegionalLatencyCountMetric({
        label:
          Fn.ref("AWS::Region") +
          "-" +
          metricDetails.operationName +
          "-high-latency-requests",
        metricDetails: metricDetails,
        metricType: LatencyMetricType.SUCCESS_LATENCY,
        statistic: `TC(${metricDetails.successAlarmThreshold}:)`,
        keyPrefix: "b",
      });

    return new Alarm(
      scope,
      metricDetails.operationName +
        "AZ" +
        counter +
        "IsolatedImpactAlarmStatic",
      {
        alarmName:
          availabilityZoneId +
          `-${metricDetails.operationName.toLowerCase()}-static-majority-high-latency-impact` +
          nameSuffix,
        metric: new MathExpression({
          expression: "IF(m2 > 0, (m1 / m2), 0)",
          usingMetrics: {
            m1: zonalLatency,
            m2: regionalLatency,
          },
          period: metricDetails.period,
          label: availabilityZoneId + " percent high latency requests",
        }),
        threshold: outlierThreshold,
        comparisonOperator:
          ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
        treatMissingData: TreatMissingData.NOT_BREACHING,
        evaluationPeriods: metricDetails.evaluationPeriods,
        datapointsToAlarm: metricDetails.datapointsToAlarm,
      },
    );
  }

  /**
   * An insight rule that calculates how many instances are responding to requests in
   * the specified AZ. Only useful for server-side metrics since the canary doesn't record instance id metrics.
   * @param scope
   * @param metricDetails
   * @param availabilityZoneId
   * @param logGroups
   * @param nameSuffix
   * @param counter
   * @param instanceIdPath
   * @param operationNamePath
   * @param availabilityZoneIdPath
   * @returns
   */
  static createServerSideInstancesHandlingRequestsInThisAZRule(
    scope: Construct,
    operationName: string,
    availabilityZoneId: string,
    ruleDetails: IContributorInsightRuleDetails,
    counter: number,
    nameSuffix?: string,
  ): CfnInsightRule {
    let ruleBody = new InsightRuleBody();
    ruleBody.logGroupNames = ruleDetails.logGroups.map((x) => x.logGroupName);
    ruleBody.aggregateOn = "Count";
    ruleBody.logFormat = "JSON";

    ruleBody.contribution = {
      keys: [ruleDetails.instanceIdJsonPath],
      filters: [
        {
          Match: ruleDetails.availabilityZoneIdJsonPath,
          In: [availabilityZoneId],
        },
        {
          Match: ruleDetails.operationNameJsonPath,
          In: [operationName],
        },
      ],
    } as unknown as IContributionDefinition;

    return new CfnInsightRule(scope, "AZ" + counter + "InstancesInTheAZRule", {
      ruleName:
        availabilityZoneId +
        `-${operationName.toLowerCase()}-instances-in-the-az` +
        nameSuffix,
      ruleState: "ENABLED",
      ruleBody: ruleBody.toJson(),
    });
  }

  /**
   * An insight rule that calculates the instances contributing to errors
   * in this AZ. Only useful for server-side metrics since the canary doesn't record instance id metrics.
   * @param scope
   * @param operation
   * @param availabilityZoneId
   * @param logGroups
   * @param nameSuffix
   * @param counter
   * @param instanceIdPath
   * @param operationNamePath
   * @param availabilityZoneIdPath
   * @param errorMetricPath
   * @returns
   */
  static createServerSideInstanceFaultContributorsInThisAZRule(
    scope: Construct,
    operationName: string,
    availabilityZoneId: string,
    ruleDetails: IContributorInsightRuleDetails,
    counter: number,
    nameSuffix?: string,
  ): CfnInsightRule {
    let ruleBody = new InsightRuleBody();
    ruleBody.logGroupNames = ruleDetails.logGroups.map((x) => x.logGroupName);
    ruleBody.aggregateOn = "Count";
    ruleBody.logFormat = "JSON";
    ruleBody.contribution = {
      keys: [ruleDetails.instanceIdJsonPath],
      filters: [
        {
          Match: ruleDetails.availabilityZoneIdJsonPath,
          In: [availabilityZoneId],
        },
        {
          Match: ruleDetails.operationNameJsonPath,
          In: [operationName],
        },
        {
          Match: ruleDetails.faultMetricJsonPath,
          GreaterThan: 0,
        },
      ],
    } as unknown as IContributionDefinition;

    return new CfnInsightRule(
      scope,
      "AZ" + counter + "InstanceErrorContributionRule",
      {
        ruleName:
          availabilityZoneId +
          `-${operationName.toLowerCase()}-per-instance-faults` +
          nameSuffix,
        ruleState: "ENABLED",
        ruleBody: ruleBody.toJson(),
      },
    );
  }

  /**
   * An insight rule that calculates instances contributing to high latency in this AZ. Only
   * useful for server-side metrics since the canary doesn't record instance id metrics.
   * @param scope
   * @param metricDetails
   * @param availabilityZoneId
   * @param logGroups
   * @param nameSuffix
   * @param counter
   * @returns
   */
  static createServerSideInstanceHighLatencyContributorsInThisAZRule(
    scope: Construct,
    metricDetails: IOperationMetricDetails,
    availabilityZoneId: string,
    ruleDetails: IContributorInsightRuleDetails,
    counter: number,
    nameSuffix?: string,
  ): CfnInsightRule {
    let ruleBody = new InsightRuleBody();
    ruleBody.logGroupNames = ruleDetails.logGroups.map((x) => x.logGroupName);
    ruleBody.aggregateOn = "Count";
    ruleBody.logFormat = "JSON";
    ruleBody.contribution = {
      keys: [ruleDetails.instanceIdJsonPath],
      filters: [
        {
          Match: ruleDetails.availabilityZoneIdJsonPath,
          In: [availabilityZoneId],
        },
        {
          Match: ruleDetails.operationNameJsonPath,
          In: [metricDetails.operationName],
        },
        {
          Match: ruleDetails.successLatencyMetricJsonPath,
          GreaterThan: metricDetails.successAlarmThreshold,
        },
      ],
    } as unknown as IContributionDefinition;

    return new CfnInsightRule(
      scope,
      "AZ" + counter + "LatencyContributorsRule",
      {
        ruleName:
          availabilityZoneId +
          `-${metricDetails.operationName.toLowerCase()}-per-instance-high-latency` +
          nameSuffix,
        ruleState: "ENABLED",
        ruleBody: ruleBody.toJson(),
      },
    );
  }

  /**
   * An alarm that indicates some percentage of the instances in this AZ are producing errors. Only
   * useful for server-side metrics since the canary doesn't record instance id metrics.
   * @param scope
   * @param metricDetails
   * @param availabilityZoneId
   * @param nameSuffix
   * @param counter
   * @param outlierThreshold
   * @param instanceFaultRateContributorsInThisAZ
   * @param instancesHandlingRequestsInThisAZ
   * @returns
   */
  static createServerSideZonalMoreThanOneInstanceProducingFaultsAlarm(
    scope: Construct,
    metricDetails: IOperationMetricDetails,
    availabilityZoneId: string,
    counter: number,
    outlierThreshold: number,
    instanceFaultRateContributorsInThisAZ: CfnInsightRule,
    instancesHandlingRequestsInThisAZ: CfnInsightRule,
    nameSuffix?: string,
  ): IAlarm {
    return new Alarm(scope, "AZ" + counter + "MoreThanOneAlarmForErrors", {
      alarmName:
        availabilityZoneId +
        `-${metricDetails.operationName.toLowerCase()}-multiple-instances-faults` +
        nameSuffix,
      metric: new MathExpression({
        expression: `INSIGHT_RULE_METRIC(\"${instanceFaultRateContributorsInThisAZ.attrRuleName}\", \"UniqueContributors\") / INSIGHT_RULE_METRIC(\"${instancesHandlingRequestsInThisAZ.attrRuleName}\", \"UniqueContributors\")`,
        period: metricDetails.period,
      }),
      evaluationPeriods: metricDetails.evaluationPeriods,
      threshold: outlierThreshold,
      comparisonOperator: ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
      datapointsToAlarm: metricDetails.datapointsToAlarm,
      actionsEnabled: false,
      treatMissingData: TreatMissingData.IGNORE,
    });
  }

  /**
   * An alarm indicating more than some percentage of instances in this AZ
   * are contributing to high latency. Only useful for server-side metrics since
   * the canary doesn't record instance id metrics.
   * @param scope
   * @param metricDetails
   * @param availabilityZoneId
   * @param nameSuffix
   * @param counter
   * @param outlierThreshold
   * @param instanceHighLatencyContributorsInThisAZ
   * @param instancesHandlingRequestsInThisAZ
   * @returns
   */
  static createServerSideZonalMoreThanOneInstanceProducingHighLatencyAlarm(
    scope: Construct,
    metricDetails: IOperationMetricDetails,
    availabilityZoneId: string,
    counter: number,
    outlierThreshold: number,
    instanceHighLatencyContributorsInThisAZ: CfnInsightRule,
    instancesHandlingRequestsInThisAZ: CfnInsightRule,
    nameSuffix?: string,
  ): IAlarm {
    return new Alarm(scope, "AZ" + counter + "MoreThanOneAlarmForHighLatency", {
      alarmName:
        availabilityZoneId +
        `-${metricDetails.operationName.toLowerCase()}-multiple-instances-high-latency` +
        nameSuffix,
      metric: new MathExpression({
        expression: `INSIGHT_RULE_METRIC(\"${instanceHighLatencyContributorsInThisAZ.attrRuleName}\", \"UniqueContributors\") / INSIGHT_RULE_METRIC(\"${instancesHandlingRequestsInThisAZ.attrRuleName}\", \"UniqueContributors\")`,
        period: metricDetails.period,
      }),
      evaluationPeriods: metricDetails.evaluationPeriods,
      threshold: outlierThreshold,
      comparisonOperator: ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
      datapointsToAlarm: metricDetails.datapointsToAlarm,
      actionsEnabled: false,
      treatMissingData: TreatMissingData.IGNORE,
    });
  }

  /**
   * An alarm that indicates this AZ as an outlier
   * for availability or latency. This does not ensure that the errors
   * or latency originate from more than one instance.
   * @param scope
   * @param operation
   * @param availabilityZoneId
   * @param logGroups
   * @param nameSuffix
   * @param counter
   * @param azIsOutlierForFaultsAlarm
   * @param availabilityImpactAlarm
   * @param azIsOutlierForLatencyAlarm
   * @param latencyImpactAlarm
   * @returns
   */
  static createCanaryIsolatedAZImpactAlarm(
    scope: Construct,
    operationName: string,
    availabilityZoneId: string,
    counter: number,
    azIsOutlierForFaultsAlarm: IAlarm,
    availabilityImpactAlarm: IAlarm,
    azIsOutlierForLatencyAlarm: IAlarm,
    latencyImpactAlarm: IAlarm,
    nameSuffix?: string,
  ): IAlarm {
    return new CompositeAlarm(
      scope,
      operationName + "AZ" + counter + "IsolatedImpactAlarm" + nameSuffix,
      {
        compositeAlarmName:
          availabilityZoneId +
          `-${operationName.toLowerCase()}-isolated-impact-alarm` +
          nameSuffix,
        alarmRule: AlarmRule.anyOf(
          AlarmRule.allOf(azIsOutlierForFaultsAlarm, availabilityImpactAlarm),
          AlarmRule.allOf(azIsOutlierForLatencyAlarm, latencyImpactAlarm),
        ),
        actionsEnabled: false,
      },
    );
  }

  /**
   * Creates the server side alarm to identify isolated single AZ
   * impact meaning that this one AZ is affected and the others aren't
   * @param scope
   * @param operation
   * @param availabilityZoneId
   * @param nameSuffix
   * @param counter
   * @param azIsOutlierForFaultsAlarm
   * @param availabilityImpactAlarm
   * @param moreThanOneInstanceContributingToFaults
   * @param azIsOutlierForLatencyAlarm
   * @param latencyImpactAlarm
   * @param moreThanOneInstanceContributingToLatency
   * @returns
   */
  static createServerSideIsolatedAZImpactAlarm(
    scope: Construct,
    operationName: string,
    availabilityZoneId: string,
    counter: number,
    azIsOutlierForFaultsAlarm: IAlarm,
    availabilityImpactAlarm: IAlarm,
    moreThanOneInstanceContributingToFaults: IAlarm,
    azIsOutlierForLatencyAlarm: IAlarm,
    latencyImpactAlarm: IAlarm,
    moreThanOneInstanceContributingToLatency: IAlarm,
    nameSuffix?: string,
  ): IAlarm {
    return new CompositeAlarm(
      scope,
      operationName + "AZ" + counter + "IsolatedImpactAlarm" + nameSuffix,
      {
        compositeAlarmName:
          availabilityZoneId +
          `-${operationName.toLowerCase()}-isolated-impact-alarm` +
          nameSuffix,
        alarmRule: AlarmRule.anyOf(
          moreThanOneInstanceContributingToFaults === undefined ||
            moreThanOneInstanceContributingToFaults == null
            ? AlarmRule.allOf(
                azIsOutlierForFaultsAlarm,
                availabilityImpactAlarm,
              )
            : AlarmRule.allOf(
                azIsOutlierForFaultsAlarm,
                availabilityImpactAlarm,
                moreThanOneInstanceContributingToFaults,
              ),
          moreThanOneInstanceContributingToLatency === undefined ||
            moreThanOneInstanceContributingToLatency == null
            ? AlarmRule.allOf(azIsOutlierForLatencyAlarm, latencyImpactAlarm)
            : AlarmRule.allOf(
                azIsOutlierForLatencyAlarm,
                latencyImpactAlarm,
                moreThanOneInstanceContributingToLatency,
              ),
        ),
        actionsEnabled: false,
      },
    );
  }

  /**
   * Creates an alarm that fires if either the canary or the
   * server side detect single AZ isolated impact
   * @param scope
   * @param operation
   * @param availabilityZoneId
   * @param counter
   * @param serverSideAlarm
   * @param canaryAlarm
   * @returns
   */
  static createAggregateIsolatedAZImpactAlarm(
    scope: Construct,
    operation: IOperation,
    availabilityZoneId: string,
    counter: number,
    serverSideAlarm: IAlarm,
    canaryAlarm: IAlarm,
  ): IAlarm {
    return new CompositeAlarm(
      scope,
      operation.operationName + "AZ" + counter + "AggregateIsolatedImpactAlarm",
      {
        compositeAlarmName:
          availabilityZoneId +
          `-${operation.operationName.toLowerCase()}-aggregate-isolated-impact-alarm`,
        alarmRule: AlarmRule.anyOf(serverSideAlarm, canaryAlarm),
        actionsEnabled: false,
      },
    );
  }

  /**
   * Creates a regional availability alarm for the operation
   * @param scope
   * @param metricDetails
   * @param nameSuffix
   * @param counter
   * @returns
   */
  static createRegionalAvailabilityAlarm(
    scope: Construct,
    metricDetails: IOperationMetricDetails,
    nameSuffix: string,
  ): IAlarm {
    return new Alarm(
      scope,
      metricDetails.operationName + "RegionalAvailabilityAlarm",
      {
        alarmName:
          Fn.ref("AWS::Region") +
          "-" +
          metricDetails.operationName.toLowerCase() +
          "-success-rate" +
          nameSuffix,
        evaluationPeriods: metricDetails.evaluationPeriods,
        datapointsToAlarm: metricDetails.datapointsToAlarm,
        comparisonOperator: ComparisonOperator.LESS_THAN_THRESHOLD,
        threshold: metricDetails.successAlarmThreshold,
        actionsEnabled: false,
        treatMissingData: TreatMissingData.IGNORE,
        metric: RegionalAvailabilityMetrics.createRegionalAvailabilityMetric({
          label: Fn.ref("AWS::Region") + " availability",
          metricDetails: metricDetails,
          metricType: AvailabilityMetricType.SUCCESS_RATE,
        }),
      },
    );
  }

  /**
   * Creates a regional latency alarm for the operation
   * @param scope
   * @param metricDetails
   * @param nameSuffix
   * @param counter
   * @returns
   */
  static createRegionalLatencyAlarm(
    scope: Construct,
    metricDetails: IOperationMetricDetails,
    nameSuffix: string,
  ): IAlarm {
    return new Alarm(
      scope,
      metricDetails.operationName + "RegionalLatencyAlarm",
      {
        alarmName:
          Fn.ref("AWS::Region") +
          "-" +
          metricDetails.operationName.toLowerCase() +
          "-success-latency" +
          nameSuffix,
        evaluationPeriods: metricDetails.evaluationPeriods,
        datapointsToAlarm: metricDetails.datapointsToAlarm,
        comparisonOperator: ComparisonOperator.GREATER_THAN_THRESHOLD,
        threshold: metricDetails.successAlarmThreshold,
        actionsEnabled: false,
        treatMissingData: TreatMissingData.IGNORE,
        metric: RegionalLatencyMetrics.createRegionalAverageLatencyMetric({
          label:
            Fn.ref("AWS::Region") +
            " " +
            metricDetails.alarmStatistic +
            " latency",
          metricDetails: metricDetails,
          metricType: LatencyMetricType.SUCCESS_LATENCY,
          statistic: metricDetails.alarmStatistic,
        }),
      },
    );
  }

  /**
   * A composite alarm combining latency and availability alarms for this operation in the region
   * as measured from either the server side or canary
   * @param scope
   * @param operation
   * @param nameSuffix
   * @param regionalAvailabilityAlarm
   * @param regionalLatencyAlarm
   * @returns
   */
  static createRegionalCustomerExperienceAlarm(
    scope: Construct,
    operationName: string,
    nameSuffix: string,
    regionalAvailabilityAlarm: IAlarm,
    regionalLatencyAlarm: IAlarm,
  ): IAlarm {
    return new CompositeAlarm(
      scope,
      operationName + "RegionalCustomerExperienceAlarm",
      {
        compositeAlarmName:
          Fn.ref("AWS::Region") +
          "-" +
          operationName.toLowerCase() +
          "-customer-experience-imact" +
          nameSuffix,
        alarmRule: AlarmRule.anyOf(
          regionalAvailabilityAlarm,
          regionalLatencyAlarm,
        ),
      },
    );
  }

  static createRegionalInstanceContributorsToHighLatency(
    scope: Construct,
    metricDetails: IOperationMetricDetails,
    ruleDetails: IContributorInsightRuleDetails,
  ): CfnInsightRule {
    let ruleBody = new InsightRuleBody();
    ruleBody.logGroupNames = ruleDetails.logGroups.map((x) => x.logGroupName);
    ruleBody.aggregateOn = "Count";
    ruleBody.logFormat = "JSON";
    ruleBody.contribution = {
      keys: [ruleDetails.instanceIdJsonPath],
      filters: [
        {
          Match: ruleDetails.successLatencyMetricJsonPath,
          GreaterThan: metricDetails.successAlarmThreshold,
        },
        {
          Match: ruleDetails.operationNameJsonPath,
          In: [metricDetails.operationName],
        },
      ],
    } as unknown as IContributionDefinition;

    return new CfnInsightRule(scope, "RegionPerInstanceHighLatencyRule", {
      ruleName:
        Fn.ref("AWS::Region") +
        `-${metricDetails.operationName.toLowerCase()}-per-instance-high-latency-server`,
      ruleState: "ENABLED",
      ruleBody: ruleBody.toJson(),
    });
  }

  static createRegionalInstanceContributorsToFaults(
    scope: Construct,
    metricDetails: IOperationMetricDetails,
    ruleDetails: IContributorInsightRuleDetails,
  ): CfnInsightRule {
    let ruleBody = new InsightRuleBody();
    ruleBody.logGroupNames = ruleDetails.logGroups.map((x) => x.logGroupName);
    ruleBody.aggregateOn = "Count";
    ruleBody.logFormat = "JSON";
    ruleBody.contribution = {
      keys: [ruleDetails.instanceIdJsonPath],
      filters: [
        {
          Match: ruleDetails.faultMetricJsonPath,
          GreaterThan: 0,
        },
        {
          Match: ruleDetails.operationNameJsonPath,
          In: [metricDetails.operationName],
        },
      ],
    } as unknown as IContributionDefinition;

    return new CfnInsightRule(scope, "RegionPerInstanceErrorRule", {
      ruleName:
        Fn.ref("AWS::Region") +
        `-${metricDetails.operationName.toLowerCase()}-per-instance-faults-server`,
      ruleState: "ENABLED",
      ruleBody: ruleBody.toJson(),
    });
  }
}
