// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
/**
 * The insight rule body to be included in a CfnInsightRule construct
 */
export class InsightRuleBody {
  /**
   * The value of Schema for a rule that analyzes CloudWatch Logs data must always be {"Name": "CloudWatchLogRule", "Version": 1}
   */
  schema: IRuleSchema;

  /**
   * An array of strings. For each element in the array, you can optionally use * at the end of a string to include all log groups with names that start with that prefix.
   */
  logGroupNames: string[];

  /**
   * Valid values are JSON and CLF.
   */
  logFormat: string;

  /**
   * Valid values are Count and Sum. Specifies whether to aggregate the report based on a count of occurrences or a sum of the values of the field that is specified in the ValueOf field.
   */
  aggregateOn: string;

  /**
   * This object includes a Keys array with as many as four members, optionally a single ValueOf, and optionally an array of as many as four Filters.
   */
  contribution: IContributionDefinition;

  constructor() {
    this.schema = {
      name: 'CloudWatchLogRule',
      version: 1,
    };
    this.aggregateOn = '';
    this.contribution = {
      keys: [] as string[],
    } as IContributionDefinition;
    this.logFormat = '';
    this.logGroupNames = [];
  }

  /**
   * Converts the rule to a JSON string
   * @returns
   */
  toJson(): string {
    let objectKeysToUpperCase = function (input: { [key: string]: any }): {
      [key: string]: any;
    } {
      if (typeof input !== 'object') return input;
      if (Array.isArray(input)) return input.map(objectKeysToUpperCase);
      return Object.keys(input).reduce(function (
        newObj: { [key: string]: any },
        key: string,
      ) {
        let val = input[key];
        let newVal =
          typeof val === 'object' && val !== null
            ? objectKeysToUpperCase(val)
            : val;
        let newKey: string = key.slice(0, 1).toUpperCase() + key.substring(1);
        newObj[newKey] = newVal;
        return newObj;
      }, {});
    };

    return JSON.stringify(objectKeysToUpperCase(this));
  }
}

export interface IRuleSchema {
  /**
   * The name of the rule schema, this should bre CloudWatchLogRule
   */
  readonly name: string;

  /**
   * The version number of the schema, this should be 1
   */
  readonly version: number;
}

export interface IContributionDefinition {
  /**
   * An array of up to four log fields that are used as dimensions to classify contributors.
   * If you enter more than one key, each unique combination of values for the keys is counted
   * as a unique contributor. The fields must be specified using JSON property format notation.
   */
  keys: string[];

  /**
   * (Optional) Specify this only when you are specifying Sum as the value of AggregateOn.
   * ValueOf specifies a log field with numerical values. In this type of rule, the contributors
   * are ranked by their sum of the value of this field, instead of their number of occurrences
   * in the log entries. For example, if you want to sort contributors by their total BytesSent
   * over a period, you would set ValueOf to BytesSent and specify Sum for AggregateOn. If this
   * value is not set, it must not be included in the JSON string representation of the rule body.
   */
  valueOf?: string;

  /**
   * (Optional) Specifies an array of as many as four filters to narrow the log events
   * that are included in the report. If you specify multiple filters, Contributor Insights
   * evaluates them with a logical AND operator. You can use this to filter out irrelevant
   * log events in your search or you can use it to select a single contributor to analyze their behavior.
   */
  filters?: { [key: string]: any }[];
}
