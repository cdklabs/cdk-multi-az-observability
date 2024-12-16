// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

/**
 * Provides the ability to get operation specific metric dimensions
 * for metrics at the regional level as well as Availability Zone level
 */
export class MetricDimensions {
  /**
   * The dimensions that are the same for all Availability Zones for example:
   * {
   *   "Operation": "ride",
   *   "Service": "WildRydes"
   * }
   */
  staticDimensions: { [key: string]: string };

  /**
   * The key used to specify an Availability Zone specific metric dimension, for
   * example: "AZ-ID"
   */
  availabilityZoneIdKey: string;

  /**
   * The key used for the Region in your dimensions, if you provide one.
   *
   * @default - A region specific key and value is not added to your
   * zonal and regional metric dimensions
   */
  regionKey?: string;

  constructor(
    staticDimensions: { [key: string]: string },
    availabilityZoneIdKey: string,
    regionKey?: string,
  ) {
    this.staticDimensions = staticDimensions;
    this.availabilityZoneIdKey = availabilityZoneIdKey;
    this.regionKey = regionKey;
  }

  /**
   * Gets the zonal dimensions for these metrics by combining the static
   * metric dimensions with the keys provided for Availability Zone and
   * optional Region, expected to return something like
   * {
   *   "Region": "us-east-1",
   *   "AZ-ID": "use1-az1",
   *   "Operation": "ride",
   *   "Service": "WildRydes"
   * }
   * @param availabilityZoneId
   * @param region
   */
  zonalDimensions(
    availabilityZoneId: string,
    region: string,
  ): { [key: string]: string } {
    let tmp: { [key: string]: string } = {};
    Object.assign(tmp, this.staticDimensions);
    tmp[this.availabilityZoneIdKey] = availabilityZoneId;

    if (this.regionKey !== undefined) {
      tmp[this.regionKey] = region;
    }

    return tmp;
  }

  /**
   * Gets the regional dimensions for these metrics by combining the static
   * metric dimensions with the keys provided the optional Region key,
   * expected to return something like
   * {
   *   "Region": "us-east-1",
   *   "Operation": "ride",
   *   "Service": "WildRydes"
   * }
   * @param region
   */
  regionalDimensions(region: string): { [key: string]: string } {
    let tmp: { [key: string]: string } = {};
    Object.assign(tmp, this.staticDimensions);

    if (this.regionKey !== undefined) {
      tmp[this.regionKey] = region;
    }

    return tmp;
  }
}
