/**
 * The options for calculating if a NAT Gateway is an outlier for packet loss
 */
export enum PacketLossOutlierAlgorithm {
    /**
     * This will take the availability threshold and calculate if one AZ is responsible
     * for that percentage of packet loss.
     */
    STATIC = "STATIC"
}