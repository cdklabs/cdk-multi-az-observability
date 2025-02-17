import { IMetric, MathExpression, Stats, Unit } from "aws-cdk-lib/aws-cloudwatch";
import { BaseLoadBalancer, HttpCodeElb, HttpCodeTarget, IApplicationLoadBalancer, ILoadBalancerV2 } from "aws-cdk-lib/aws-elasticloadbalancingv2";
import { AvailabilityMetricType } from "../utilities/AvailabilityMetricType";
import { ZonalApplicationLoadBalancerLatencyMetricProps } from "../basic_observability/props/ZonalApplicationLoadBalancerLatencyMetricProps";
import { ZonalApplicationLoadBalancerAvailabilityMetricProps } from "../basic_observability/props/ZonalApplicationLoadBalancerAvailabilityMetricProps";
import { Aws, Duration } from "aws-cdk-lib";
import { RegionalApplicationLoadBalancerAvailabilityMetricProps } from "../basic_observability/props/RegionalApplicationLoadBalancerAvailabilityMetricProps";
import { RegionalApplicationLoadBalancerLatencyMetricProps } from "../basic_observability/props/RegionalApplicationLoadBalancerLatencyMetricProps";
import { AvailabilityZoneMapper } from "../azmapper/AvailabilityZoneMapper";
import { MetricsHelper } from "../utilities/MetricsHelper";

export class ApplicationLoadBalancerMetrics {

    /**
     * Gets the TargetResponseTime latency for the ALB
     * targets
     * @param props The request props
     * @returns The TargetResponseTime metric for the ALB in the specified AZ
     */
    static getPerAZLatencyMetric(
        props: ZonalApplicationLoadBalancerLatencyMetricProps
    ): IMetric {
        return props.alb.metrics.targetResponseTime(
            {
              dimensionsMap: {
                AvailabilityZone: props.availabilityZone,
                LoadBalancer: (props.alb as ILoadBalancerV2 as BaseLoadBalancer)
                  .loadBalancerFullName,
              },
              label: props.availabilityZoneId ? props.availabilityZoneId : props.availabilityZone + "-target-response-time",
              period: props.period,
              statistic: props.statistic,
              unit: Unit.SECONDS
            }
          );
    }

