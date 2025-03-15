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
      azMapper: AvailabilityZoneMapper,
      prefix?: string
    ) : {[key: string]: IMetric}
    {
      let faultsPerZone: {[key: string]: IMetric} = {};
      let metricsPerAZ: {[key: string]: IMetric[]} = {};
      let keyprefix: string = prefix ? prefix : MetricsHelper.nextChar();
  
      albs.forEach((alb: IApplicationLoadBalancer) => {
  
        alb.vpc!.availabilityZones.forEach((availabilityZone: string) => {
          let azLetter = availabilityZone.substring(availabilityZone.length - 1);
          let availabilityZoneId = azMapper.availabilityZoneIdFromAvailabilityZoneLetter(azLetter);

          if (!(azLetter in metricsPerAZ)) {
            metricsPerAZ[azLetter] = [];
          }
  
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
          metricsPerAZ[azLetter].push(new MathExpression({
            expression: `FILL(${keyprefix}1, 0) + FILL(${keyprefix}2, 0)`,
            usingMetrics: usingMetrics,
            period: period,
            label: availabilityZoneId
          }));
  
          keyprefix = MetricsHelper.nextChar(keyprefix);
        });   
      });
  
      // We can have multiple load balancers per zone, so add their fault count
      // metrics together
      Object.keys(metricsPerAZ).forEach((azLetter: string) => {
        let availabilityZoneId = azMapper.availabilityZoneIdFromAvailabilityZoneLetter(azLetter);

        if (metricsPerAZ[azLetter].length > 1) {
  
          let usingMetrics: {[key: string]: IMetric} = {};
          
          metricsPerAZ[azLetter].forEach((metric: IMetric, index: number) => {
            usingMetrics[`${keyprefix}${index}`] = metric;
          });
        
          faultsPerZone[azLetter] = new MathExpression({
            expression: Object.keys(usingMetrics).join("+"),
            usingMetrics: usingMetrics,
            label: availabilityZoneId,
            period: period
          });
        }
        else {
          faultsPerZone[azLetter] = metricsPerAZ[azLetter][0];
        }
      });
      return faultsPerZone;
    }

    /**
     * Calculates the total number of faults for all ALBs combined per AZ
     * @param albs The ALBs to aggregate
     * @param period The period of time to calculate the metrics
     * @param azMapper The AZ mapper function so the metrics are correctly labeled with their AZ ID
     * @returns 
     */
    static getTotalAlbSuccessCountPerZone(
      albs: IApplicationLoadBalancer[],
      period: Duration,
      azMapper: AvailabilityZoneMapper
    ) : {[key: string]: IMetric}
    {
      let successPerZone: {[key: string]: IMetric} = {};
      let metricsPerAZ: {[key: string]: IMetric[]} = {};
      let keyprefix: string = MetricsHelper.nextChar();
  
      albs.forEach((alb: IApplicationLoadBalancer) => {
  
        alb.vpc!.availabilityZones.forEach((availabilityZone: string) => {
          let azLetter = availabilityZone.substring(availabilityZone.length - 1);
          let availabilityZoneId = azMapper.availabilityZoneIdFromAvailabilityZoneLetter(azLetter);

          if (!(azLetter in metricsPerAZ)) {
            metricsPerAZ[azLetter] = [];
          }
  
          // 2xx responses from targets
          let target2xx: IMetric = alb.metrics.httpCodeTarget(
            HttpCodeTarget.TARGET_2XX_COUNT,
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

          // 3xx responses from targets
          let target3xx: IMetric = alb.metrics.httpCodeTarget(
            HttpCodeTarget.TARGET_3XX_COUNT,
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
        
          // 3xx responses from ELB
          let elb3xx: IMetric = alb.metrics.httpCodeElb(
            HttpCodeElb.ELB_3XX_COUNT,
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
          usingMetrics[`${keyprefix}1`] = elb3xx;
          usingMetrics[`${keyprefix}2`] = target2xx;
          usingMetrics[`${keyprefix}3`] = target3xx;
  
          // This is the total number of faults per zone for this load balancer
          metricsPerAZ[azLetter].push(new MathExpression({
            expression: `FILL(${keyprefix}1, 0) + FILL(${keyprefix}2, 0) + FILL(${keyprefix}3, 0)`,
            usingMetrics: usingMetrics,
            period: period,
            label: availabilityZoneId
          }));
  
          keyprefix = MetricsHelper.nextChar(keyprefix);
        });   
      });
  
      // We can have multiple load balancers per zone, so add their success count
      // metrics together
      Object.keys(metricsPerAZ).forEach((azLetter: string) => {

        let availabilityZoneId = azMapper.availabilityZoneIdFromAvailabilityZoneLetter(azLetter);
        
        if (metricsPerAZ[azLetter].length > 1) {
          let usingMetrics: {[key: string]: IMetric} = {};
          
          metricsPerAZ[azLetter].forEach((metric: IMetric, index: number) => {
            usingMetrics[`${keyprefix}${index}`] = metric;
          });
        
          successPerZone[azLetter] = new MathExpression({
            expression: Object.keys(usingMetrics).join("+"),
            usingMetrics: usingMetrics,
            label: availabilityZoneId,
            period: period
          });
        }
        else {
          successPerZone[azLetter] = metricsPerAZ[azLetter][0];
        }
      });
    
      return successPerZone;
    }

    /**
     * Calculates the total number of processed bytes for all ALBs in each zone
     * @param albs 
     * @param period 
     * @param azMapper 
     * @returns 
     */
    static getTotalAlbRequestsPerZone(
      albs: IApplicationLoadBalancer[],
      period: Duration,
      azMapper: AvailabilityZoneMapper,
      prefix?: string
    ) : {[key: string]: IMetric}
    {
      let requestsPerZone: {[key: string]: IMetric} = {};
      let metricsPerAZ: {[key: string]: IMetric[]} = {};
      let keyprefix: string = prefix ? prefix : MetricsHelper.nextChar();

      albs.forEach((alb: IApplicationLoadBalancer) => {
  
        alb.vpc!.availabilityZones.forEach((availabilityZone: string) => {
          let azLetter = availabilityZone.substring(availabilityZone.length - 1);
          let availabilityZoneId = azMapper.availabilityZoneIdFromAvailabilityZoneLetter(azLetter);

          if (!(azLetter in metricsPerAZ)) {
            metricsPerAZ[azLetter] = [];
          }
  
          let requestCount: IMetric = alb.metrics.requestCount(
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
  
          metricsPerAZ[azLetter].push(requestCount);
        });   
      });
  
      // We can have multiple load balancers per zone, so add their processed bytes together
      Object.keys(metricsPerAZ).forEach((azLetter: string) => {
        let availabilityZoneId = azMapper.availabilityZoneIdFromAvailabilityZoneLetter(azLetter);

        if (metricsPerAZ[azLetter].length > 1) {
  
          let usingMetrics: {[key: string]: IMetric} = {};
          
          metricsPerAZ[azLetter].forEach((metric: IMetric, index: number) => {
            usingMetrics[`${keyprefix}${index}`] = metric;
          });

          keyprefix = MetricsHelper.nextChar(keyprefix);
        
          requestsPerZone[azLetter] = new MathExpression({
            expression: Object.keys(usingMetrics).join("+"),
            usingMetrics: usingMetrics,
            label: availabilityZoneId,
            period: period
          });
        }
        else {
          requestsPerZone[azLetter] = metricsPerAZ[azLetter][0];
        }
      });
  
      return requestsPerZone;
    }

    /**
     * Calculates the total number of processed bytes for all ALBs in each zone
     * @param albs 
     * @param period 
     * @param azMapper 
     * @returns 
     */
    static getTotalAlbProcessedBytesPerZone(
      albs: IApplicationLoadBalancer[],
      period: Duration,
      azMapper: AvailabilityZoneMapper
    ) : {[key: string]: IMetric}
    {
      let processedBytesPerZone: {[key: string]: IMetric} = {};
      let metricsPerAZ: {[key: string]: IMetric[]} = {};
      let keyprefix: string = MetricsHelper.nextChar();
  
      albs.forEach((alb: IApplicationLoadBalancer) => {
  
        alb.vpc!.availabilityZones.forEach((availabilityZone: string) => {
          let azLetter = availabilityZone.substring(availabilityZone.length - 1);
          let availabilityZoneId = azMapper.availabilityZoneIdFromAvailabilityZoneLetter(azLetter);

          if (!(azLetter in metricsPerAZ)) {
            metricsPerAZ[azLetter] = [];
          }
  
          let processedBytes: IMetric = alb.metrics.processedBytes(
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
  
          metricsPerAZ[azLetter].push(processedBytes);
        });   
      });
  
      // We can have multiple load balancers per zone, so add their processed bytes together
      Object.keys(metricsPerAZ).forEach((azLetter: string) => {
        let availabilityZoneId = azMapper.availabilityZoneIdFromAvailabilityZoneLetter(azLetter);

        if (metricsPerAZ[azLetter].length > 1) {

          let usingMetrics: {[key: string]: IMetric} = {};
          
          metricsPerAZ[azLetter].forEach((metric: IMetric, index: number) => {
            usingMetrics[`${keyprefix}${index}`] = metric;
          });

          keyprefix = MetricsHelper.nextChar(keyprefix);
        
          processedBytesPerZone[azLetter] = new MathExpression({
            expression: Object.keys(usingMetrics).join("+"),
            usingMetrics: usingMetrics,
            label: availabilityZoneId,
            period: period
          });
        }
        else {
          processedBytesPerZone[azLetter] = metricsPerAZ[azLetter][0];
        }
      });
  
      return processedBytesPerZone;
    }

    /**
     * Calculates a weighted approximation of the latency at the provided statistic for all ALBs
     * in each zone.
     * @param albs 
     * @param statistic 
     * @param period 
     * @param azMapper 
     * @returns 
     */
    static getTotalAlbLatencyPerZone(
      albs: IApplicationLoadBalancer[],
      statistic: string,
      period: Duration,
      azMapper: AvailabilityZoneMapper
    ) : {[key: string]: IMetric}
    {
      let latencyPerZone: {[key: string]: IMetric} = {};
      let keyprefix: string = MetricsHelper.nextChar();

      //let requestCountsPerAZ: {[key: string]: IMetric[]} = {};
      let requestCountsPerAZMetricKeys: {[key: string]: string[]} = {};

      let weightedLatencyPerAZ: {[key: string]: IMetric[]} = {};
  
      albs.forEach((alb: IApplicationLoadBalancer) => {
  
        alb.vpc!.availabilityZones.forEach((availabilityZone: string) => {

          let azLetter = availabilityZone.substring(availabilityZone.length - 1);

          if (!(azLetter in weightedLatencyPerAZ)) {
            weightedLatencyPerAZ[azLetter] = [];
          }

          //if (!(azLetter in requestCountsPerAZ)) {
          //  requestCountsPerAZ[azLetter] = [];
          //}

          if (!(azLetter in requestCountsPerAZMetricKeys)) {
            requestCountsPerAZMetricKeys[azLetter] = [];
          }
   
          let availabilityZoneId = azMapper.availabilityZoneIdFromAvailabilityZoneLetter(azLetter);
  
          let latency: IMetric = alb.metrics.targetResponseTime(
            {
              dimensionsMap: {
                AvailabilityZone: availabilityZone,
                LoadBalancer: (alb as ILoadBalancerV2 as BaseLoadBalancer)
                  .loadBalancerFullName,
              },
              label: availabilityZoneId,
              period: period,
              statistic: statistic,
              unit: Unit.SECONDS
            },
          );

          let requestCount: IMetric = alb.metrics.requestCount(
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
          usingMetrics[`${keyprefix}1`] = latency;
          usingMetrics[`${keyprefix}2`] = requestCount;

          let weightedLatency: IMetric = new MathExpression({
            expression: `${keyprefix}1*${keyprefix}2`,
            usingMetrics: usingMetrics,
            period: period,
            label: availabilityZoneId
          });

          weightedLatencyPerAZ[azLetter].push(weightedLatency);

          //requestCountsPerAZ[azLetter].push(requestCount);
          requestCountsPerAZMetricKeys[azLetter].push(`${keyprefix}2`);
  
          keyprefix = MetricsHelper.nextChar(keyprefix);
        });   
      });
  
      // We can have multiple load balancers per zone, combine their latency per zone
      // to get an average latency percentile latency, like average p99
      Object.keys(weightedLatencyPerAZ).forEach((azLetter: string) => {
        let availabilityZoneId = azMapper.availabilityZoneIdFromAvailabilityZoneLetter(azLetter);
  
        let usingMetrics: {[key: string]: IMetric} = {};

        weightedLatencyPerAZ[azLetter].forEach((metric: IMetric, index: number) => {
          usingMetrics[`${keyprefix}${index}`] = metric;
        });

        let numerator = "(" + Object.keys(usingMetrics).join("+") + ")";
        let index = Object.keys(usingMetrics).length;

        keyprefix = MetricsHelper.nextChar(keyprefix);

        // TODO: We're duplicating the same metric with 2 different keys for request count
        //requestCountsPerAZ[azLetter].forEach((metric: IMetric, index: number) => {
        //  usingMetrics[`${keyprefix}${index}`] = metric;
        //}); 

        //let denominator: string = "(" + Object.keys(usingMetrics).slice(index).join("+") + ")";
        let denominator: string = "(" + requestCountsPerAZMetricKeys[azLetter].join("+") + ")";

        /**
         * We want to calculate this formula
         * 
         * (p99_1 * requests_1 + p99_2 * requests_2 + p99_3 * requests_3) / (requests_1 + requests_2 + requests_3)
         * 
         * This will provide a request weighted approximation of the p99
         * latency per AZ
         */
  
        latencyPerZone[azLetter] = new MathExpression({
          expression: "(" + numerator + "/" + denominator + ") * 1000",
          usingMetrics: usingMetrics,
          label: availabilityZoneId,
          period: period
        });

        keyprefix = MetricsHelper.nextChar(keyprefix);
      });
  
      return latencyPerZone;
    }

    /**
     * Calculates the fault rate per AZ
     * @param requestsPerZone 
     * @param faultsPerZone 
     * @param period 
     * @param azMapper 
     * @returns The fault rate per AZ using the AZ name letter as the key for each metric
     */
    static getTotalAlbFaultRatePerZone(
      albs: IApplicationLoadBalancer[],
      period: Duration,
      azMapper: AvailabilityZoneMapper,
    ) : {[key: string]: IMetric} {

      let faultRateMetrics: {[key: string]: IMetric} = {};
      let requestsPerZone: {[key: string]: IMetric} = this.getTotalAlbRequestsPerZone(albs, period, azMapper, "a");
      let faultsPerZone: {[key: string]: IMetric} = this.getTotalAlbFaultCountPerZone(albs, period, azMapper, "e");

      Object.keys(requestsPerZone).forEach((key: string) => {
        if (key in faultsPerZone) {
          let usingMetrics: {[key: string]: IMetric} = {};
          let keyprefix = 'z' + key;
         
          usingMetrics[`${keyprefix}1`] = faultsPerZone[key];
          usingMetrics[`${keyprefix}2`] = requestsPerZone[key];

          let zonalFaultRate: IMetric = new MathExpression({
            expression: `(${keyprefix}1/${keyprefix}2) * 100`,
            usingMetrics: usingMetrics,
            period: period,
            label: azMapper.availabilityZoneIdFromAvailabilityZoneLetter(key)
          });

          faultRateMetrics[key] = zonalFaultRate;
        }
        else {
          throw new Error("The zone " + key + " is not present in the faultsPerZone parameter.");
        }
      });

      Object.keys(faultsPerZone).forEach((key: string) => {
        if (!(key in requestsPerZone)) {
          throw new Error("The zone " + key + " is not present in the requestsPerZone parameter.");
        }
      });

      return faultRateMetrics;
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
