// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { Duration } from 'aws-cdk-lib';
import { OutlierDetectionAlgorithm } from '../../utilities/OutlierDetectionAlgorithm';
import { IService } from '../IService';

/**
 * The properties for adding alarms and dashboards
 * for an instrumented service.
 */
export interface InstrumentedServiceMultiAZObservabilityProps {
  /**
   * The service that the alarms and dashboards are being crated for.
   */
  readonly service: IService;

  /**
   * Indicates whether to create per operation and overall service
   * dashboards.
   *
   * @default - No dashboards are created
   */
  readonly createDashboards?: boolean;

  /**
   * The outlier threshold for determining if an AZ is an
   * outlier for latency or faults. This number is interpreted
   * differently for different outlier algorithms. When used with
   * STATIC, the number should be between 0 and 1 to represent the
   * percentage of errors (like .7) that an AZ must be responsible
   * for to be considered an outlier. When used with CHI_SQUARED, it
   * represents the p value that indicates statistical significance, like
   * 0.05 which means the skew has less than or equal to a 5% chance of
   * occuring. When used with Z_SCORE it indicates how many standard
   * deviations to evaluate for an AZ being an outlier, typically 3 is
   * standard for Z_SCORE.
   *
   * Standard defaults based on the outlier detection algorithm:
   * STATIC: 0.7
   * CHI_SQUARED: 0.05
   * Z_SCORE: 3
   * IQR: 1.5
   * MAD: 3
   *
   * @default - Depends on the outlier detection algorithm selected
   */
  readonly outlierThreshold?: number;

  /**
   * The algorithm to use for performing outlier detection
   */
  readonly outlierDetectionAlgorithm: OutlierDetectionAlgorithm;

  /**
   * The interval used in the dashboard, defaults to
   * 60 minutes.
   *
   * @default - 60 minutes
   */
  readonly interval?: Duration;

  /**
   * If you are not using a static bucket to deploy assets, for example
   * you are synthing this and it gets uploaded to a bucket whose name
   * is unknown to you (maybe used as part of a central CI/CD system)
   * and is provided as a parameter to your stack, specify that parameter
   * name here. It will override the bucket location CDK provides by
   * default for bundled assets. The stack containing this contruct needs
   * to have a parameter defined that uses this name. The underlying
   * stacks in this construct that deploy assets will copy the parent stack's
   * value for this property.
   *
   * @default - The assets will be uploaded to the default defined
   * asset location.
   */
  readonly assetsBucketParameterName?: string;

  /**
   * If you are not using a static bucket to deploy assets, for example
   * you are synthing this and it gets uploaded to a bucket that uses a prefix
   * that is unknown to you (maybe used as part of a central CI/CD system)
   * and is provided as a parameter to your stack, specify that parameter
   * name here. It will override the bucket prefix CDK provides by
   * default for bundled assets. This property only takes effect if you
   * defined the assetsBucketParameterName. The stack containing this contruct needs
   * to have a parameter defined that uses this name. The underlying
   * stacks in this construct that deploy assets will copy the parent stack's
   * value for this property.
   *
   * @default - No object prefix will be added to your custom assets location.
   * However, if you have overridden something like the 'BucketPrefix' property
   * in your stack synthesizer with a variable like "${AssetsBucketPrefix",
   * you will need to define this property so it doesn't cause a reference error
   * even if the prefix value is blank.
   */
  readonly assetsBucketPrefixParameterName?: string;
}