    /**
     * Gets either the successful, fault, or total count metrics
     * for the load balancer targets across all of the provided 
     * ALBs in each AZ.
     * @param albs The ALBs to aggregate the count of
     * @param props The request props
     * @returns The total count of sucess, faults, or total requests in the specified AZ
     */
    static getPerAZAvailabilityMetricCountAggregate(
        albs: IApplicationLoadBalancer[],
        props: ZonalApplicationLoadBalancerAvailabilityMetricProps
    ): IMetric {
        let keyprefix = props.keyprefix ? props.keyprefix : props.availabilityZone.substring(props.availabilityZone.length - 1);

        let usingMetrics: { [key: string]: IMetric } = {};
        let metrics: IMetric[] = [];

        albs.forEach((alb: IApplicationLoadBalancer) => {
            let target5xx: IMetric = alb.metrics.httpCodeTarget(
                HttpCodeTarget.TARGET_5XX_COUNT,
                {
                  dimensionsMap: {
                    AvailabilityZone: props.availabilityZone,
                    LoadBalancer: (alb as ILoadBalancerV2 as BaseLoadBalancer)
                      .loadBalancerFullName,
                  },
                  label: props.availabilityZoneId + "-" + alb.loadBalancerArn + "-target-5xx",
                  period: props.period,
                  statistic: Stats.SUM,
                  unit: Unit.COUNT
                },
              );
            
              let elb5xx: IMetric = alb.metrics.httpCodeElb(
                HttpCodeElb.ELB_5XX_COUNT,
                {
                  dimensionsMap: {
                    AvailabilityZone: props.availabilityZone,
                    LoadBalancer: (alb as ILoadBalancerV2 as BaseLoadBalancer)
                      .loadBalancerFullName,
                  },
                  label: props.availabilityZoneId + "-" + alb.loadBalancerArn + "-elb-5xx",
                  period: props.period,
                  statistic: Stats.SUM,
                  unit: Unit.COUNT
                },
              );
      
              let requestCount: IMetric = alb.metrics.requestCount(
                {
                  dimensionsMap: {
                    AvailabilityZone: props.availabilityZone,
                    LoadBalancer: (alb as ILoadBalancerV2 as BaseLoadBalancer)
                      .loadBalancerFullName,
                  },
                  label: props.availabilityZoneId + "-" + alb.loadBalancerArn + "-request-count",
                  period: props.period,
                  statistic: Stats.SUM,
                  unit: Unit.COUNT
                }
              );
      
              let target2xx: IMetric = alb.metrics.httpCodeTarget(
                HttpCodeTarget.TARGET_2XX_COUNT,
                {
                  dimensionsMap: {
                    AvailabilityZone: props.availabilityZone,
                    LoadBalancer: (alb as ILoadBalancerV2 as BaseLoadBalancer)
                      .loadBalancerFullName,
                  },
                  label: props.availabilityZoneId + "-" + alb.loadBalancerArn + "-target-2xx",
                  period: props.period,
                  statistic: Stats.SUM,
                  unit: Unit.COUNT
                }
              );
      
              let elb3xx: IMetric = alb.metrics.httpCodeElb(
                HttpCodeElb.ELB_3XX_COUNT,
                {
                  dimensionsMap: {
                    AvailabilityZone: props.availabilityZone,
                    LoadBalancer: (alb as ILoadBalancerV2 as BaseLoadBalancer)
                      .loadBalancerFullName,
                  },
                  label: props.availabilityZoneId + "-" + alb.loadBalancerArn + "-elb-3xx",
                  period: props.period,
                  statistic: Stats.SUM,
                  unit: Unit.COUNT
                }
              );
      
              let target3xx: IMetric = alb.metrics.httpCodeTarget(
                HttpCodeTarget.TARGET_3XX_COUNT,
                {
                  dimensionsMap: {
                    AvailabilityZone: props.availabilityZone,
                    LoadBalancer: (alb as ILoadBalancerV2 as BaseLoadBalancer)
                      .loadBalancerFullName,
                  },
                  label: props.availabilityZoneId + "-" + alb.loadBalancerArn + "-target-3xx",
                  period: props.period,
                  statistic: Stats.SUM,
                  unit: Unit.COUNT
                }
              );
       
              switch(props.metricType) {
                  case AvailabilityMetricType.FAULT_COUNT:
                      usingMetrics[`${keyprefix}1`] = target5xx;
                      usingMetrics[`${keyprefix}2`] = elb5xx;
      
                      metrics.push(new MathExpression({
                          expression: `FILL(${keyprefix}1, 0) + FILL(${keyprefix}2, 0)`,
                          usingMetrics: usingMetrics,
                          label: props.availabilityZoneId + "-" + alb.loadBalancerArn + "-fault-count",
                          period: props.period,
                      }));
                      break;
        
                  case AvailabilityMetricType.SUCCESS_COUNT:
                      usingMetrics[`${keyprefix}1`] = target2xx;
                      usingMetrics[`${keyprefix}2`] = target3xx;
                      usingMetrics[`${keyprefix}3`] = elb3xx;
        
                      metrics.push(new MathExpression({
                          expression: `${keyprefix}1+${keyprefix}2+${keyprefix}3`,
                          usingMetrics: usingMetrics,
                          label: props.availabilityZoneId + "-" + alb.loadBalancerArn + "-success-count",
                          period: props.period,
                      }));
                      break;
                              
                  case AvailabilityMetricType.REQUEST_COUNT:
                     metrics.push(requestCount);
                     break;

                  default:
                    throw new Error("This method only supports COUNT availability metrics.");
              }

            keyprefix = MetricsHelper.nextChar(keyprefix);
        });

        metrics.forEach((metric: IMetric, index: number) => {
            usingMetrics[`${keyprefix}${index}`] = metric;
        });

        return new MathExpression({
            expression: Object.keys(usingMetrics).join("+"),
            usingMetrics: usingMetrics,
            label: props.label,
            period: props.period,
        });
    }
    
