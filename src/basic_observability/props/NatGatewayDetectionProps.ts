import { CfnNatGateway } from "aws-cdk-lib/aws-ec2";
import { PacketLossOutlierAlgorithm } from "../../outlier-detection/PacketLossOutlierAlgorithm";

/**
 * The properties for performing zonal impact detection with NAT Gateway(s).
 */
export interface NatGatewayDetectionProps {

    /**
     * A list of NAT Gateways per Availability Zone (using the AZ name as the key)
     */
    readonly natGateways: {[key: string]: CfnNatGateway[]};

    /**
     * The percentage of packet loss at which you consider there to be impact.
     * 
     * @default 0.01 (as in 0.01%)
     */
    readonly packetLossPercentThreshold?: number;

    /**
     * The algorithm to use to calculate an AZ as an outlier for packet loss.
     * 
     * @default PacketLossOutlierAlgorithm.STATIC
     */
    readonly packetLossOutlierAlgorithm?: PacketLossOutlierAlgorithm;

    /**
     * The threshold used with the outlier calculation.
     * 
     * @default "This depends on the outlier algorithm. STATIC: 66. Z-SCORE: 3."
     */
    readonly packetLossOutlierThreshold?: number;
}