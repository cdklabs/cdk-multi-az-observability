import { CfnNatGateway } from "aws-cdk-lib/aws-ec2";
import { MetricsHelper } from "../utilities/MetricsHelper";
import { Alarm, ComparisonOperator, IAlarm, IMetric, MathExpression, Metric, Stats, TreatMissingData, Unit } from "aws-cdk-lib/aws-cloudwatch";
import { Duration } from "aws-cdk-lib";
import { IConstruct } from "constructs";
import { IAvailabilityZoneMapper } from "../azmapper/IAvailabilityZoneMapper";
import { PacketLossOutlierAlgorithm } from "../outlier-detection/PacketLossOutlierAlgorithm";

/**
 * Provides functions for getting CloudWatch metrics and alarms for NAT Gateways.
 */
export class NatGatewayMetrics {

    /**
     * Gets the count of packet drops for all NAT Gateways that belong to the provided AZ
     * @param natgws 
     * @param availabilityZoneId 
     * @param period 
     * @returns 
     */
    static getDroppedPacketCountMetricForAZ(
        natgws: CfnNatGateway[],
        availabilityZoneId: string,
        period: Duration,
        prefix?: string
    ) : IMetric 
    {
        let keyprefix: string = prefix ? prefix : MetricsHelper.nextChar();
        let packetDropCountMetrics: {[key: string]: IMetric} = {};

        natgws.forEach((natgw: CfnNatGateway, index: number)=> {
        
            packetDropCountMetrics[`${keyprefix}${index}`] = new Metric({
              metricName: 'PacketsDropCount',
              namespace: 'AWS/NATGateway',
              statistic: Stats.SUM,
              unit: Unit.COUNT,
              label: availabilityZoneId,
              dimensionsMap: {
                NatGatewayId: natgw.attrNatGatewayId,
              },
              period: period,
            });
        });

        return new MathExpression({
          expression: Object.keys(packetDropCountMetrics).join("+"),
          usingMetrics: packetDropCountMetrics,
          period: period,
          label: availabilityZoneId
        });
    }