    /**
     * Gets a specified availability metric in the specified AZ for the ALB
     * @param alb The ALB
     * @param props The request props
     * @returns The metric requested
     */
    static getPerAZAvailabilityMetric(
        alb: IApplicationLoadBalancer, 
        props: ZonalApplicationLoadBalancerAvailabilityMetricProps
    ): IMetric {
        let keyprefix = props.keyprefix ? props.keyprefix : props.availabilityZone.substring(props.availabilityZone.length - 1);

        let target5xx: IMetric = alb.metrics.httpCodeTarget(
          HttpCodeTarget.TARGET_5XX_COUNT,
          {
            dimensionsMap: {
              AvailabilityZone: props.availabilityZone,
              LoadBalancer: (alb as ILoadBalancerV2 as BaseLoadBalancer)
                .loadBalancerFullName,
            },
            label: props.availabilityZoneId + "-target-5xx",
            period: props.period,
            statistic: Stats.SUM,
            unit: Unit.COUNT
          },
        );
      
        let elb5xx: IMetric = alb.metrics.httpCodeElb(
          HttpCodeElb.ELB_5XX_COUNT,
          {
            dimensionsMap: {
              AvailabilityZone: props.availabilityZone,
              LoadBalancer: (alb as ILoadBalancerV2 as BaseLoadBalancer)
                .loadBalancerFullName,
            },
            label: props.availabilityZoneId + "-elb-5xx",
            period: props.period,
            statistic: Stats.SUM,
            unit: Unit.COUNT
          },
        );

        let requestCount: IMetric = alb.metrics.requestCount(
          {
            dimensionsMap: {
              AvailabilityZone: props.availabilityZone,
              LoadBalancer: (alb as ILoadBalancerV2 as BaseLoadBalancer)
                .loadBalancerFullName,
            },
            label: props.availabilityZoneId,
            period: props.period,
            statistic: Stats.SUM,
            unit: Unit.COUNT
          }
        );

        let target2xx: IMetric = alb.metrics.httpCodeTarget(
          HttpCodeTarget.TARGET_2XX_COUNT,
          {
            dimensionsMap: {
              AvailabilityZone: props.availabilityZone,
              LoadBalancer: (alb as ILoadBalancerV2 as BaseLoadBalancer)
                .loadBalancerFullName,
            },
            label: props.availabilityZoneId + "-target-2xx",
            period: props.period,
            statistic: Stats.SUM,
            unit: Unit.COUNT
          }
        );

        let elb3xx: IMetric = alb.metrics.httpCodeElb(
          HttpCodeElb.ELB_3XX_COUNT,
          {
            dimensionsMap: {
              AvailabilityZone: props.availabilityZone,
              LoadBalancer: (alb as ILoadBalancerV2 as BaseLoadBalancer)
                .loadBalancerFullName,
            },
            label: props.availabilityZoneId + "-elb-3xx",
            period: props.period,
            statistic: Stats.SUM,
            unit: Unit.COUNT
          }
        );

        let target3xx: IMetric = alb.metrics.httpCodeTarget(
          HttpCodeTarget.TARGET_3XX_COUNT,
          {
            dimensionsMap: {
              AvailabilityZone: props.availabilityZone,
              LoadBalancer: (alb as ILoadBalancerV2 as BaseLoadBalancer)
                .loadBalancerFullName,
            },
            label: props.availabilityZoneId + "-target-3xx",
            period: props.period,
            statistic: Stats.SUM,
            unit: Unit.COUNT
          }
        );

        let usingMetrics: { [key: string]: IMetric } = {};

        switch(props.metricType) {
            case AvailabilityMetricType.FAULT_COUNT:
                usingMetrics[`${keyprefix}1`] = target5xx;
                usingMetrics[`${keyprefix}2`] = elb5xx;

                return new MathExpression({
                    expression: `FILL(${keyprefix}1, 0) + FILL(${keyprefix}2, 0)`,
                    usingMetrics: usingMetrics,
                    label: props.label,
                    period: props.period,
                });

            case AvailabilityMetricType.FAULT_RATE:
              
              // Request count only includes requests where a response was generated from a target
              usingMetrics[`${keyprefix}1`] = target5xx;
              usingMetrics[`${keyprefix}2`] = requestCount;

              return new MathExpression({
                  expression: `(${keyprefix}1/${keyprefix}2)*100`,
                  usingMetrics: usingMetrics,
                  label: props.label,
                  period: props.period,
              });

            case AvailabilityMetricType.SUCCESS_COUNT:
                usingMetrics[`${keyprefix}1`] = target2xx;
                usingMetrics[`${keyprefix}2`] = target3xx;
                usingMetrics[`${keyprefix}3`] = elb3xx;
  
                return new MathExpression({
                    expression: `${keyprefix}1+${keyprefix}2+${keyprefix}3`,
                    usingMetrics: usingMetrics,
                    label: props.label,
                    period: props.period,
                });

            case AvailabilityMetricType.SUCCESS_RATE:
                usingMetrics[`${keyprefix}1`] = target2xx;
                usingMetrics[`${keyprefix}2`] = target3xx;
                usingMetrics[`${keyprefix}3`] = requestCount;
  
                return new MathExpression({
                    expression: `((${keyprefix}1+${keyprefix}2)/${keyprefix}3)*100`,
                    usingMetrics: usingMetrics,
                    label: props.label,
                    period: props.period,
                });
                        
            case AvailabilityMetricType.REQUEST_COUNT:
               return requestCount;
        }
    }

