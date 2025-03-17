/**
 * The options for calculating if an ALB is an outlier for availability
 */
export enum ApplicationLoadBalancerAvailabilityOutlierAlgorithm {
    /**
     * This will take the availability threshold and calculate if one AZ is responsible
     * for that percentage of errors.
     */
    STATIC = "STATIC"
}