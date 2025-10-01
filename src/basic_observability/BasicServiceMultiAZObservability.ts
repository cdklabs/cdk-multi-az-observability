// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Duration } from 'aws-cdk-lib';
import {
  AlarmRule,
  CompositeAlarm,
  Dashboard,
  IAlarm
} from 'aws-cdk-lib/aws-cloudwatch';
import { CfnNatGateway } from 'aws-cdk-lib/aws-ec2';
import {
  BaseLoadBalancer,
  IApplicationLoadBalancer,
  ILoadBalancerV2,
} from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import { Construct } from 'constructs';
import { IBasicServiceMultiAZObservability } from './IBasicServiceMultiAZObservability';
import { BasicServiceMultiAZObservabilityProps } from './props/BasicServiceMultiAZObservabilityProps';
import { AvailabilityZoneMapper } from '../azmapper/AvailabilityZoneMapper';
import { IAvailabilityZoneMapper } from '../azmapper/IAvailabilityZoneMapper';
import { BasicServiceDashboard } from './BasicServiceDashboard';
import { ApplicationLoadBalancerMetrics } from '../metrics/ApplicationLoadBalancerMetrics';
import { MetricsHelper } from '../utilities/MetricsHelper';
import { ApplicationLoadBalancerLatencyOutlierAlgorithm } from '../outlier-detection/ApplicationLoadBalancerLatencyOutlierAlgorithm';
import { NatGatewayMetrics } from '../metrics/NatGatewayMetrics';
import { ApplicationLoadBalancerAvailabilityOutlierAlgorithm } from '../outlier-detection/ApplicationLoadBalancerAvailabilityOutlierAlgorithm';
import { PacketLossOutlierAlgorithm } from '../outlier-detection/PacketLossOutlierAlgorithm';

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

    if (!(props.applicationLoadBalancerProps) && !(props.natGatewayProps)) {
      throw new Error("You must define either ALBs or NAT Gateways for this service in order to create a dashboard.");
    }

    // Initialize class properties
    this.serviceName = props.serviceName;
    this.applicationLoadBalancers = props.applicationLoadBalancerProps?.albTargetGroupMap.map(entry => entry.applicationLoadBalancer);
    this.natGateways = props.natGatewayProps?.natGateways;

    this.aggregateZonalIsolatedImpactAlarms = {};
    this.albZonalIsolatedImpactAlarms = {};
    this.natGWZonalIsolatedImpactAlarms = {};

    // Create the AZ mapper resource to translate AZ names to ids
    this._azMapper = new AvailabilityZoneMapper(this, 'availability-zone-mapper');

    // Create ALB metrics and alarms per AZ
    if (this.applicationLoadBalancers) {
      this.albZonalIsolatedImpactAlarms = this.createAlbZonalImpactAlarms(props);
    }

    // Create NAT Gateway metrics and alarms per AZ
    if (this.natGateways) {
      this.natGWZonalIsolatedImpactAlarms = this.createNatGatewayZonalImpactAlarms(props);
    }

    // Look through all of the per AZ ALB alarms, if there's also a NAT GW alarm
    // create a composite alarm if either of them trigger
    Object.keys(this.albZonalIsolatedImpactAlarms).forEach((azLetter: string) => {
      let availabilityZoneId = this._azMapper.availabilityZoneIdFromAvailabilityZoneLetter(azLetter);
      if (azLetter in this.natGWZonalIsolatedImpactAlarms!) {
        this.aggregateZonalIsolatedImpactAlarms[azLetter] = new CompositeAlarm(this, azLetter + "-isolated-impact-alarm", {
          alarmRule: AlarmRule.anyOf(this.albZonalIsolatedImpactAlarms![azLetter], this.natGWZonalIsolatedImpactAlarms![azLetter]),
          compositeAlarmName: availabilityZoneId + "-isolated-impact-alarm"
        });
      }
      else {
        this.aggregateZonalIsolatedImpactAlarms[azLetter] = new CompositeAlarm(this, azLetter + "-isolated-impact-alarm", {
          alarmRule: AlarmRule.anyOf(this.albZonalIsolatedImpactAlarms![azLetter]),
          compositeAlarmName: availabilityZoneId + "-isolated-impact-alarm"
        });
      }
    });

    // Look through all of the per AZ NAT GW alarms. If there's an AZ we haven't seen in the ALB
    // alarms yet, then it will just be a NAT GW alarm that we'll turn into the same kind of
    // composite alarm
    Object.keys(this.natGWZonalIsolatedImpactAlarms).forEach((azLetter: string) => {
      if (!(azLetter in this.aggregateZonalIsolatedImpactAlarms)) {
        let availabilityZoneId = this._azMapper.availabilityZoneIdFromAvailabilityZoneLetter(azLetter);

        this.aggregateZonalIsolatedImpactAlarms[azLetter] = new CompositeAlarm(this, azLetter + "-isolated-impact-alarm", {
          alarmRule: AlarmRule.anyOf(this.natGWZonalIsolatedImpactAlarms![azLetter]),
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
          interval: props.interval,
          natgws: props.natGatewayProps,
          albs: props.applicationLoadBalancerProps,
          period: props.period ? props.period : Duration.minutes(1),
          azMapper: this._azMapper
        },
      ).dashboard;
    }
  }

  /**
   * 
   * @param props 
   * @returns A composite alarm per AZ to indicate isolated zonal impact. The dictionary
   * is keyed by the az letter, like "a", "b", "c".
   */
  private createAlbZonalImpactAlarms(
    props: BasicServiceMultiAZObservabilityProps
  ) : { [key: string]: IAlarm } {

    // Create impact alarms per AZ, with each ALB providing
    // an alarm for its AZs
    let perAZImpactAlarms: { [key: string]: IAlarm[] } = {};

    let keyPrefix: string = MetricsHelper.nextChar();

    let availabilityOutlierDetectionAlgorithm: ApplicationLoadBalancerAvailabilityOutlierAlgorithm = 
      props.applicationLoadBalancerProps?.availabilityOutlierAlgorithm ?
      props.applicationLoadBalancerProps.availabilityOutlierAlgorithm :
      ApplicationLoadBalancerAvailabilityOutlierAlgorithm.STATIC;

    let latencyOutlierDetectionAlgorithm: ApplicationLoadBalancerLatencyOutlierAlgorithm =
      props.applicationLoadBalancerProps?.latencyOutlierAlgorithm ? 
      props.applicationLoadBalancerProps.latencyOutlierAlgorithm :
      ApplicationLoadBalancerLatencyOutlierAlgorithm.Z_SCORE;

    let availabilityOutlierThreshold: number;
    if (props.applicationLoadBalancerProps?.availabilityOutlierThreshold) {
      availabilityOutlierThreshold = props.applicationLoadBalancerProps.availabilityOutlierThreshold;
    }
    else {
      switch (availabilityOutlierDetectionAlgorithm) {
        case ApplicationLoadBalancerAvailabilityOutlierAlgorithm.STATIC:
        default:
          availabilityOutlierThreshold = 66;
          break;
      }
    }

    let latencyOutlierThreshold: number;

    if (props.applicationLoadBalancerProps?.latencyOutlierThreshold) {
      latencyOutlierThreshold = props.applicationLoadBalancerProps.latencyOutlierThreshold;
    }
    else {
      switch (latencyOutlierDetectionAlgorithm) {
        case ApplicationLoadBalancerLatencyOutlierAlgorithm.Z_SCORE:
        default:
          latencyOutlierThreshold = 3;
          break;
        case ApplicationLoadBalancerLatencyOutlierAlgorithm.STATIC:
          latencyOutlierThreshold = 66;
          break;
      }
    }

    let period: Duration = props.period ? props.period : Duration.minutes(1);

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
        let availabilityImpact: IAlarm = ApplicationLoadBalancerMetrics.createAZAvailabilityImpactAlarm(
          this,
          alb,
          availabilityZoneId,
          az,
          props.applicationLoadBalancerProps!.faultCountPercentThreshold,
          keyPrefix,
          period,
          props.evaluationPeriods,
          props.datapointsToAlarm
        );

        // Is there latency impact in this AZ?
        let latencyImpact: IAlarm = ApplicationLoadBalancerMetrics.createAZLatencyImpactAlarm(
          this,
          alb,
          availabilityZoneId,
          az,
          props.applicationLoadBalancerProps!.latencyThreshold,
          props.applicationLoadBalancerProps!.latencyStatistic,
          keyPrefix,
          period,
          props.evaluationPeriods,
          props.datapointsToAlarm
        );

        // Is the AZ an outlier for faults
        let availabilityOutlier = ApplicationLoadBalancerMetrics.createAZAvailabilityOutlierAlarm(
          this,
          alb,
          availabilityOutlierDetectionAlgorithm,
          availabilityZoneId,
          az,
          availabilityOutlierThreshold,
          keyPrefix,
          period,
          props.evaluationPeriods,
          props.datapointsToAlarm
        );

        // Is the AZ an outlier for latency
        let latencyOutlier = ApplicationLoadBalancerMetrics.createAZLatencyOutlierAlarm(
          this,
          alb,
          latencyOutlierDetectionAlgorithm,
          az,
          props.applicationLoadBalancerProps!.latencyStatistic,
          props.applicationLoadBalancerProps!.latencyThreshold,
          latencyOutlierThreshold,
          period,
          props.evaluationPeriods,
          props.datapointsToAlarm,
          this._azMapper
        );

        // Alarm if the AZ shows impact and is an outlier
        let azImpactAlarm: IAlarm = new CompositeAlarm(this, 
          azLetter +  "-composite-impact-alarm", 
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

      azCompositeAlarms[azLetter] = new CompositeAlarm(this, azLetter + "-alb-impact-composite-alarm", {
        alarmRule: AlarmRule.anyOf(...perAZImpactAlarms[az]),
        compositeAlarmName: availabilityZoneId + "-alb-impact-composite-alarm"
      });
    });

    return azCompositeAlarms;
  }

  private createNatGatewayZonalImpactAlarms(
    props: BasicServiceMultiAZObservabilityProps
  ): {[key: string]: IAlarm} {

    // Collect alarms for packet drops exceeding a threshold per NAT GW
    let packetLossPerAZAlarms: { [key: string]: IAlarm } = {};

    let packetLossOutlierAlgorithm: PacketLossOutlierAlgorithm = props.natGatewayProps?.packetLossOutlierAlgorithm ?
      props.natGatewayProps?.packetLossOutlierAlgorithm :
      PacketLossOutlierAlgorithm.STATIC;

    let packetLossThreshold: number = props.natGatewayProps?.packetLossPercentThreshold ? 
      props.natGatewayProps.packetLossPercentThreshold :
      0.01;

    let outlierThreshold: number;

    if (props.natGatewayProps?.packetLossOutlierThreshold) {
      outlierThreshold = props.natGatewayProps.packetLossOutlierThreshold;
    }
    else {
      switch (packetLossOutlierAlgorithm) {
        case PacketLossOutlierAlgorithm.STATIC:
        default:
          outlierThreshold = 66;
          break;
      }
    }
      

    let period: Duration = props.period ? props.period : Duration.minutes(1);

    // For each AZ, create metrics for each NAT GW
    Object.keys(this.natGateways!).forEach((az: string) => {

      let azLetter: string = az.substring(az.length - 1);
      let availabilityZoneId =
        this._azMapper.availabilityZoneIdFromAvailabilityZoneLetter(azLetter);

      // Is there packet loss impact?
      let packetLossImpact: IAlarm = NatGatewayMetrics.isThereAnAZPacketLossImpactNATGW(
        this,
        this.natGateways![az],
        availabilityZoneId,
        az,
        packetLossThreshold,
        period,
        props.evaluationPeriods,
        props.datapointsToAlarm
      );

      // Is this AZ an outlier for this NATGW?
      let packetLossOutlier: IAlarm = NatGatewayMetrics.isAZAnOutlierForPacketLossNATGW(
        this,
        this.natGateways!,
        packetLossOutlierAlgorithm,
        az,
        this._azMapper,
        outlierThreshold,
        props.period ? props.period : Duration.minutes(1),
        props.evaluationPeriods,
        props.datapointsToAlarm
      );

      packetLossPerAZAlarms[azLetter] = new CompositeAlarm(this, az.substring(az.length - 1) + "-packet-loss-composite-alarm", {
        alarmRule: AlarmRule.allOf(packetLossImpact, packetLossOutlier),
        compositeAlarmName: availabilityZoneId + "-packet-loss-composite-alarm"
      });
    });

    return packetLossPerAZAlarms;
  }
}