    /**
     * Gets the ALBs specified availability metric at the regional level (only looks
     * at the regional dimension for the targets, not per AZ)
     * @param alb The ALB
     * @param props The request props
     * @returns The regional availability metric requested
     */
    static getRegionalAvailabilityMetric(
        alb: IApplicationLoadBalancer, 
        props: RegionalApplicationLoadBalancerAvailabilityMetricProps
    ): IMetric {
        let keyprefix = props.keyprefix ? props.keyprefix : "a";

        let target5xx: IMetric = alb.metrics.httpCodeTarget(
          HttpCodeTarget.TARGET_5XX_COUNT,
          {
            dimensionsMap: {
              LoadBalancer: (alb as ILoadBalancerV2 as BaseLoadBalancer)
                .loadBalancerFullName,
            },
            label: "target-5xx",
            period: props.period,
            statistic: Stats.SUM,
            unit: Unit.COUNT
          },
        );
      
        let elb5xx: IMetric = alb.metrics.httpCodeElb(
          HttpCodeElb.ELB_5XX_COUNT,
          {
            dimensionsMap: {
              LoadBalancer: (alb as ILoadBalancerV2 as BaseLoadBalancer)
                .loadBalancerFullName,
            },
            label: "elb-5xx",
            period: props.period,
            statistic: Stats.SUM,
            unit: Unit.COUNT
          },
        );

        let requestCount: IMetric = alb.metrics.requestCount(
          {
            dimensionsMap: {
              LoadBalancer: (alb as ILoadBalancerV2 as BaseLoadBalancer)
                .loadBalancerFullName,
            },
            label: "request-count",
            period: props.period,
            statistic: Stats.SUM,
            unit: Unit.COUNT
          }
        );

        let target2xx: IMetric = alb.metrics.httpCodeTarget(
          HttpCodeTarget.TARGET_2XX_COUNT,
          {
            dimensionsMap: {
              LoadBalancer: (alb as ILoadBalancerV2 as BaseLoadBalancer)
                .loadBalancerFullName,
            },
            label: "target-2xx",
            period: props.period,
            statistic: Stats.SUM,
            unit: Unit.COUNT
          }
        );

        let elb3xx: IMetric = alb.metrics.httpCodeElb(
          HttpCodeElb.ELB_3XX_COUNT,
          {
            dimensionsMap: {
              LoadBalancer: (alb as ILoadBalancerV2 as BaseLoadBalancer)
                .loadBalancerFullName,
            },
            label: "elb-3xx",
            period: props.period,
            statistic: Stats.SUM,
            unit: Unit.COUNT
          }
        );

        let target3xx: IMetric = alb.metrics.httpCodeTarget(
          HttpCodeTarget.TARGET_3XX_COUNT,
          {
            dimensionsMap: {
              LoadBalancer: (alb as ILoadBalancerV2 as BaseLoadBalancer)
                .loadBalancerFullName,
            },
            label: "target-3xx",
            period: props.period,
            statistic: Stats.SUM,
            unit: Unit.COUNT
          }
        );

        let usingMetrics: { [key: string]: IMetric } = {};

        switch(props.metricType) {
            case AvailabilityMetricType.FAULT_COUNT:
                usingMetrics[`${keyprefix}1`] = target5xx;
                usingMetrics[`${keyprefix}2`] = elb5xx;

                return new MathExpression({
                    expression: `FILL(${keyprefix}1, 0) + FILL(${keyprefix}2, 0)`,
                    usingMetrics: usingMetrics,
                    label: props.label,
                    period: props.period,
                });

            case AvailabilityMetricType.FAULT_RATE:
              
              usingMetrics[`${keyprefix}1`] = target5xx;
              usingMetrics[`${keyprefix}2`] = requestCount;

              return new MathExpression({
                  expression: `(${keyprefix}1/${keyprefix}2)*100`,
                  usingMetrics: usingMetrics,
                  label: props.label,
                  period: props.period,
              });

            case AvailabilityMetricType.SUCCESS_COUNT:
                usingMetrics[`${keyprefix}1`] = target2xx;
                usingMetrics[`${keyprefix}2`] = target3xx;
                usingMetrics[`${keyprefix}3`] = elb3xx;
  
                return new MathExpression({
                    expression: `${keyprefix}1+${keyprefix}2+${keyprefix}3`,
                    usingMetrics: usingMetrics,
                    label: props.label,
                    period: props.period,
                });

            case AvailabilityMetricType.SUCCESS_RATE:
                usingMetrics[`${keyprefix}1`] = target2xx;
                usingMetrics[`${keyprefix}2`] = target3xx;
                usingMetrics[`${keyprefix}3`] = requestCount;
  
                return new MathExpression({
                    expression: `((${keyprefix}1+${keyprefix}2)/${keyprefix}3)*100`,
                    usingMetrics: usingMetrics,
                    label: props.label,
                    period: props.period,
                });
                        
            case AvailabilityMetricType.REQUEST_COUNT:
               return requestCount;
        }
    }

