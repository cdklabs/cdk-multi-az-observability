// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { IFunction } from "aws-cdk-lib/aws-lambda";
import { ILogGroup } from "aws-cdk-lib/aws-logs";

export interface ICanaryFunction {
  function: IFunction;

  logGroup: ILogGroup;
}
