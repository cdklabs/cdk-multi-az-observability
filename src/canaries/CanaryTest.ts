// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { IRule, Rule, RuleTargetInput, Schedule } from 'aws-cdk-lib/aws-events';
import { LambdaFunction } from 'aws-cdk-lib/aws-events-targets';
import { Construct } from 'constructs';
import { CanaryTestProps } from './props/CanaryTestProps';
import { Aws } from 'aws-cdk-lib';

export class CanaryTest extends Construct {
  timedEventRules: { [key: string]: IRule };

  metricNamespace: string;

  constructor(scope: Construct, id: string, props: CanaryTestProps) {
    super(scope, id);
    this.timedEventRules = {};

    this.metricNamespace = props.operation.canaryMetricDetails
      ? props.operation.canaryMetricDetails.canaryAvailabilityMetricDetails
        .metricNamespace
      : 'canary/metrics';

    props.operation.service.availabilityZoneNames.forEach(
      (availabilityZoneName, index) => {
        let availabilityZoneId: string =
          props.azMapper.availabilityZoneIdFromAvailabilityZoneLetter(
            availabilityZoneName.substring(availabilityZoneName.length - 1),
          );

        let scheme: string = props.operation.service.baseUrl.split(':')[0];
        let url: string =
          scheme +
          '://' +
          availabilityZoneName +
          '.' +
          props.loadBalancer.loadBalancerDnsName +
          props.operation.path;

        let data: { [key: string]: any } = {
          parameters: {
            methods:
              props.httpMethods !== undefined
                ? props.httpMethods
                : props.operation.httpMethods,
            url: url,
            postData: props.postData === undefined ? '' : props.postData,
            headers: props.headers === undefined ? {} : props.headers,
            operation: props.operation.operationName,
            faultBoundaryId: availabilityZoneId,
            faultBoundary: 'az',
            metricNamespace: this.metricNamespace,
            requestCount: props.requestCount,
          },
        };

        this.timedEventRules[availabilityZoneId] = new Rule(
          this,
          'AZ' + index + props.operation.operationName + 'TimedEvent',
          {
            schedule: Schedule.expression(props.schedule),
            enabled: true,
            targets: [
              new LambdaFunction(props.function, {
                event: RuleTargetInput.fromObject(data),
              }),
            ],
          },
        );
      },
    );

    let scheme: string = props.operation.service.baseUrl.split(':')[0];
    let url: string =
      scheme +
      '://' +
      props.loadBalancer.loadBalancerDnsName +
      props.operation.path;

    let data: { [key: string]: any } = {
      parameters: {
        methods:
          props.httpMethods !== undefined
            ? props.httpMethods
            : props.operation.httpMethods,
        url: url,
        postData: props.postData === undefined ? '' : props.postData,
        headers: props.headers === undefined ? {} : props.headers,
        operation: props.operation.operationName,
        faultBoundaryId:Aws.REGION,
        faultBoundary: 'region',
        metricNamespace: this.metricNamespace,
        requestCount: props.regionalRequestCount,
      },
    };

    this.timedEventRules[Aws.REGION] = new Rule(
      this,
      'RegionalTimedEvent',
      {
        schedule: Schedule.expression(props.schedule),
        enabled: true,
        targets: [
          new LambdaFunction(props.function, {
            event: RuleTargetInput.fromObject(data),
          }),
        ],
      },
    );
  }
}