    /**
     * Gets the ALB's TargetResponseTime metric at the regional level (only looks
     * at the regional dimension for the targets, not per AZ)
     * @param props  The request props
     * @returns 
     */
    static getRegionalLatencyMetric(
        props: RegionalApplicationLoadBalancerLatencyMetricProps
    ): IMetric {
        return props.alb.metrics.targetResponseTime(
            {
              dimensionsMap: {
                LoadBalancer: (props.alb as ILoadBalancerV2 as BaseLoadBalancer)
                  .loadBalancerFullName,
              },
              label: Aws.REGION,
              period: props.period,
              statistic: props.statistic,
              unit: Unit.SECONDS
            }
          );
    }

    /**
     * Calculates the total number of faults for all ALBs combined per AZ
     * @param albs The ALBs to aggregate
     * @param period The period of time to calculate the metrics
     * @param azMapper The AZ mapper function so the metrics are correctly labeled with their AZ ID
     * @returns 
     */
    static getTotalAlbFaultCountPerZone(
      albs: IApplicationLoadBalancer[],
      period: Duration,
      azMapper: AvailabilityZoneMapper
    ) : {[key: string]: IMetric}
    {
      let faultsPerZone: {[key: string]: IMetric} = {};
      let metricsPerAZ: {[key: string]: IMetric[]} = {};
      let keyprefix: string = MetricsHelper.nextChar();
  
      albs.forEach((alb: IApplicationLoadBalancer) => {
  
        alb.vpc!.availabilityZones.forEach((availabilityZone: string) => {
          if (!(availabilityZone in metricsPerAZ)) {
            metricsPerAZ[availabilityZone] = [];
          }
  
          let azLetter = availabilityZone.substring(availabilityZone.length - 1);
          let availabilityZoneId = azMapper.availabilityZoneIdFromAvailabilityZoneLetter(azLetter);
  
          // 5xx responses from targets
          let target5xx: IMetric = alb.metrics.httpCodeTarget(
            HttpCodeTarget.TARGET_5XX_COUNT,
            {
              dimensionsMap: {
                AvailabilityZone: availabilityZone,
                LoadBalancer: (alb as ILoadBalancerV2 as BaseLoadBalancer)
                  .loadBalancerFullName,
              },
              label: availabilityZoneId,
              period: period,
              statistic: Stats.SUM,
              unit: Unit.COUNT
            },
          );
        
          // 5xx responses from ELB
          let elb5xx: IMetric = alb.metrics.httpCodeElb(
            HttpCodeElb.ELB_5XX_COUNT,
            {
              dimensionsMap: {
                AvailabilityZone: availabilityZone,
                LoadBalancer: (alb as ILoadBalancerV2 as BaseLoadBalancer)
                  .loadBalancerFullName,
              },
              label: availabilityZoneId,
              period: period,
              statistic: Stats.SUM,
              unit: Unit.COUNT
            },
          );
  
          let usingMetrics: {[key: string]: IMetric} = {};
          usingMetrics[`${keyprefix}1`] = elb5xx;
          usingMetrics[`${keyprefix}2`] = target5xx;
  
          // This is the total number of faults per zone for this load balancer
          metricsPerAZ[availabilityZone].push(new MathExpression({
            expression: `FILL(${keyprefix}1, 0) + FILL(${keyprefix}2, 0)`,
            usingMetrics: usingMetrics,
            period: period
          }));
  
          keyprefix = MetricsHelper.nextChar(keyprefix);
        });   
      });
  
      // We can have multiple load balancers per zone, so add their fault count
      // metrics together
      Object.keys(metricsPerAZ).forEach((availabilityZone: string) => {
        let azLetter = availabilityZone.substring(availabilityZone.length - 1);
        let availabilityZoneId = azMapper.availabilityZoneIdFromAvailabilityZoneLetter(azLetter);
  
        let usingMetrics: {[key: string]: IMetric} = {};
  
        metricsPerAZ[availabilityZone].forEach((metric: IMetric, index: number) => {
          usingMetrics[`${keyprefix}${index}`] = metric;
        });
  
        faultsPerZone[azLetter] = new MathExpression({
          expression: Object.keys(usingMetrics).join("+"),
          usingMetrics: usingMetrics,
          label: availabilityZoneId,
          period: period
        });
      });
  
      return faultsPerZone;
    }

