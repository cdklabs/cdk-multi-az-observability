// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Duration } from 'aws-cdk-lib';
import {
  Alarm,
  AlarmRule,
  ComparisonOperator,
  CompositeAlarm,
  Dashboard,
  IAlarm,
  IMetric,
  MathExpression,
  Metric,
  Stats,
  TreatMissingData,
  Unit,
} from 'aws-cdk-lib/aws-cloudwatch';
import { CfnNatGateway } from 'aws-cdk-lib/aws-ec2';
import {
  BaseLoadBalancer,
  IApplicationLoadBalancer,
  ILoadBalancerV2,
} from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import { Construct, IConstruct } from 'constructs';
import { IBasicServiceMultiAZObservability } from './IBasicServiceMultiAZObservability';
import { BasicServiceMultiAZObservabilityProps } from './props/BasicServiceMultiAZObservabilityProps';
import { AvailabilityZoneMapper } from '../azmapper/AvailabilityZoneMapper';
import { IAvailabilityZoneMapper } from '../azmapper/IAvailabilityZoneMapper';
import { BasicServiceDashboard } from './BasicServiceDashboard';
import { ApplicationLoadBalancerMetrics } from '../metrics/ApplicationLoadBalancerMetrics';
import { AvailabilityMetricType } from '../utilities/AvailabilityMetricType';
import { MetricsHelper } from '../utilities/MetricsHelper';

/**
 * Basic observability for a service using metrics from
 * ALBs and NAT Gateways
 */