    /**
     * Get the packet drop rate for all NAT Gateways that belong to the provided AZ
     * @param natgws 
     * @param availabilityZoneId 
     * @param period 
     * @returns Percent of packet drops like 52%
     */
    static getDroppedPacketRateMetricForAZ(
        natgws: CfnNatGateway[],
        availabilityZoneId: string,
        period: Duration,
        prefix?: string
    ) : IMetric 
    {
        
        let keyprefix = prefix ? prefix : MetricsHelper.nextChar();

        let packetDropCountMetrics: {[key: string]: IMetric} = {};
        let packetsInFromSourceMetrics: {[key: string]: IMetric} = {};
        let packetsInFromDestinationMetrics: {[key: string]: IMetric} = {};
        
        natgws.forEach((natgw: CfnNatGateway, index: number)=> {

          packetDropCountMetrics[`${keyprefix}${index}1`] = new Metric({
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
          packetsInFromSourceMetrics[`${keyprefix}${index}2`] = new Metric({
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
          packetsInFromDestinationMetrics[`${keyprefix}${index}3`] = new Metric({
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
        });

        keyprefix = MetricsHelper.nextChar(keyprefix);

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
        return new MathExpression({
          expression: `(${keyprefix}1 / (${keyprefix}2 + ${keyprefix}3)) * 100`,
          usingMetrics: usingMetrics,
          label: availabilityZoneId,
          period: period,
        });
    }

    /**
     * Get the packet count for all NAT Gateways that belong to the provided AZ
     * @param natgws 
     * @param availabilityZoneId 
     * @param period 
     * @returns 
     */
    static getTotalPacketCountMetricForAZ(
        natgws: CfnNatGateway[],
        availabilityZoneId: string,
        period: Duration,
        prefix?: string
    ) : IMetric 
    {
        
        let keyprefix = prefix ? prefix : MetricsHelper.nextChar();
        let usingMetrics: {[key: string]: IMetric} = {};
        
        natgws.forEach((natgw: CfnNatGateway, index: number)=> {
      
          // Calculate packets in from source
          usingMetrics[`${keyprefix}${index}1`] = new Metric({
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
          usingMetrics[`${keyprefix}${index}2`] = new Metric({
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
        });

        // Calculate total packets in from sources and destinations
        return new MathExpression({
          expression: Object.keys(usingMetrics).join("+"),
          usingMetrics: usingMetrics,
          label: availabilityZoneId,
          period: period,
        });
    }

    /**
       * Returns an alarm indicating if the quantity of packet drops in a single AZ across all NAT Gateways in that
       * AZ exceeds a threshold compared to all packet loss across all AZs.
       * 
       * For example:
       * 
       * A = 150 packets
       * B = 175 packets
       * C = 160 packets
       * 
       * And the selected AZ is "A", then the calculation is 150 / (150 + 175 + 160).
       * 
       * @param scope 
       * @param natgws 
       * @param availabilityZoneId 
       * @param availabilityZone 
       * @param threshold 
       * @param period 
       * @param evaluationPeriods 
       * @param datapointsToAlarm 
       * @returns 
       */
    static isAZAnOutlierForPacketLossNATGW(
        scope: IConstruct,
        natgws: {[key: string]: CfnNatGateway[]}, 
        algorithm: PacketLossOutlierAlgorithm,
        availabilityZone: string,
        azMapper: IAvailabilityZoneMapper,
        threshold: number,
        period: Duration,
        evaluationPeriods: number,
        datapointsToAlarm: number
    ) : IAlarm {
        let azPacketDropCountMetrics: {[key: string]: IMetric} = {};
        let availabilityZoneId: string = azMapper.availabilityZoneIdFromAvailabilityZoneLetter(availabilityZone.substring(availabilityZone.length - 1));
        let keyprefix: string = MetricsHelper.nextChar();

        Object.keys(natgws).forEach((az: string) => {
          let azLetter = az.substring(az.length - 1);
          let azId = azMapper.availabilityZoneIdFromAvailabilityZoneLetter(azLetter);
          azPacketDropCountMetrics[azLetter] = NatGatewayMetrics.getDroppedPacketCountMetricForAZ(natgws[az], azId, period, keyprefix);

          keyprefix = MetricsHelper.nextChar(keyprefix);
        });

        switch (algorithm) {
          case PacketLossOutlierAlgorithm.STATIC:
          default:
            return new Alarm(
              scope, 
              availabilityZone.substring(availabilityZone.length - 1) + "-packet-loss-outlier", 
              {
                 metric: new MathExpression({
                    expression: `${availabilityZone.substring(availabilityZone.length - 1)} / (${Object.keys(azPacketDropCountMetrics).join("+")})`,
                    usingMetrics: azPacketDropCountMetrics,
                    period: period,
                    label: availabilityZoneId + "-packet-loss-percentage-of-total"
                 }),
                 threshold: threshold,
                 evaluationPeriods: evaluationPeriods,
                 datapointsToAlarm: datapointsToAlarm,
                 comparisonOperator: ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
                 treatMissingData: TreatMissingData.IGNORE
              }
            );
        }     
    }

    /**
     * Creates an alarm to determine is the packet loss rate in a single AZ across all NAT Gateways provided
     * for that AZ exceed the provided threshold.
     * @param scope 
     * @param natgws 
     * @param availabilityZoneId 
     * @param availabilityZone 
     * @param threshold 
     * @param period 
     * @param evaluationPeriods 
     * @param datapointsToAlarm 
     * @returns 
     */
    static isThereAnAZPacketLossImpactNATGW(
        scope: IConstruct,
        natgws: CfnNatGateway[], 
        availabilityZoneId: string,
        availabilityZone: string,
        threshold: number,
        period: Duration,
        evaluationPeriods: number,
        datapointsToAlarm: number
      ) : IAlarm {
        // Calculate a percentage of dropped packets for the NAT GW
        let packetDropPercentage: IMetric = NatGatewayMetrics.getDroppedPacketRateMetricForAZ(natgws, availabilityZoneId, period);
    
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
            threshold: (threshold * 100),
            comparisonOperator: ComparisonOperator.GREATER_THAN_THRESHOLD,
            evaluationPeriods: evaluationPeriods,
            datapointsToAlarm: datapointsToAlarm,
            treatMissingData: TreatMissingData.IGNORE
          }
        );
    }

    /**
     * Gets the count of all packets from all NAT Gateways in each provided Availability Zone.
     * @param natgws 
     * @param azMapper 
     * @param period 
     * @returns 
     */
    static getTotalPacketCountForEveryAZ(
        natgws: {[key: string]: CfnNatGateway[]},
        azMapper: IAvailabilityZoneMapper,
        period: Duration
    ) : {[key: string]: IMetric}
    {
        let usingMetrics: {[key: string]: IMetric} = {};
        let keyprefix: string = MetricsHelper.nextChar();

        Object.keys(natgws).forEach((availabilityZone: string) => {
            let azLetter: string = availabilityZone.substring(availabilityZone.length - 1);
            let availabilityZoneId = azMapper.availabilityZoneIdFromAvailabilityZoneLetter(azLetter);

            usingMetrics[azLetter] = this.getTotalPacketCountMetricForAZ(natgws[availabilityZone], availabilityZoneId, period, keyprefix);

            keyprefix = MetricsHelper.nextChar(keyprefix);
        });

        return usingMetrics;
    }

    /**
     * Gets the count of packet drops from all NAT Gateways in each provided Availability Zone.
     * @param natgws 
     * @param azMapper 
     * @param period 
     * @returns 
     */
    static getTotalPacketDropsForEveryAZ(
        natgws: {[key: string]: CfnNatGateway[]},
        azMapper: IAvailabilityZoneMapper,
        period: Duration
    ) : {[key: string]: IMetric}
    {
        let usingMetrics: {[key: string]: IMetric} = {};
        let keyprefix: string = MetricsHelper.nextChar();

        Object.keys(natgws).forEach((availabilityZone: string) => {
            let azLetter: string = availabilityZone.substring(availabilityZone.length - 1);
            let availabilityZoneId = azMapper.availabilityZoneIdFromAvailabilityZoneLetter(azLetter);

            usingMetrics[azLetter] = this.getDroppedPacketCountMetricForAZ(natgws[availabilityZone], availabilityZoneId, period, keyprefix);

            keyprefix = MetricsHelper.nextChar(keyprefix);
        });

        return usingMetrics;
    }

    /**
     * Gets the packet drop rate from all NAT Gateways in each provided Availability Zone.
     * @param natgws 
     * @param azMapper 
     * @param period 
     * @returns 
     */
    static getTotalPacketDropRateForEveryAZ(
        natgws: {[key: string]: CfnNatGateway[]},
        azMapper: IAvailabilityZoneMapper,
        period: Duration
    ) : {[key: string]: IMetric}
    {
        let usingMetrics: {[key: string]: IMetric} = {};
        let keyprefix: string = MetricsHelper.nextChar();

        Object.keys(natgws).forEach((availabilityZone: string) => {
            let azLetter: string = availabilityZone.substring(availabilityZone.length - 1);
            let availabilityZoneId = azMapper.availabilityZoneIdFromAvailabilityZoneLetter(azLetter);

            usingMetrics[azLetter] = this.getDroppedPacketRateMetricForAZ(natgws[availabilityZone], availabilityZoneId, period, keyprefix);

            keyprefix = MetricsHelper.nextChar(keyprefix);
        });

        return usingMetrics;
    }
}