// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { Duration } from "aws-cdk-lib";
import { ILoadBalancerV2 } from "aws-cdk-lib/aws-elasticloadbalancingv2";
import { IContributorInsightRuleDetails } from "./IContributorInsightRuleDetails";
import { IOperation } from "./IOperation";
import { IService } from "./IService";
import { IServiceMetricDetails } from "./IServiceMetricDetails";
import { ServiceProps } from "./props/ServiceProps";
import { AddCanaryTestProps } from "../canaries/props/AddCanaryTestProps";

/**
 * The representation of a service composed of multiple operations
 */
export class Service implements IService {
  /**
   * The name of your service
   */
  readonly serviceName: string;

  /**
   * The base endpoint for this service, like "https://www.example.com". Operation paths will be appended to this endpoint for canary testing the service.
   */
  readonly baseUrl: string;

  /**
   * The fault count threshold that indicates the service is unhealthy. This is an absolute value of faults
   * being produced by all critical operations in aggregate.
   */
  readonly faultCountThreshold: number;

  /**
   * A list of the Availability Zone names used by this application
   */
  readonly availabilityZoneNames: string[];

  /**
   * The period for which metrics for the service should be aggregated
   */
  readonly period: Duration;

  /**
   * The operations that are part of this service
   */
  readonly operations: IOperation[];

  /**
   * The load balancer this service sits behind
   *
   * @default - No load balancer metrics will be included in
   * dashboards and its ARN will not be added to top level AZ
   * alarm descriptions.
   */
  readonly loadBalancer?: ILoadBalancerV2;

  /**
   * Define these settings if you want to automatically add canary
   * tests to your operations. Operations can individually opt out
   * of canary test creation if you define this setting.
   *
   * @default - Automatic canary tests will not be created for
   * operations in this service.
   */
  readonly canaryTestProps?: AddCanaryTestProps;

  /**
   * The default settings that are used for availability metrics
   * for all operations unless specifically overridden in an
   * operation definition.
   */
  readonly defaultAvailabilityMetricDetails: IServiceMetricDetails;

  /**
   * The default settings that are used for availability metrics
   * for all operations unless specifically overridden in an
   * operation definition.
   */
  readonly defaultLatencyMetricDetails: IServiceMetricDetails;

  /**
   * The default settings that are used for contributor insight
   * rules.
   *
   * @default - No defaults are provided and must be specified per operation
   */
  readonly defaultContributorInsightRuleDetails?: IContributorInsightRuleDetails;

  constructor(props: ServiceProps) {
    this.serviceName = props.serviceName;
    this.availabilityZoneNames = props.availabilityZoneNames;
    this.baseUrl = props.baseUrl;
    this.faultCountThreshold = props.faultCountThreshold;
    this.operations = [];
    this.period = props.period;
    this.loadBalancer = props.loadBalancer;
    this.canaryTestProps = props.canaryTestProps;
    this.defaultAvailabilityMetricDetails =
      props.defaultAvailabilityMetricDetails;
    this.defaultLatencyMetricDetails = props.defaultLatencyMetricDetails;
    this.defaultContributorInsightRuleDetails =
      props.defaultContributorInsightRuleDetails;
  }

  /**
   * Adds an operation to this service and sets the operation's
   * service property
   */
  addOperation(operation: IOperation): void {
    this.operations.push(operation);
  }
}
