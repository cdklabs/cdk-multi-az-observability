// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

/**
 * The type of latency metric
 */
export enum LatencyMetricType {
  /**
   * Successful response latency
   */
  SUCCESS_LATENCY = 'Success_Latency',

  /**
   * Fault response latency
   */
  FAULT_LATENCY = 'Fault_Latency',

  /**
   * ALB target response time
   */
  TARGET_LATENCY = "TargetResponseTime"
}
