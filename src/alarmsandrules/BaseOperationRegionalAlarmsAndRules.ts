// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { IAlarm } from 'aws-cdk-lib/aws-cloudwatch';
import { Construct } from 'constructs';
import { AvailabilityAndLatencyAlarmsAndRules } from './AvailabilityAndLatencyAlarmsAndRules';
import { IBaseOperationRegionalAlarmsAndRules } from './IBaseOperationRegionalAlarmsAndRules';
import { BaseOperationRegionalAlarmsAndRulesProps } from './props/BaseOperationRegionalAlarmsAndRulesProps';

/**
 * Base operation regional alarms and rules
 */
export abstract class BaseOperationRegionalAlarmsAndRules
  extends Construct
  implements IBaseOperationRegionalAlarmsAndRules {
  /**
   * Availability alarm for this operation
   */
  availabilityAlarm: IAlarm;

  /**
   * Latency alarm for this operation
   */
  latencyAlarm: IAlarm;

  /**
   * Composite alarm for either availabiltiy or latency impact to this operation
   */
  availabilityOrLatencyAlarm: IAlarm;

  constructor(
    scope: Construct,
    id: string,
    props: BaseOperationRegionalAlarmsAndRulesProps,
  ) {
    super(scope, id);

    this.availabilityAlarm =
      AvailabilityAndLatencyAlarmsAndRules.createRegionalAvailabilityAlarm(
        this,
        props.availabilityMetricDetails,
        props.nameSuffix,
      );
    this.latencyAlarm =
      AvailabilityAndLatencyAlarmsAndRules.createRegionalLatencyAlarm(
        this,
        props.latencyMetricDetails,
        props.nameSuffix,
      );
    this.availabilityOrLatencyAlarm =
      AvailabilityAndLatencyAlarmsAndRules.createRegionalCustomerExperienceAlarm(
        this,
        props.availabilityMetricDetails.operationName,
        props.nameSuffix,
        this.availabilityAlarm,
        this.latencyAlarm,
      );
  }
}