export class BasicServiceMultiAZObservability
  extends Construct
  implements IBasicServiceMultiAZObservability {
  /**
   * The NAT Gateways being used in the service, each set of NAT Gateways
   * are keyed by their Availability Zone Id
   */
  natGateways?: { [key: string]: CfnNatGateway[] };

  /**
   * The application load balancers being used by the service
   */
  applicationLoadBalancers?: IApplicationLoadBalancer[];

  /**
   * The name of the service
   */
  serviceName: string;

  /**
   * The alarms indicating if an AZ is an outlier for NAT GW
   * packet loss and has isolated impact
   */
  natGWZonalIsolatedImpactAlarms?: { [key: string]: IAlarm };

  /**
   * The alarms indicating if an AZ is an outlier for ALB
   * faults and has isolated impact
   */
  albZonalIsolatedImpactAlarms?: { [key: string]: IAlarm };

  /**
   * The alarms indicating if an AZ has isolated impact
   * from either ALB or NAT GW metrics
   */
  aggregateZonalIsolatedImpactAlarms: { [key: string]: IAlarm };

  /**
   * The dashboard that is optionally created
   */
  dashboard?: Dashboard;

  /**
   * The AZ mapper resource
   */
  private _azMapper: IAvailabilityZoneMapper;

  constructor(
    scope: Construct,
    id: string,
    props: BasicServiceMultiAZObservabilityProps,
  ) {
    super(scope, id);

    // Initialize class properties
    this.serviceName = props.serviceName;
    this.applicationLoadBalancers = props.applicationLoadBalancers;
    this.natGateways = props.natGateways;

    this.aggregateZonalIsolatedImpactAlarms = {};
    this.albZonalIsolatedImpactAlarms = {};
    this.natGWZonalIsolatedImpactAlarms = {};

    // Create the AZ mapper resource to translate AZ names to ids
    this._azMapper = new AvailabilityZoneMapper(this, 'availability-zone-mapper');

    // Create ALB metrics and alarms per AZ
    if (this.applicationLoadBalancers) {
      this.albZonalIsolatedImpactAlarms = this.doAlbMetrics(props);
    }

    // Create NAT Gateway metrics and alarms per AZ
    if (this.natGateways) {
      this.natGWZonalIsolatedImpactAlarms = this.doNatGatewayMetrics(props);
    }

    // Look through all of the per AZ ALB alarms, if there's also a NAT GW alarm
    // create a composite alarm if either of them trigger
    Object.keys(this.albZonalIsolatedImpactAlarms).forEach((az: string) => {
      let azLetter = az.substring(az.length - 1);
      let availabilityZoneId = this._azMapper.availabilityZoneIdFromAvailabilityZoneLetter(azLetter);
      if (az in this.natGWZonalIsolatedImpactAlarms!) {
        this.aggregateZonalIsolatedImpactAlarms[az] = new CompositeAlarm(this, az.substring(az.length - 1) + "-isolated-impact-alarm", {
          alarmRule: AlarmRule.anyOf(this.albZonalIsolatedImpactAlarms![az], this.natGWZonalIsolatedImpactAlarms![az]),
          compositeAlarmName: availabilityZoneId + "-isolated-impact-alarm"
        });
      }
      else {
        this.aggregateZonalIsolatedImpactAlarms[az] = new CompositeAlarm(this, az.substring(az.length - 1) + "-isolated-impact-alarm", {
          alarmRule: AlarmRule.anyOf(this.albZonalIsolatedImpactAlarms![az]),
          compositeAlarmName: availabilityZoneId + "-isolated-impact-alarm"
        });
      }
    });

    // Look through all of the per AZ NAT GW alarms. If there's an AZ we haven't seen in the ALB
    // alarms yet, then it will just be a NAT GW alarm that we'll turn into the same kind of
    // composite alarm
    Object.keys(this.natGWZonalIsolatedImpactAlarms).forEach((az: string) => {
      if (!(az in this.aggregateZonalIsolatedImpactAlarms)) {
        let azLetter = az.substring(az.length - 1);
        let availabilityZoneId = this._azMapper.availabilityZoneIdFromAvailabilityZoneLetter(azLetter);

        this.aggregateZonalIsolatedImpactAlarms[az] = new CompositeAlarm(this, az.substring(az.length - 1) + "-isolated-impact-alarm", {
          alarmRule: AlarmRule.anyOf(this.natGWZonalIsolatedImpactAlarms![az]),
          compositeAlarmName: availabilityZoneId + "-isolated-impact-alarm"
        });
      }
    });
    
    // Should we create the dashboard
    if (props.createDashboard == true) {
      this.dashboard = new BasicServiceDashboard(
        this,
        'BasicServiceDashboard',
        {
          serviceName: props.serviceName.toLowerCase(),
          zonalAggregateIsolatedImpactAlarms:
            this.aggregateZonalIsolatedImpactAlarms,
          zonalLoadBalancerIsolatedImpactAlarms:
            this.albZonalIsolatedImpactAlarms,
          zonalNatGatewayIsolatedImpactAlarms:
            this.natGWZonalIsolatedImpactAlarms,
          interval: props.interval,
          zonalLoadBalancerFaultRateMetrics: ApplicationLoadBalancerMetrics.getTotalAlbFaultCountPerZone(
            props.applicationLoadBalancers ? props.applicationLoadBalancers : [], 
            props.period ? props.period : Duration.minutes(1),
            this._azMapper
          ),
          zonalNatGatewayPacketDropMetrics: this.getTotalPacketDropsPerZone(
            props.natGateways ? props.natGateways : {},
            props.period ? props.period : Duration.minutes(1)
          ),
          azMapper: this._azMapper,
        },
      ).dashboard;
    }
  }

  private static isThereAnAZAvailabilityImpactAlb(
    scope: IConstruct,
    alb: IApplicationLoadBalancer, 
    availabilityZoneId: string,
    availabilityZone: string,
    threshold: number,
    keyprefix: string,
    period: Duration,
    evaluationPeriods: number,
    datapointsToAlarm: number
  ) : IAlarm {
   
    // Create a fault rate alarm for the ALB in the specified AZ
    return new Alarm(
      scope,
      keyprefix + '-fault-rate-alarm',
      {
        alarmName:
          availabilityZoneId + '-' + alb.loadBalancerArn + '-fault-rate',
        actionsEnabled: false,
        metric: ApplicationLoadBalancerMetrics.getPerAZAvailabilityMetric(alb, {
          period: period,
          label: availabilityZoneId + '-' + alb.loadBalancerArn + '-fault-rate',
          availabilityZone: availabilityZone,
          availabilityZoneId: availabilityZoneId,
          metricType: AvailabilityMetricType.FAULT_RATE
        }),
        evaluationPeriods: evaluationPeriods,
        datapointsToAlarm: datapointsToAlarm,
        threshold: threshold,
        comparisonOperator: ComparisonOperator.GREATER_THAN_THRESHOLD,
        treatMissingData: TreatMissingData.IGNORE
      }
    );
  }

  private static isThereAZLatencyImpactAlb(
    scope: IConstruct,
    alb: IApplicationLoadBalancer, 
    availabilityZoneId: string,
    availabilityZone: string,
    threshold: number,
    statistic: string,
    keyprefix: string,
    period: Duration,
    evaluationPeriods: number,
    datapointsToAlarm: number
  ): IAlarm {
    
    // Create a fault rate alarm for the ALB in the specified AZ
    return new Alarm(
      scope,
      keyprefix + '-latency-alarm',
      {
        alarmName:
          availabilityZoneId + '-' + alb.loadBalancerArn + '-latency',
        actionsEnabled: false,
        metric: ApplicationLoadBalancerMetrics.getPerAZLatencyMetric({
          alb: alb,
          availabilityZone: availabilityZone,
          availabilityZoneId: availabilityZoneId,
          label: availabilityZoneId + "-" + alb.loadBalancerArn + "-target-latency",
          period: period,
          statistic: statistic
        }),
        evaluationPeriods: evaluationPeriods,
        datapointsToAlarm: datapointsToAlarm,
        threshold: threshold,
        comparisonOperator: ComparisonOperator.GREATER_THAN_THRESHOLD,
        treatMissingData: TreatMissingData.IGNORE
      }
    );
  }

  private static isAZAnOutlierForAvailabilityAlb(
    scope: IConstruct,
    alb: IApplicationLoadBalancer, 
    availabilityZoneId: string,
    availabilityZone: string,
    threshold: number,
    keyprefix: string,
    period: Duration,
    evaluationPeriods: number,
    datapointsToAlarm: number
  ) : IAlarm {

    let usingMetrics: { [key: string]: IMetric } = {};
    let azMetricId: string = "";

    alb.vpc!.availabilityZones.forEach((az: string) => {

      let azFaultCount = ApplicationLoadBalancerMetrics.getPerAZAvailabilityMetric(
        alb,
        {
          metricType: AvailabilityMetricType.FAULT_COUNT,
          availabilityZone: availabilityZone,
          availabilityZoneId: availabilityZoneId,
          period: period,
          label: availabilityZoneId + "-" + alb.loadBalancerArn + "-fault-count",
          keyprefix: keyprefix
        }
      );

      keyprefix = MetricsHelper.nextChar(keyprefix);

      usingMetrics[`${keyprefix}1`] = azFaultCount;

      if (az == availabilityZone) {
        azMetricId = `${keyprefix}1`;
      }

      keyprefix = MetricsHelper.nextChar(keyprefix);
    });

    return new Alarm(
      scope,
      keyprefix + '-availability-outlier-alarm',
      {
        alarmName:
          availabilityZoneId + '-' + alb.loadBalancerArn + '-availability-impact-outlier',
        actionsEnabled: false,
        metric: new MathExpression({
          expression: `${azMetricId!}/(${Object.keys(usingMetrics).join("+")})`,
          usingMetrics: usingMetrics,
          label: availabilityZoneId + '-' + alb.loadBalancerArn + '-percent-of-faults',
          period: period,
        }),
        evaluationPeriods: evaluationPeriods,
        datapointsToAlarm: datapointsToAlarm,
        threshold: threshold,
        comparisonOperator: ComparisonOperator.GREATER_THAN_THRESHOLD,
        treatMissingData: TreatMissingData.IGNORE
      }
    );
  }

  private static isAZAnOutlierForLatencyAlb(
    scope: IConstruct,
    alb: IApplicationLoadBalancer, 
    availabilityZoneId: string,
    availabilityZone: string,
    statistic: string,
    period: Duration,
    evaluationPeriods: number,
    datapointsToAlarm: number,
    keyprefix: string
  ) : IAlarm {

    let usingMetrics: { [key: string]: IMetric } = {};
    let azMetricId: string = "";

    alb.vpc!.availabilityZones.forEach((az: string, index: number) => {

      // Target response time
      let targetResponseTime: IMetric = ApplicationLoadBalancerMetrics.getPerAZLatencyMetric({
        alb: alb,
        availabilityZone: az,
        label: az + "-target-response-time",
        statistic: statistic,
        period: period
      });

      if (az == availabilityZone) {       
        azMetricId = `a${index}`
        usingMetrics[`a${index}`] = targetResponseTime;
      }
      else {
        usingMetrics[`b${index}`] = targetResponseTime;
      }
    });

    return new Alarm(
      scope,
      keyprefix + "-latency-outlier-alarm",
      {
        alarmName:
          availabilityZoneId + '-' + alb.loadBalancerArn + '-latency-impact-outlier',
        actionsEnabled: false,
        metric: new MathExpression({
          expression: `(${azMetricId!} - AVG(METRICS("b"))) / AVG(STDDEV(METRICS("b")))`,
          usingMetrics: usingMetrics,
          label: availabilityZoneId + '-' + alb.loadBalancerArn + '-latency-z-score',
          period: period,
        }),
        evaluationPeriods: evaluationPeriods,
        datapointsToAlarm: datapointsToAlarm,
        threshold: 3,
        comparisonOperator: ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
        treatMissingData: TreatMissingData.IGNORE
      }
    );
  }

  private doAlbMetrics(
    props: BasicServiceMultiAZObservabilityProps
  ) : { [key: string]: IAlarm } {

    // Create impact alarms per AZ, with each ALB providing
    // an alarm for its AZs
    let perAZImpactAlarms: { [key: string]: IAlarm[] } = {};

    let keyPrefix: string = MetricsHelper.nextChar();

    // Iterate each ALB
    this.applicationLoadBalancers!.forEach((alb) => {
      
      // Iterate each AZ in the VPC
      alb.vpc?.availabilityZones.forEach((az) => {

        if (!(az in perAZImpactAlarms)) {
          perAZImpactAlarms[az] = [];
        }
     
        // Get AZ letter
        let azLetter = az.substring(az.length - 1);

        // Map letter to AZ ID
        let availabilityZoneId: string =
          this._azMapper.availabilityZoneIdFromAvailabilityZoneLetter(azLetter);

        // Is there availability impact in this AZ?
        let availabilityImpact: IAlarm = BasicServiceMultiAZObservability.isThereAnAZAvailabilityImpactAlb(
          this,
          alb,
          availabilityZoneId,
          az,
          props.faultCountPercentageThreshold ? props.faultCountPercentageThreshold : 0.05,
          keyPrefix,
          props.period ? props.period : Duration.minutes(1),
          props.evaluationPeriods,
          props.datapointsToAlarm
        );

        // Is there latency impact in this AZ?
        let latencyImpact: IAlarm = BasicServiceMultiAZObservability.isThereAZLatencyImpactAlb(
          this,
          alb,
          availabilityZoneId,
          az,
          props.latencyThreshold,
          props.latencyStatistic,
          keyPrefix,
          props.period ? props.period : Duration.minutes(1),
          props.evaluationPeriods,
          props.datapointsToAlarm
        );

        // Is the AZ an outlier for faults
        let availabilityOutlier = BasicServiceMultiAZObservability.isAZAnOutlierForAvailabilityAlb(
          this,
          alb,
          availabilityZoneId,
          az,
          props.faultCountPercentageThreshold ? props.faultCountPercentageThreshold : 0.05,
          keyPrefix,
          props.period ? props.period : Duration.minutes(1),
          props.evaluationPeriods,
          props.datapointsToAlarm
        );

        // Is the AZ an outlier for latency
        let latencyOutlier = BasicServiceMultiAZObservability.isAZAnOutlierForLatencyAlb(
          this,
          alb,
          availabilityZoneId,
          az,
          props.latencyStatistic,
          props.period ? props.period : Duration.minutes(1),
          props.evaluationPeriods,
          props.datapointsToAlarm,
          azLetter
        );

        // Alarm if the AZ shows impact and is an outlier
        let azImpactAlarm: IAlarm = new CompositeAlarm(this, 
          az.substring(az.length - 1) +  "-composite-impact-alarm", 
          {
            alarmRule: AlarmRule.anyOf(
              AlarmRule.allOf(availabilityImpact, availabilityOutlier), 
              AlarmRule.allOf(latencyImpact, latencyOutlier)
            ),
            compositeAlarmName: 
              availabilityZoneId + "-" + 
              (alb as ILoadBalancerV2 as BaseLoadBalancer).loadBalancerName + 
              "-latency-or-availability-impact",
            actionsEnabled: false
          }
        );

        // Add this ALB's fault rate alarm
        perAZImpactAlarms[az].push(azImpactAlarm);

        // Get next unique key
        keyPrefix = MetricsHelper.nextChar(keyPrefix);
      });
    });

    let azCompositeAlarms: {[key: string]: IAlarm} = {};

    // Iterate AZs for the ALB impact alarms so we can join them
    // into a single composite alarm for each AZ
    Object.keys(perAZImpactAlarms).forEach((az) => {
      let azLetter = az.substring(az.length - 1);
      let availabilityZoneId: string = this._azMapper.availabilityZoneIdFromAvailabilityZoneLetter(azLetter);

      azCompositeAlarms[az] = new CompositeAlarm(this, azLetter + "-alb-impact-composite-alarm", {
        alarmRule: AlarmRule.anyOf(...perAZImpactAlarms[az]),
        compositeAlarmName: availabilityZoneId + "-alb-impact-composite-alarm"
      });
    });

    return azCompositeAlarms;
  }

  private static isThereAnAZPacketLossImpactNATGW(
    scope: IConstruct,
    natgws: CfnNatGateway[], 
    availabilityZoneId: string,
    availabilityZone: string,
    threshold: number,
    period: Duration,
    evaluationPeriods: number,
    datapointsToAlarm: number
  ) : IAlarm {
    
    let keyprefix = MetricsHelper.nextChar();

    let packetDropCountMetrics: {[key: string]: IMetric} = {};
    let packetsInFromSourceMetrics: {[key: string]: IMetric} = {};
    let packetsInFromDestinationMetrics: {[key: string]: IMetric} = {};
   
    natgws.forEach((natgw: CfnNatGateway)=> {

      packetDropCountMetrics[`${keyprefix}1`] = new Metric({
        metricName: 'PacketsDropCount',
        namespace: 'AWS/NATGateway',
        statistic: Stats.SUM,
        unit: Unit.COUNT,
        label: availabilityZoneId + ' packet drops',
        dimensionsMap: {
          NatGatewayId: natgw.attrNatGatewayId,
        },
        period: period,
      });
  
      // Calculate packets in from source
      packetsInFromSourceMetrics[`${keyprefix}2`] = new Metric({
        metricName: 'PacketsInFromSource',
        namespace: 'AWS/NATGateway',
        statistic: Stats.SUM,
        unit: Unit.COUNT,
        label: availabilityZoneId + ' packets in from source',
        dimensionsMap: {
          NatGatewayId: natgw.attrNatGatewayId,
        },
        period: period,
      });
  
      // Calculate packets in from destination
      packetsInFromDestinationMetrics[`${keyprefix}3`] = new Metric({
        metricName: 'PacketsInFromDestination',
        namespace: 'AWS/NATGateway',
        statistic: Stats.SUM,
        unit: Unit.COUNT,
        label: availabilityZoneId + ' packets in from destination',
        dimensionsMap: {
          NatGatewayId: natgw.attrNatGatewayId,
        },
        period: period,
      });

      keyprefix = MetricsHelper.nextChar(keyprefix);
    });

    let packetDropTotal: IMetric = new MathExpression({
      expression: Object.keys(packetDropCountMetrics).join("+"),
      usingMetrics: packetDropCountMetrics,
      period: period
    });

    let packetsInFromSourceTotal: IMetric = new MathExpression({
      expression: Object.keys(packetsInFromSourceMetrics).join("+"),
      usingMetrics: packetsInFromSourceMetrics,
      period: period
    });

    let packetsInFromDestinationTotal: IMetric = new MathExpression({
      expression: Object.keys(packetsInFromDestinationMetrics).join("+"),
      usingMetrics: packetsInFromDestinationMetrics,
      period: period
    });
    
    let usingMetrics: { [key: string]: IMetric } = {};
    usingMetrics[`${keyprefix}1`] = packetDropTotal;
    usingMetrics[`${keyprefix}2`] = packetsInFromSourceTotal;
    usingMetrics[`${keyprefix}3`] = packetsInFromDestinationTotal;

    // Calculate a percentage of dropped packets for the NAT GW
    let packetDropPercentage: IMetric = new MathExpression({
      expression: `(${keyprefix}1 / (${keyprefix}2 + ${keyprefix}3))`,
      usingMetrics: usingMetrics,
      label: availabilityZoneId + ' packet drop percentage',
      period: period,
    });

    // Create an alarm for this NAT GW if packet drops exceed the specified threshold
    return new Alarm(
      scope,
      availabilityZone.substring(availabilityZone.length - 1) + "-packet-drop-impact-alarm",
      {
        alarmName:
          availabilityZoneId +
          '-packet-drop-impact',
        actionsEnabled: false,
        metric: packetDropPercentage,
        threshold: threshold,
        comparisonOperator: ComparisonOperator.GREATER_THAN_THRESHOLD,
        evaluationPeriods: evaluationPeriods,
        datapointsToAlarm: datapointsToAlarm,
        treatMissingData: TreatMissingData.IGNORE
      }
    );
  }

  private static isAZAnOutlierForPacketLossNATGW(
    scope: IConstruct,
    natgws: {[key: string]: CfnNatGateway[]}, 
    availabilityZoneId: string,
    availabilityZone: string,
    threshold: number,
    period: Duration,
    evaluationPeriods: number,
    datapointsToAlarm: number
  ) : IAlarm {

    let keyprefix = MetricsHelper.nextChar();
    let azPacketDropCountMetrics: {[key: string]: IMetric} = {};
    let azKey: string = "";

    Object.keys(natgws).forEach((az: string) => {
      
      let packetDropCountMetrics: {[key: string]: IMetric} = {};

      

      natgws[az].forEach((natgw: CfnNatGateway, index: number) => {
        packetDropCountMetrics[`${keyprefix}${index}`] = new Metric({
          metricName: 'PacketsDropCount',
          namespace: 'AWS/NATGateway',
          statistic: Stats.SUM,
          unit: Unit.COUNT,
          label: availabilityZoneId + ' packet drops',
          dimensionsMap: {
            NatGatewayId: natgw.attrNatGatewayId,
          },
          period: period,
        });
        keyprefix = MetricsHelper.nextChar(keyprefix);
      });

      azPacketDropCountMetrics[`${keyprefix}${natgws[az].length}`] = new MathExpression({
        expression: Object.keys(packetDropCountMetrics).join("+"),
        usingMetrics: packetDropCountMetrics,
        period: period
      });

      if (az == availabilityZone) {
        azKey = `${keyprefix}${natgws[az].length}`;
      }

      keyprefix = MetricsHelper.nextChar(keyprefix);
    });

    return new Alarm(
      scope, 
      availabilityZone.substring(availabilityZone.length - 1) + "-packet-loss-outlier", 
      {
         metric: new MathExpression({
            expression: `${azKey} / (${Object.keys(azPacketDropCountMetrics).join("+")})`,
            usingMetrics: azPacketDropCountMetrics,
            period: period
         }),
         threshold: threshold,
         evaluationPeriods: evaluationPeriods,
         datapointsToAlarm: datapointsToAlarm,
         comparisonOperator: ComparisonOperator.GREATER_THAN_THRESHOLD,
         treatMissingData: TreatMissingData.IGNORE
      }
    );
  }

  private doNatGatewayMetrics(
    props: BasicServiceMultiAZObservabilityProps
  ): {[key: string]: IAlarm} {

    // Collect alarms for packet drops exceeding a threshold per NAT GW
    let packetLossPerAZAlarms: { [key: string]: IAlarm } = {};

    // For each AZ, create metrics for each NAT GW
    Object.keys(this.natGateways!).forEach((az: string) => {

      let azLetter: string = az.substring(az.length - 1);
      let availabilityZoneId =
        this._azMapper.availabilityZoneIdFromAvailabilityZoneLetter(azLetter);

      // Is there packet loss impact?
      let packetLossImpact: IAlarm = BasicServiceMultiAZObservability.isThereAnAZPacketLossImpactNATGW(
        this,
        this.natGateways![az],
        availabilityZoneId,
        az,
        props.packetLossImpactPercentageThreshold ? props.packetLossImpactPercentageThreshold : 0.01,
        props.period ? props.period : Duration.minutes(1),
        props.evaluationPeriods,
        props.datapointsToAlarm
      );
      // Is this AZ an outlier for this NATGW?
      let packetLossOutlier: IAlarm = BasicServiceMultiAZObservability.isAZAnOutlierForPacketLossNATGW(
        this,
        this.natGateways!,
        availabilityZoneId,
        az,
        0.66,
        props.period ? props.period : Duration.minutes(1),
        props.evaluationPeriods,
        props.datapointsToAlarm
      );
      packetLossPerAZAlarms[az] = new CompositeAlarm(this, az.substring(az.length - 1) + "-packet-loss-composite-alarm", {
        alarmRule: AlarmRule.allOf(packetLossImpact, packetLossOutlier),
        compositeAlarmName: availabilityZoneId + "-packet-loss-composite-alarm"
      });
    });

    return packetLossPerAZAlarms;
  }

  private getTotalPacketDropsPerZone(
    natgws: {[key: string]: CfnNatGateway[]},
    period: Duration
  ) : {[key: string]: IMetric}
  {
    let dropsPerZone: {[key: string]: IMetric} = {};
    let metricsPerAZ: {[key: string]: IMetric[]} = {};
    let keyprefix: string = MetricsHelper.nextChar();

    Object.keys(natgws).forEach((availabilityZone: string) => {

      let azLetter = availabilityZone.substring(availabilityZone.length - 1);
      let availabilityZoneId = this._azMapper.availabilityZoneIdFromAvailabilityZoneLetter(azLetter);

      if (!(availabilityZone in metricsPerAZ)) {
        metricsPerAZ[availabilityZone] = [];
      }

      natgws[availabilityZone].forEach((natgw: CfnNatGateway) => {

        metricsPerAZ[availabilityZone].push(new Metric({
          metricName: 'PacketsDropCount',
          namespace: 'AWS/NATGateway',
          statistic: Stats.SUM,
          unit: Unit.COUNT,
          label: availabilityZoneId + ' packet drops',
          dimensionsMap: {
            NatGatewayId: natgw.attrNatGatewayId,
          },
          period: period,
        }));
      });   
    });

    Object.keys(metricsPerAZ).forEach((availabilityZone: string) => {
      let azLetter = availabilityZone.substring(availabilityZone.length - 1);
      let availabilityZoneId = this._azMapper.availabilityZoneIdFromAvailabilityZoneLetter(azLetter);

      let usingMetrics: {[key: string]: IMetric} = {};

      metricsPerAZ[availabilityZone].forEach((metric: IMetric) => {
        usingMetrics[`${keyprefix}1`] = metric;
        keyprefix = MetricsHelper.nextChar(keyprefix);
      });

      dropsPerZone[availabilityZone] = new MathExpression({
        expression: Object.keys(usingMetrics).join("+"),
        usingMetrics: usingMetrics,
        label: availabilityZoneId + " total packet drops",
        period: period
      });
    });

    return dropsPerZone;
  }
}
