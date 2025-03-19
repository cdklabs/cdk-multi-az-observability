// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { OperationAlarmsAndRulesProps } from './OperationAlarmsAndRulesProps';

/**
 * The base properties for an operation zonal alarms and rules configuration
 * TODO: Figure out if this and "OperationAlarmsAndRulesProps" should be related/inherited
 */
export interface BaseOperationZonalAlarmsAndRulesProps {

  /**
   * The operation alarm and rules props
   */
  readonly operationAlarmsAndRulesProps: OperationAlarmsAndRulesProps;

  /**
   * The Availability Zone the alarms and rules are being created for
   */
  readonly availabilityZone: string;

  /**
   * A counter used to name the CDK constructs uniquely
   */
  readonly counter: number;

  /**
   * (Optional) A suffix to apply to alarm and rules names, like "-server" for server
   * side metrics and alarms
   */
  readonly nameSuffix?: string;
}