    /**
     * Creates a zonal processed bytes metric for the specified load balancer
     * @param loadBalancerFullName
     * @param availabilityZoneName
     * @param period
     * @returns IMetric
     */
    static getPerAZProcessedBytesMetric(
      alb: IApplicationLoadBalancer,
      availabilityZone: string,
      availabilityZoneId: string,
      period: Duration,
      addLoadBalancerArnToLabel?: boolean
    ): IMetric {
      return alb.metrics.processedBytes({
          period: period,
          dimensionsMap:{
              LoadBalancer: (alb as ILoadBalancerV2 as BaseLoadBalancer).loadBalancerFullName,
              AvailabilityZone: availabilityZone,
          },
          label: availabilityZoneId + (addLoadBalancerArnToLabel ? "-" + alb.loadBalancerArn : "")
      });
    }

    /**
     * Creates a zonal processed bytes metric for the specified load balancer
     * @param loadBalancerFullName
     * @param availabilityZoneName
     * @param period
     * @returns IMetric
     */
    static getRegionalProcessedBytesMetric(
        alb: IApplicationLoadBalancer,
        period: Duration,
        addLoadBalancerArn?: boolean
      ): IMetric {
        return alb.metrics.processedBytes({
            period: period,
            dimensionsMap:{
                LoadBalancer: (alb as ILoadBalancerV2 as BaseLoadBalancer).loadBalancerFullName,
            },
            label: Aws.REGION + (addLoadBalancerArn ? "-" + alb.loadBalancerArn : "")
        });
    }
}