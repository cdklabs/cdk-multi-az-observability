// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { IFunction } from "aws-cdk-lib/aws-lambda";
import { ILogGroup } from "aws-cdk-lib/aws-logs";

export interface IOutlierDetectionFunction {
  /**
   * The outlier detection function
   */
  function: IFunction;

  /**
   * The log group where the function logs will be sent
   */
  logGroup: ILogGroup;
}
