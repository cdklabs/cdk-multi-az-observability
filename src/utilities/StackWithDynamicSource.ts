// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import {
  CfnParameter,
  NestedStack,
  NestedStackProps,
  Stack,
} from 'aws-cdk-lib';
import { Construct, IConstruct } from 'constructs';

export interface NestedStackWithDynamicSourceProps extends NestedStackProps {
  assetsBucketsParameterName?: string;
  assetsBucketPrefixParameterName?: string;
}

/**
 * If you are using a dynamic location for assets and pass those as a variable
 * in your top stack, this allows you to continue passing those down
 */
export class StackWithDynamicSource extends NestedStack {
  private static updateBaseParams(
    scope: IConstruct,
    props: NestedStackWithDynamicSourceProps,
  ): NestedStackProps {
    if (props.assetsBucketsParameterName !== undefined) {
      let currentNode: IConstruct | undefined = scope;

      while (currentNode !== undefined && !(currentNode instanceof Stack)) {
        currentNode = currentNode.node.scope;
      }

      if (currentNode !== undefined) {
        let assetsBucket: IConstruct | undefined = (
          currentNode as Stack
        ).node.tryFindChild(props.assetsBucketsParameterName);

        if (
          assetsBucket !== undefined &&
          assetsBucket instanceof CfnParameter
        ) {
          if (props.parameters === undefined) {
            let tmp: NestedStackProps = {
              parameters: {},
              timeout: props.timeout,
              notificationArns: props.notificationArns,
              removalPolicy: props.removalPolicy,
              description: props.description,
            };

            if (tmp.parameters !== undefined) {
              tmp.parameters[props.assetsBucketsParameterName] =
                assetsBucket.valueAsString;

              if (props.assetsBucketPrefixParameterName !== undefined) {
                let assetsBucketPrefix: IConstruct | undefined = (
                  currentNode as Stack
                ).node.tryFindChild(props.assetsBucketPrefixParameterName);
                if (
                  assetsBucketPrefix !== undefined &&
                  assetsBucketPrefix instanceof CfnParameter
                ) {
                  tmp.parameters[props.assetsBucketPrefixParameterName] =
                    assetsBucketPrefix.valueAsString;
                }
              }
            }

            return tmp;
          } else {
            props.parameters[props.assetsBucketsParameterName] =
              assetsBucket.valueAsString;

            if (props.assetsBucketPrefixParameterName !== undefined) {
              let assetsBucketPrefix: IConstruct | undefined = (
                currentNode as Stack
              ).node.tryFindChild(props.assetsBucketPrefixParameterName);

              if (
                assetsBucketPrefix !== undefined &&
                assetsBucketPrefix instanceof CfnParameter
              ) {
                props.parameters[props.assetsBucketPrefixParameterName] =
                  assetsBucketPrefix.valueAsString;
              }
            }
          }
        }
      }
    }

    return props as NestedStackProps;
  }

  constructor(
    scope: Construct,
    id: string,
    props: NestedStackWithDynamicSourceProps,
  ) {
    super(scope, id, StackWithDynamicSource.updateBaseParams(scope, props));

    let currentNode: IConstruct | undefined = this;

    while (currentNode !== undefined && !(currentNode instanceof Stack)) {
      currentNode = currentNode.node.scope;
    }

    if (currentNode !== undefined) {
      if (props.assetsBucketsParameterName !== undefined) {
        new CfnParameter(currentNode, props.assetsBucketsParameterName, {
          type: 'String',
        });
      }

      if (props.assetsBucketPrefixParameterName !== undefined) {
        new CfnParameter(currentNode, props.assetsBucketPrefixParameterName, {
          type: 'String',
        });
      }
    }
  }
}
