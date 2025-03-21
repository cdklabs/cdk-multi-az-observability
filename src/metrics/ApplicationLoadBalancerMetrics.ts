import { Alarm, Color, ComparisonOperator, GraphWidget, IAlarm, IMetric, IWidget, MathExpression, Metric, Stats, TreatMissingData, Unit } from "aws-cdk-lib/aws-cloudwatch";
import { BaseLoadBalancer, HttpCodeElb, HttpCodeTarget, IApplicationLoadBalancer, ILoadBalancerV2 } from "aws-cdk-lib/aws-elasticloadbalancingv2";
import { AvailabilityMetricType } from "../utilities/AvailabilityMetricType";
import { ZonalApplicationLoadBalancerLatencyMetricProps } from "../basic_observability/props/ZonalApplicationLoadBalancerLatencyMetricProps";
import { ZonalApplicationLoadBalancerAvailabilityMetricProps } from "../basic_observability/props/ZonalApplicationLoadBalancerAvailabilityMetricProps";
import { Aws, Duration } from "aws-cdk-lib";
import { RegionalApplicationLoadBalancerAvailabilityMetricProps } from "../basic_observability/props/RegionalApplicationLoadBalancerAvailabilityMetricProps";
import { RegionalApplicationLoadBalancerLatencyMetricProps } from "../basic_observability/props/RegionalApplicationLoadBalancerLatencyMetricProps";
import { AvailabilityZoneMapper } from "../azmapper/AvailabilityZoneMapper";
import { MetricsHelper } from "../utilities/MetricsHelper";
import { IConstruct } from "constructs";
import { ApplicationLoadBalancerAvailabilityOutlierAlgorithm } from "../outlier-detection/ApplicationLoadBalancerAvailabilityOutlierAlgorithm";
import { ApplicationLoadBalancerLatencyOutlierAlgorithm } from "../outlier-detection/ApplicationLoadBalancerLatencyOutlierAlgorithm";
import { IAvailabilityZoneMapper } from "../azmapper/IAvailabilityZoneMapper";

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
    ) : {[key: string]: IMetric}
    {
      let faultsPerZone: {[key: string]: IMetric} = {};
      let metricsPerAZ: {[key: string]: IMetric[]} = {};
  
      albs.forEach((alb: IApplicationLoadBalancer, albIndex: number) => {
  
        alb.vpc!.availabilityZones.forEach((availabilityZone: string, index: number) => {
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
        
          let usingMetrics: {[key: string]: IMetric} = {};
          usingMetrics[`${azLetter}${albIndex}_faultcount`] = target5xx;
  
          // This is the total number of faults per zone for this load balancer
          metricsPerAZ[azLetter].push(new MathExpression({
            expression: `FILL(${azLetter}${albIndex}_faultcount, 0)`,
            usingMetrics: usingMetrics,
            period: period,
            label: availabilityZoneId,
            color: MetricsHelper.colors[index]
          }));
        });   
      });
  
      // We can have multiple load balancers per zone, so add their fault count
      // metrics together
      Object.keys(metricsPerAZ).forEach((azLetter: string, index: number) => {
        let availabilityZoneId = azMapper.availabilityZoneIdFromAvailabilityZoneLetter(azLetter);

        if (metricsPerAZ[azLetter].length > 1) {
  
          let usingMetrics: {[key: string]: IMetric} = {};
          
          metricsPerAZ[azLetter].forEach((metric: IMetric, index: number) => {
            usingMetrics[`${azLetter}${index}_total_faultcount`] = metric;
          });
        
          faultsPerZone[azLetter] = new MathExpression({
            expression: Object.keys(usingMetrics).join("+"),
            usingMetrics: usingMetrics,
            label: availabilityZoneId,
            period: period,
            color: MetricsHelper.colors[index]
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
  
        alb.vpc!.availabilityZones.forEach((availabilityZone: string, index: number) => {
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
            label: availabilityZoneId,
            color: MetricsHelper.colors[index]
          }));
  
          keyprefix = MetricsHelper.nextChar(keyprefix);
        });   
      });
  
      // We can have multiple load balancers per zone, so add their success count
      // metrics together
      Object.keys(metricsPerAZ).forEach((azLetter: string, index: number) => {

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
            period: period,
            color: MetricsHelper.colors[index]
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
      azMapper: AvailabilityZoneMapper
    ) : {[key: string]: IMetric}
    {
      let requestsPerZone: {[key: string]: IMetric} = {};
      let metricsPerAZ: {[key: string]: IMetric[]} = {};

      albs.forEach((alb: IApplicationLoadBalancer) => {
  
        alb.vpc!.availabilityZones.forEach((availabilityZone: string, index: number) => {
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
              unit: Unit.COUNT,
              color: MetricsHelper.colors[index]
            },
          );
  
          metricsPerAZ[azLetter].push(requestCount);
        });   
      });
  
      // We can have multiple load balancers per zone, so add their processed bytes together
      Object.keys(metricsPerAZ).forEach((azLetter: string, index: number) => {
        let availabilityZoneId = azMapper.availabilityZoneIdFromAvailabilityZoneLetter(azLetter);

        if (metricsPerAZ[azLetter].length > 1) {
  
          let usingMetrics: {[key: string]: IMetric} = {};
          
          metricsPerAZ[azLetter].forEach((metric: IMetric, index: number) => {
            usingMetrics[`${azLetter}${index}`] = metric;
          });

          requestsPerZone[azLetter] = new MathExpression({
            expression: Object.keys(usingMetrics).join("+"),
            usingMetrics: usingMetrics,
            label: availabilityZoneId,
            period: period,
            color: MetricsHelper.colors[index]
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
  
        alb.vpc!.availabilityZones.forEach((availabilityZone: string, index: number) => {
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
              unit: Unit.COUNT,
              color: MetricsHelper.colors[index]
            },
          );
  
          metricsPerAZ[azLetter].push(processedBytes);
        });   
      });
  
      // We can have multiple load balancers per zone, so add their processed bytes together
      Object.keys(metricsPerAZ).forEach((azLetter: string, index: number) => {
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
            period: period,
            color: MetricsHelper.colors[index]
          });
        }
        else {
          processedBytesPerZone[azLetter] = metricsPerAZ[azLetter][0];
        }
      });
  
      return processedBytesPerZone;
    }

    static getTotalAnomalousHostCountPerZone(
      albs: IApplicationLoadBalancer[],
      period: Duration,
      azMapper: AvailabilityZoneMapper
    ) : {[key: string]: IMetric}
    {
      let anomalousHostsPerZone: {[key: string]: IMetric} = {};
      let metricsPerAZ: {[key: string]: IMetric[]} = {};
  
      albs.forEach((alb: IApplicationLoadBalancer) => {
  
        alb.vpc!.availabilityZones.forEach((availabilityZone: string, index: number) => {
          let azLetter = availabilityZone.substring(availabilityZone.length - 1);
          let availabilityZoneId = azMapper.availabilityZoneIdFromAvailabilityZoneLetter(azLetter);

          if (!(azLetter in metricsPerAZ)) {
            metricsPerAZ[azLetter] = [];
          }
  
          let anomalousHostCount: IMetric = new Metric({
            namespace: "AWS/ApplicationELB",
            region: Aws.REGION,
            metricName: "AnomalousHostCount",
            dimensionsMap: {
              AvailabilityZone: availabilityZone,
              LoadBalancer: (alb as ILoadBalancerV2 as BaseLoadBalancer)
                .loadBalancerFullName,
            },
            label: availabilityZoneId,
            unit: Unit.COUNT,
            color: MetricsHelper.colors[index],
            statistic: Stats.SUM,
            period: period
          });
  
          metricsPerAZ[azLetter].push(anomalousHostCount);
        });   
      });
  
      // We can have multiple load balancers per zone, so add their counts together
      Object.keys(metricsPerAZ).forEach((azLetter: string, index: number) => {
        let availabilityZoneId = azMapper.availabilityZoneIdFromAvailabilityZoneLetter(azLetter);

        if (metricsPerAZ[azLetter].length > 1) {

          let usingMetrics: {[key: string]: IMetric} = {};
          
          metricsPerAZ[azLetter].forEach((metric: IMetric, metricIndex: number) => {
            usingMetrics[`${azLetter}${metricIndex}`] = metric;
          });
        
          anomalousHostsPerZone[azLetter] = new MathExpression({
            expression: Object.keys(usingMetrics).join("+") + " + TIME_SERIES(0)",
            usingMetrics: usingMetrics,
            label: availabilityZoneId,
            period: period,
            color: MetricsHelper.colors[index]
          });
        }
        else {
          let usingMetrics: {[key: string]: IMetric} = {};
          usingMetrics[azLetter] = metricsPerAZ[azLetter][0];

          anomalousHostsPerZone[azLetter] = new MathExpression({
            expression: `FILL(${azLetter}, 0)`,
            usingMetrics: usingMetrics,
            label: availabilityZoneId,
            period: period,
            color: MetricsHelper.colors[index]
          });
        }
      });
  
      return anomalousHostsPerZone;
    }

    static getTotalMitigatedHostCountPerZone(
      albs: IApplicationLoadBalancer[],
      period: Duration,
      azMapper: AvailabilityZoneMapper
    ) : {[key: string]: IMetric}
    {
      let mitigatedHostsPerZone: {[key: string]: IMetric} = {};
      let metricsPerAZ: {[key: string]: IMetric[]} = {};

      albs.forEach((alb: IApplicationLoadBalancer) => {
  
        alb.vpc!.availabilityZones.forEach((availabilityZone: string, index: number) => {
          let azLetter = availabilityZone.substring(availabilityZone.length - 1);
          let availabilityZoneId = azMapper.availabilityZoneIdFromAvailabilityZoneLetter(azLetter);

          if (!(azLetter in metricsPerAZ)) {
            metricsPerAZ[azLetter] = [];
          }
  
          let mitigatedHostCount: IMetric = new Metric({
            namespace: "AWS/ApplicationELB",
            region: Aws.REGION,
            metricName: "MitigatedHostCount",
            dimensionsMap: {
              AvailabilityZone: availabilityZone,
              LoadBalancer: (alb as ILoadBalancerV2 as BaseLoadBalancer)
                .loadBalancerFullName,
            },
            label: availabilityZoneId,
            unit: Unit.COUNT,
            color: MetricsHelper.colors[index],
            statistic: Stats.SUM,
            period: period
          });
  
          metricsPerAZ[azLetter].push(mitigatedHostCount);
        });   
      });
  
      // We can have multiple load balancers per zone, so add their counts together
      Object.keys(metricsPerAZ).forEach((azLetter: string, index: number) => {
        let availabilityZoneId = azMapper.availabilityZoneIdFromAvailabilityZoneLetter(azLetter);

        if (metricsPerAZ[azLetter].length > 1) {

          let usingMetrics: {[key: string]: IMetric} = {};
          
          metricsPerAZ[azLetter].forEach((metric: IMetric, metricIndex: number) => {
            usingMetrics[`${azLetter}${metricIndex}`] = metric;
          });
       
          mitigatedHostsPerZone[azLetter] = new MathExpression({
            expression: Object.keys(usingMetrics).join("+") + " + TIME_SERIES(0)",
            usingMetrics: usingMetrics,
            label: availabilityZoneId,
            period: period,
            color: MetricsHelper.colors[index]
          });
        }
        else {
          let usingMetrics: {[key: string]: IMetric} = {};
          usingMetrics[azLetter] = metricsPerAZ[azLetter][0];

          mitigatedHostsPerZone[azLetter] = new MathExpression({
            expression: `FILL(${azLetter}, 0)`,
            usingMetrics: usingMetrics,
            label: availabilityZoneId,
            period: period,
            color: MetricsHelper.colors[index]
          });
        }
      });
  
      return mitigatedHostsPerZone;
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
      let latencyPerZonePerAlb: {[key: string]: {[key: string]: IMetric}[]} = {};
  
      albs.forEach((alb: IApplicationLoadBalancer) => {
  
        alb.vpc!.availabilityZones.forEach((availabilityZone: string) => {

          let azLetter = availabilityZone.substring(availabilityZone.length - 1);
          let availabilityZoneId = azMapper.availabilityZoneIdFromAvailabilityZoneLetter(azLetter);

          if (!(availabilityZone in latencyPerZonePerAlb)) {
            latencyPerZonePerAlb[availabilityZone] = [];
          }
       
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

          latencyPerZonePerAlb[availabilityZone].push({"latency": latency, "requests": requestCount});
        });   
      });

      /**
       * We want to calculate this formula
       * 
       * (((p99_1 * requests_1) + (p99_2 * requests_2) + (p99_3 * requests_3)) / (requests_1 + requests_2 + requests_3)) * 1000
       * 
       * This will provide a request weighted approximation of the p99
       * latency per AZ
       */  
      let latencyPerZone: {[key: string]: IMetric} = {};

      Object.keys(latencyPerZonePerAlb).forEach((availabiltityZone: string, index: number) => {
        let requestKeys: string[] = [];
        let latencyKeys: string[] = [];
        let usingMetrics: {[key: string]: IMetric} = {};
        
        let azLetter: string = availabiltityZone.substring(availabiltityZone.length - 1);
        let availabilityZoneId: string = azMapper.availabilityZoneIdFromAvailabilityZoneLetter(azLetter);
        
        latencyPerZonePerAlb[availabiltityZone].forEach((metric: {[key: string]: IMetric}, index: number) => {

          usingMetrics[`${azLetter}${index}_requests`] =  metric["requests"];
          usingMetrics[`${azLetter}${index}_latency`] = metric["latency"];

          requestKeys.push(`${azLetter}${index}_requests`);
          latencyKeys.push(`(${azLetter}${index}_latency * ${azLetter}${index}_requests)`);

        });

        latencyPerZone[availabiltityZone] = new MathExpression({
          expression: `((${latencyKeys.join("+")}) / (${requestKeys.join("+")})) * 1000`,
          usingMetrics: usingMetrics,
          label: availabilityZoneId,
          period: period,
          color: MetricsHelper.colors[index]
        });
      });
  
      return latencyPerZone;
    }

    static getWeightedLatencyZScorePerZone(
      albs: IApplicationLoadBalancer[],
      statistic: string,
      period: Duration,
      azMapper: IAvailabilityZoneMapper
    ) : {[key: string]: IMetric} {

      let weightedLatency: {[key: string]: IMetric} = this.getTotalAlbLatencyPerZone(albs, statistic, period, azMapper);
      let zscore: {[key: string]: IMetric} = {};

      // Rename the metric keys to the AZ letter to use in the metrics equations
      let updatedMetrics: {[key: string]: IMetric} = {};

      Object.keys(weightedLatency).forEach((availabilityZone: string) => {
        let azLetter: string = availabilityZone.substring(availabilityZone.length - 1);
        updatedMetrics[azLetter] = weightedLatency[availabilityZone];
      })

      Object.keys(weightedLatency).forEach((availabilityZone: string, index: number) => {
        let azLetter: string = availabilityZone.substring(availabilityZone.length - 1);
        let availabilityZoneId: string = azMapper.availabilityZoneIdFromAvailabilityZoneLetter(azLetter);

        zscore[availabilityZone] = new MathExpression({
          expression: `(${azLetter} - AVG([${Object.keys(updatedMetrics).filter(x => x != azLetter).join(",")}])) / STDDEV([${Object.keys(updatedMetrics).filter(x => x != azLetter).join(",")}])`,
          usingMetrics: updatedMetrics,
          label: availabilityZoneId,
          period: period,
          color: MetricsHelper.colors[index]
        });
      });

      return zscore;
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
      let requestsPerZone: {[key: string]: IMetric} = this.getTotalAlbRequestsPerZone(albs, period, azMapper);
      let faultsPerZone: {[key: string]: IMetric} = this.getTotalAlbFaultCountPerZone(albs, period, azMapper);

      Object.keys(requestsPerZone).forEach((key: string, index: number) => {
        if (key in faultsPerZone) {
          let usingMetrics: {[key: string]: IMetric} = {};
          let keyprefix = 'z' + key;
         
          usingMetrics[`${keyprefix}1`] = faultsPerZone[key];
          usingMetrics[`${keyprefix}2`] = requestsPerZone[key];

          let zonalFaultRate: IMetric = new MathExpression({
            expression: `(${keyprefix}1/${keyprefix}2) * 100`,
            usingMetrics: usingMetrics,
            period: period,
            label: azMapper.availabilityZoneIdFromAvailabilityZoneLetter(key),
            color: MetricsHelper.colors[index]
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

    static getTotalAlb5xxCountPerZone(
      albs: IApplicationLoadBalancer[],
      period: Duration,
      azMapper: IAvailabilityZoneMapper
    ) : {[key: string]: IMetric} {

      let faultsPerZone: {[key: string]: IMetric[]} = {};
      let aggregateFaultsPerZone: {[key: string]: IMetric} = {};

      albs.forEach((alb: IApplicationLoadBalancer) => {

        alb.vpc?.availabilityZones.forEach((availabilityZone: string) => {

          if (!(availabilityZone in faultsPerZone)) {
            faultsPerZone[availabilityZone] = [];
          }

          let azLetter = availabilityZone.substring(availabilityZone.length - 1);
          let availabilityZoneId = azMapper.availabilityZoneIdFromAvailabilityZoneLetter(azLetter);

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

          faultsPerZone[availabilityZone].push(elb5xx);
        });
      });

      Object.keys(faultsPerZone).forEach((availabilityZone: string, index: number) => {
        let azLetter = availabilityZone.substring(availabilityZone.length - 1);
        let availabilityZoneId = azMapper.availabilityZoneIdFromAvailabilityZoneLetter(azLetter);

        let usingMetrics: {[key: string]: IMetric} = {};

        if (faultsPerZone[availabilityZone].length > 1) {

          faultsPerZone[availabilityZone].forEach((metric: IMetric, faultIndex: number) => {
            usingMetrics[`${azLetter}${faultIndex}`] = metric;
          });

          aggregateFaultsPerZone[availabilityZone] = new MathExpression({
            expression: Object.keys(usingMetrics).join("+") + " + TIME_SERIES(0)",
            usingMetrics: usingMetrics,
            color: MetricsHelper.colors[index],
            label: availabilityZoneId
          });
        }
        else {
          let usingMetrics: {[key: string]: IMetric} = {};
          usingMetrics[azLetter] = faultsPerZone[availabilityZone][0];

          aggregateFaultsPerZone[availabilityZone] = new MathExpression({
            expression: `FILL(${azLetter}, 0)`,
            usingMetrics: usingMetrics,
            color: MetricsHelper.colors[index],
            label: availabilityZoneId
          });
        }
      });

      return aggregateFaultsPerZone;
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

    static createAZAvailabilityImpactAlarm(
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
  
    static createAZLatencyImpactAlarm(
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
  
    static createAZAvailabilityOutlierAlarm(
      scope: IConstruct,
      alb: IApplicationLoadBalancer, 
      algorithm: ApplicationLoadBalancerAvailabilityOutlierAlgorithm,
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
  
      switch (algorithm) {
        case ApplicationLoadBalancerAvailabilityOutlierAlgorithm.STATIC:
        default:
          return new Alarm(
            scope,
            keyprefix + '-availability-outlier-alarm',
            {
              alarmName:
                availabilityZoneId + '-' + alb.loadBalancerArn + '-availability-impact-outlier',
              actionsEnabled: false,
              metric: new MathExpression({
                expression: `(${azMetricId!}/(${Object.keys(usingMetrics).join("+")})) * 100`,
                usingMetrics: usingMetrics,
                label: availabilityZoneId + '-' + alb.loadBalancerArn + '-percent-of-faults',
                period: period,
              }),
              evaluationPeriods: evaluationPeriods,
              datapointsToAlarm: datapointsToAlarm,
              threshold: threshold,
              comparisonOperator: ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
              treatMissingData: TreatMissingData.IGNORE
            }
          );
      }
    }
  
    static createAZLatencyOutlierAlarm(
      scope: IConstruct,
      alb: IApplicationLoadBalancer, 
      algorithm: ApplicationLoadBalancerLatencyOutlierAlgorithm,
      availabilityZone: string,
      statistic: string,
      latencyThresold: number,
      outlierThreshold: number,
      period: Duration,
      evaluationPeriods: number,
      datapointsToAlarm: number,
      azMapper: IAvailabilityZoneMapper
    ) : IAlarm {
  
      let azLetter: string = availabilityZone.substring(availabilityZone.length - 1);
      let availabilityZoneId: string = azMapper.availabilityZoneIdFromAvailabilityZoneLetter(azLetter);

      switch (algorithm)
      {
        case ApplicationLoadBalancerLatencyOutlierAlgorithm.Z_SCORE:
        default:

          let weightedLatencyZScorePerZone: {[key: string]: IMetric} = ApplicationLoadBalancerMetrics.getWeightedLatencyZScorePerZone( [ alb ], statistic, period, azMapper);
          
          return new Alarm(
            scope,
            azLetter + "-latency-outlier-alarm",
            {
              alarmName:
                availabilityZoneId + '-' + alb.loadBalancerArn + '-latency-impact-outlier',
              actionsEnabled: false,
              metric: weightedLatencyZScorePerZone[availabilityZone],
              evaluationPeriods: evaluationPeriods,
              datapointsToAlarm: datapointsToAlarm,
              threshold: outlierThreshold,
              comparisonOperator: ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
              treatMissingData: TreatMissingData.IGNORE
            }
          );
        case ApplicationLoadBalancerLatencyOutlierAlgorithm.STATIC:
          
          let usingMetrics: {[key: string]: IMetric} = {};

          alb.vpc!.availabilityZones.forEach((az: string) => {
            let azLetter: string = az.substring(az.length - 1);
            let azId: string = azMapper.availabilityZoneIdFromAvailabilityZoneLetter(azLetter);

            // Target response time
            let targetResponseTime: IMetric = ApplicationLoadBalancerMetrics.getPerAZLatencyMetric({
              alb: alb,
              availabilityZone: az,
              label: azId,
              statistic: `TC(${latencyThresold}:)`,
              period: period
            });

            usingMetrics[`${azLetter}`] = targetResponseTime;
          });

          return new Alarm(
            scope,
            azLetter + "-latency-outlier-alarm",
            {
              alarmName:
                availabilityZoneId + '-' + alb.loadBalancerArn + '-latency-impact-outlier',
              actionsEnabled: false,
              metric: new MathExpression({
                expression: `(${azLetter}/(${Object.keys(usingMetrics).join("+")})) * 100`,
                usingMetrics: usingMetrics,
                label: availabilityZoneId,
                period: period,
              }),
              evaluationPeriods: evaluationPeriods,
              datapointsToAlarm: datapointsToAlarm,
              threshold: outlierThreshold,
              comparisonOperator: ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
              treatMissingData: TreatMissingData.IGNORE
            }
          );
      }
    }

    static generateLoadBalancerWidgets(
        albs: IApplicationLoadBalancer[],
        azMapper: AvailabilityZoneMapper,
        period: Duration,
        latencyStatistic: string,
        latencyThreshold: number,
        faultRateThreshold: number
      ): IWidget[] {
        let albWidgets: IWidget[] = [];

        latencyStatistic;
        latencyThreshold;
        faultRateThreshold;
    
        let successCountPerZone: {[key: string]: IMetric} = 
          ApplicationLoadBalancerMetrics.getTotalAlbSuccessCountPerZone(albs, period, azMapper);
        let faultCountPerZone: {[key: string]: IMetric} = 
          ApplicationLoadBalancerMetrics.getTotalAlbFaultCountPerZone(albs, period, azMapper);
        let processedBytesPerZone: {[key: string]: IMetric} = 
          ApplicationLoadBalancerMetrics.getTotalAlbProcessedBytesPerZone(albs, period, azMapper);
        let latencyPerZone: {[key: string]: IMetric} = 
          ApplicationLoadBalancerMetrics.getTotalAlbLatencyPerZone(albs, latencyStatistic, period, azMapper);
        let requestsPerZone: {[key: string]: IMetric} = 
          ApplicationLoadBalancerMetrics.getTotalAlbRequestsPerZone(albs, period, azMapper);  
        let faultRatePerZone: {[key: string]: IMetric} =
          ApplicationLoadBalancerMetrics.getTotalAlbFaultRatePerZone(albs, period, azMapper);  
        let weightedLatencyZScorePerZone: {[key: string]: IMetric} = 
          ApplicationLoadBalancerMetrics.getWeightedLatencyZScorePerZone(albs, latencyStatistic, period, azMapper);
    
        albWidgets.push(
          new GraphWidget({
            height: 8,
            width: 8,
            title: "Success Count",
            region: Aws.REGION,
            left: Object.values(successCountPerZone),
            leftYAxis: {
              min: 0,
              label: 'Count',
              showUnits: false,
            }
          })
        );
    
       albWidgets.push(
          new GraphWidget({
            height: 8,
            width: 8,
            title: "Target 5xx Count",
            region: Aws.REGION,
            left: Object.values(faultCountPerZone),
            leftYAxis: {
              min: 0,
              label: 'Count',
              showUnits: false,
            }
          })
        );

        albWidgets.push(
          new GraphWidget({
            height: 8,
            width: 8,
            title: "ELB 5xx Count",
            region: Aws.REGION,
            left: Object.values(this.getTotalAlb5xxCountPerZone(albs, period, azMapper)),
            leftYAxis: {
              min: 0,
              label: 'Count',
              showUnits: false,
            }
          })
        );
    
        albWidgets.push(
          new GraphWidget({
            height: 8,
            width: 8,
            title: "Request Count",
            region: Aws.REGION,
            left: Object.values(requestsPerZone),
            leftYAxis: {
              min: 0,
              label: 'Count',
              showUnits: false,
            }
          })
        );
    
        albWidgets.push(
          new GraphWidget({
            height: 8,
            width: 8,
            title: "Fault Rate",
            region: Aws.REGION,
            left: Object.values(faultRatePerZone),
            leftYAxis: {
              min: 0,
              label: 'Percent',
              showUnits: false,
            },
            leftAnnotations: [
              {
                label: "High Severity",
                value: faultRateThreshold,
                color: Color.RED
              }
            ]       
          })
        );
    
        albWidgets.push(
          new GraphWidget({
            height: 8,
            width: 8,
            title: "Processed Bytes",
            region: Aws.REGION,
            left: Object.values(processedBytesPerZone),
            leftYAxis: {
              min: 0,
              showUnits: false,
              label: 'Bytes'
            }
          })
        );
    
        albWidgets.push(
          new GraphWidget({
            height: 8,
            width: 8,
            title: `Target Response Time (${latencyStatistic})`,
            region: Aws.REGION,
            left: Object.values(latencyPerZone),
            leftYAxis: {
              min: 0,
              label: "Milliseconds",
              showUnits: false,
            },
            leftAnnotations: [
              {
                label: "High Severity",
                value: latencyThreshold,
                color: Color.RED
              }
            ]
          })
        );

        albWidgets.push(
          new GraphWidget({
            height: 8,
            width: 8,
            title: `Latency Z-Score (${latencyStatistic})`,
            region: Aws.REGION,
            left: Object.values(weightedLatencyZScorePerZone),
            leftYAxis: {
              min: 0,
              label: "Score",
              showUnits: false,
            },
            leftAnnotations: [
              {
                label: "High Severity",
                value: 3,
                color: Color.RED
              }
            ]
          })
        );

        albWidgets.push(
          new GraphWidget({
            height: 8,
            width: 8,
            title: "Anomalous Hosts",
            region: Aws.REGION,
            left: Object.values(this.getTotalAnomalousHostCountPerZone(albs, period, azMapper)),
            leftYAxis: {
              min: 0,
              label: "Count",
              showUnits: false,
            }
          })
        );

        albWidgets.push(
          new GraphWidget({
            height: 8,
            width: 8,
            title: "Mitigated Hosts",
            region: Aws.REGION,
            left: Object.values(this.getTotalMitigatedHostCountPerZone(albs, period, azMapper)),
            leftYAxis: {
              min: 0,
              label: "Count",
              showUnits: false,
            }
          })
        );
    
        return albWidgets;
      }
}
