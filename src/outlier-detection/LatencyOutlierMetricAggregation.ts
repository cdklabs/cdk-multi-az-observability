/**
 * The latency metric aggregation to use for latency outlier detection
 */
export enum LatencyOutlierMetricAggregation {
    /**
     * This option will use the count of the number of requests exceeding
     * a latency threshold to make an outlier comparison. This option works
     * with all outlier detection algorithms
     */
    COUNT = "COUNT",

    /**
     * This option will use the value of your provided latency statistic, like
     * p99, and the value of the latency in each AZ will be compared. For example,
     * AZ1: p99 = 125ms
     * AZ2: p99 = 130ms
     * AZ3: p99 = 250ms
     * 
     * These values will be compared using the provided outlier detection algorithm. This
     * option is not compatible with the STATIC outlier detection algorithm.
     */
    VALUE = "VALUE"
}