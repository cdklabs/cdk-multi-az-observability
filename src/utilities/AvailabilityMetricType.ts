// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

/**
 * Different availability metric types
 */
export enum AvailabilityMetricType {
  /**
   * The success rate, i.e. (successful responses) / (successful + fault responses) * 100
   */
  SUCCESS_RATE = "Success_Rate",

  /**
   * The number of success responses as an absolute value
   */
  SUCCESS_COUNT = "Success_Count",

  /**
   * The fault rate, i.e. (fault responses) / (successful + fault responses) * 100
   */
  FAULT_RATE = "Fault_Rate",

  /**
   * The number of fault responses as an absolute value
   */
  FAULT_COUNT = "Fault_Count",

  /**
   * The number of requests received that resulted in either a fault or success. This
   * does not include "error" responses that would be equivalent to 4xx responses.
   */
  REQUEST_COUNT = "Request_Count",
}
