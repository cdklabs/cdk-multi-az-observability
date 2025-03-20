// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { Duration, NestedStack } from 'aws-cdk-lib';
import { Dashboard, IAlarm } from 'aws-cdk-lib/aws-cloudwatch';
import { IFunction } from 'aws-cdk-lib/aws-lambda';
import { ILogGroup } from 'aws-cdk-lib/aws-logs';
import { Construct, IConstruct } from 'constructs';
import { CanaryMetrics } from './CanaryMetrics';
import { IInstrumentedServiceMultiAZObservability } from './IInstrumentedServiceMultiAZObservability';
import { IOperation } from './IOperation';
import { IOperationMetricDetails } from './IOperationMetricDetails';
import { Operation } from './Operation';
import { OperationMetricDetails } from './OperationMetricDetails';
import { InstrumentedServiceMultiAZObservabilityProps } from './props/InstrumentedServiceMultiAZObservabilityProps';
import { MetricDimensions } from './props/MetricDimensions';
import { IOperationAlarmsAndRules } from '../alarmsandrules/IOperationAlarmsAndRules';
import { IServiceAlarmsAndRules } from '../alarmsandrules/IServiceAlarmsAndRules';
import { OperationAlarmsAndRules } from '../alarmsandrules/OperationAlarmsAndRules';
import { ServiceAlarmsAndRules } from '../alarmsandrules/ServiceAlarmsAndRules';
import { AvailabilityZoneMapper } from '../azmapper/AvailabilityZoneMapper';
import { CanaryFunction } from '../canaries/CanaryFunction';
import { CanaryTest } from '../canaries/CanaryTest';
import { AddCanaryTestProps } from '../canaries/props/AddCanaryTestProps';
import { OperationAvailabilityAndLatencyDashboard } from '../dashboards/OperationAvailabilityAndLatencyDashboard';
import { ServiceAvailabilityAndLatencyDashboard } from '../dashboards/ServiceAvailabilityAndLatencyDashboard';
import { OutlierDetectionFunction } from '../outlier-detection/OutlierDetectionFunction';
import { OutlierDetectionAlgorithm } from '../utilities/OutlierDetectionAlgorithm';
import { StackWithDynamicSource } from '../utilities/StackWithDynamicSource';

/**
 * An service that implements its own instrumentation to record
 * availability and latency metrics that can be used to create
 * alarms, rules, and dashboards from
 */
export class InstrumentedServiceMultiAZObservability
  extends Construct
  implements IInstrumentedServiceMultiAZObservability {
  /**
   * Key represents the operation name and the value is the set
   * of zonal alarms and rules for that operation. The values themselves
   * are dictionaries that have a key for each AZ ID.
   */
  private readonly perOperationAlarmsAndRules: {
    [key: string]: IOperationAlarmsAndRules;
  };

  /**
   * Index into the dictionary by operation name, then by Availability Zone Id
   * to get the alarms that indicate an AZ shows isolated impact from availability
   * or latency as seen by either the server-side or canary. These are the alarms
   * you would want to use to trigger automation to evacuate an AZ.
   */
  readonly perOperationZonalImpactAlarms: {
    [key: string]: { [key: string]: IAlarm };
  };

  /**
   * The alarms and rules for the overall service
   */
  readonly serviceAlarms: IServiceAlarmsAndRules;

  /**
   * The dashboards for each operation
   */
  readonly operationDashboards?: Dashboard[];

  /**
   * The service level dashboard
   */
  readonly serviceDashboard?: Dashboard;

  /**
   * The AZ mapper custom resource used to map AZ Ids to Names and vice a versa
   */
  private readonly azMapper: AvailabilityZoneMapper;

  /**
   * If the service is configured to have canary tests created, this will
   * be the log group where the canary's logs are stored.
   *
   * @default - No log group is created if the canary is not requested.
   */
  readonly canaryLogGroup?: ILogGroup;

  /**
   * The Lambda function that performs the outlier detection calculation
   */
  private readonly outlierDetectionFunction?: IFunction;

  /**
   * Sets up the canary testing function and test
   * events
   * @param scope 
   * @param props 
   */
  private setupCanaryTests(
    scope: IConstruct,
    props: InstrumentedServiceMultiAZObservabilityProps,
  ) : void {


    let canary = new CanaryFunction(scope, 'CanaryFunction', {
      vpc: props.service.canaryTestProps!.networkConfiguration?.vpc,
      subnetSelection:
       props.service.canaryTestProps!.networkConfiguration?.subnetSelection,
      httpTimeout: props.service.canaryTestProps!.timeout
        ? props.service.canaryTestProps!.timeout
        : Duration.seconds(2),
      ignoreTlsErrors: props.service.canaryTestProps!.ignoreTlsErrors
        ? props.service.canaryTestProps!.ignoreTlsErrors
        : false,
    });

    props.service.operations.forEach((operation: IOperation, index: number) => {
      if (operation.optOutOfServiceCreatedCanary != true) {
        let testProps: AddCanaryTestProps = operation.canaryTestProps
          ? operation.canaryTestProps
          : (props.service.canaryTestProps as AddCanaryTestProps);

        let nestedStack: NestedStack = new NestedStack(
          this,
          operation.operationName + 'CanaryTest',
          {},
        );

        let test = new CanaryTest(nestedStack, operation.operationName, {
          function: canary.function,
          requestCount: testProps.requestCount,
          regionalRequestCount: testProps.regionalRequestCount
            ? testProps.regionalRequestCount
            : testProps.requestCount,
          schedule: testProps.schedule,
          operation: operation,
          loadBalancer: testProps.loadBalancer,
          headers: testProps.headers,
          postData: testProps.postData,
          azMapper: this.azMapper,
        });

        let defaultAvailabilityMetricDetails: IOperationMetricDetails;
        let defaultLatencyMetricDetails: IOperationMetricDetails;

        if (operation.canaryMetricDetails?.canaryAvailabilityMetricDetails) {
          defaultAvailabilityMetricDetails = new OperationMetricDetails(
            {
              operationName: operation.operationName,
              metricDimensions: new MetricDimensions(
                { Operation: operation.operationName },
                'AZ-ID',
                'Region',
              ),
              alarmStatistic:
                operation.canaryMetricDetails.canaryAvailabilityMetricDetails
                  .alarmStatistic,
              datapointsToAlarm:
                operation.canaryMetricDetails.canaryAvailabilityMetricDetails
                  .datapointsToAlarm,
              evaluationPeriods:
                operation.canaryMetricDetails.canaryAvailabilityMetricDetails
                  .evaluationPeriods,
              faultAlarmThreshold:
                operation.canaryMetricDetails.canaryAvailabilityMetricDetails
                  .faultAlarmThreshold,
              faultMetricNames:
                operation.canaryMetricDetails.canaryAvailabilityMetricDetails
                  .faultMetricNames,
              graphedFaultStatistics:
                operation.canaryMetricDetails.canaryAvailabilityMetricDetails
                  .graphedFaultStatistics,
              graphedSuccessStatistics:
                operation.canaryMetricDetails.canaryAvailabilityMetricDetails
                  .graphedSuccessStatistics,
              metricNamespace:
                operation.canaryMetricDetails.canaryAvailabilityMetricDetails
                  .metricNamespace,
              period:
                operation.canaryMetricDetails.canaryAvailabilityMetricDetails
                  .period,
              successAlarmThreshold:
                operation.canaryMetricDetails.canaryAvailabilityMetricDetails
                  .successAlarmThreshold,
              successMetricNames:
                operation.canaryMetricDetails.canaryAvailabilityMetricDetails
                  .successMetricNames,
              unit: operation.canaryMetricDetails
                .canaryAvailabilityMetricDetails.unit,
            },
            operation.service.defaultAvailabilityMetricDetails,
          );
        } else if (operation.canaryTestAvailabilityMetricsOverride) {
          defaultAvailabilityMetricDetails = new OperationMetricDetails(
            {
              operationName: operation.operationName,
              metricNamespace: test.metricNamespace,
              successMetricNames: ['Success'],
              faultMetricNames: ['Fault', 'Failure'],
              metricDimensions: new MetricDimensions(
                { Operation: operation.operationName },
                'AZ-ID',
                'Region',
              ),

              alarmStatistic:
                operation.canaryTestAvailabilityMetricsOverride
                  .alarmStatistic,
              datapointsToAlarm:
                operation.canaryTestAvailabilityMetricsOverride
                  .datapointsToAlarm,
              evaluationPeriods:
                operation.canaryTestAvailabilityMetricsOverride
                  .evaluationPeriods,
              faultAlarmThreshold:
                operation.canaryTestAvailabilityMetricsOverride
                  .faultAlarmThreshold,
              period: operation.canaryTestAvailabilityMetricsOverride.period,
              successAlarmThreshold:
                operation.canaryTestAvailabilityMetricsOverride
                  .successAlarmThreshold,
            },
            props.service.defaultAvailabilityMetricDetails,
          );
        } else {
          defaultAvailabilityMetricDetails = new OperationMetricDetails(
            {
              operationName: operation.operationName,
              metricNamespace: test.metricNamespace,
              successMetricNames: ['Success'],
              faultMetricNames: ['Fault', 'Failure'],
              metricDimensions: new MetricDimensions(
                { Operation: operation.operationName },
                'AZ-ID',
                'Region',
              ),
            },
            props.service.defaultAvailabilityMetricDetails,
          );
        }

        if (operation.canaryMetricDetails?.canaryLatencyMetricDetails) {
          defaultLatencyMetricDetails = new OperationMetricDetails(
            {
              operationName: operation.operationName,
              metricDimensions: new MetricDimensions(
                { Operation: operation.operationName },
                'AZ-ID',
                'Region',
              ),
              alarmStatistic:
                operation.canaryMetricDetails.canaryLatencyMetricDetails
                  .alarmStatistic,
              datapointsToAlarm:
                operation.canaryMetricDetails.canaryLatencyMetricDetails
                  .datapointsToAlarm,
              evaluationPeriods:
                operation.canaryMetricDetails.canaryLatencyMetricDetails
                  .evaluationPeriods,
              faultAlarmThreshold:
                operation.canaryMetricDetails.canaryLatencyMetricDetails
                  .faultAlarmThreshold,
              faultMetricNames:
                operation.canaryMetricDetails.canaryLatencyMetricDetails
                  .faultMetricNames,
              graphedFaultStatistics:
                operation.canaryMetricDetails.canaryLatencyMetricDetails
                  .graphedFaultStatistics,
              graphedSuccessStatistics:
                operation.canaryMetricDetails.canaryLatencyMetricDetails
                  .graphedSuccessStatistics,
              metricNamespace:
                operation.canaryMetricDetails.canaryLatencyMetricDetails
                  .metricNamespace,
              period:
                operation.canaryMetricDetails.canaryLatencyMetricDetails
                  .period,
              successAlarmThreshold:
                operation.canaryMetricDetails.canaryLatencyMetricDetails
                  .successAlarmThreshold,
              successMetricNames:
                operation.canaryMetricDetails.canaryLatencyMetricDetails
                  .successMetricNames,
              unit: operation.canaryMetricDetails.canaryLatencyMetricDetails
                .unit,
            },
            operation.service.defaultLatencyMetricDetails,
          );
        } else if (operation.canaryTestLatencyMetricsOverride) {
          defaultLatencyMetricDetails = new OperationMetricDetails(
            {
              operationName: operation.operationName,
              metricNamespace: test.metricNamespace,
              successMetricNames: ['SuccessLatency'],
              faultMetricNames: ['FaultLatency'],
              metricDimensions: new MetricDimensions(
                { Operation: operation.operationName },
                'AZ-ID',
                'Region',
              ),

              alarmStatistic:
                operation.canaryTestLatencyMetricsOverride.alarmStatistic,
              datapointsToAlarm:
                operation.canaryTestLatencyMetricsOverride.datapointsToAlarm,
              evaluationPeriods:
                operation.canaryTestLatencyMetricsOverride.evaluationPeriods,
              faultAlarmThreshold:
                operation.canaryTestLatencyMetricsOverride
                  .faultAlarmThreshold,
              period: operation.canaryTestLatencyMetricsOverride.period,
              successAlarmThreshold:
                operation.canaryTestLatencyMetricsOverride
                  .successAlarmThreshold,
            },
            props.service.defaultLatencyMetricDetails,
          );
        } else {
          defaultLatencyMetricDetails = new OperationMetricDetails(
            {
              operationName: operation.operationName,
              metricNamespace: test.metricNamespace,
              successMetricNames: ['SuccessLatency'],
              faultMetricNames: ['FaultLatency'],
              metricDimensions: new MetricDimensions(
                { Operation: operation.operationName },
                'AZ-ID',
                'Region',
              ),
            },
            props.service.defaultLatencyMetricDetails,
          );
        }

        let newOperation = new Operation({
          serverSideAvailabilityMetricDetails:
            operation.serverSideAvailabilityMetricDetails,
          serverSideLatencyMetricDetails:
            operation.serverSideLatencyMetricDetails,
          serverSideContributorInsightRuleDetails:
            operation.serverSideContributorInsightRuleDetails,
          service: operation.service,
          operationName: operation.operationName,
          path: operation.path,
          critical: operation.critical,
          httpMethods: operation.httpMethods,
          canaryMetricDetails: new CanaryMetrics({
            canaryAvailabilityMetricDetails: defaultAvailabilityMetricDetails,
            canaryLatencyMetricDetails: defaultLatencyMetricDetails,
          }),
        });

        props.service.operations[index] = newOperation;
      }
    });
  }

  constructor(
    scope: Construct,
    id: string,
    props: InstrumentedServiceMultiAZObservabilityProps,
  ) {
    super(scope, id);

    let outlierThreshold: number;

    // Set defaults
    if (!props.outlierThreshold) {
      switch (props.outlierDetectionAlgorithm) {
        case OutlierDetectionAlgorithm.CHI_SQUARED:
          outlierThreshold = 0.05;
          break;
        case OutlierDetectionAlgorithm.IQR:
          outlierThreshold = 1.5;
          break;
        case OutlierDetectionAlgorithm.MAD:
          outlierThreshold = 3;
          break;
        case OutlierDetectionAlgorithm.STATIC:
          outlierThreshold = 0.7;
          break;
        case OutlierDetectionAlgorithm.Z_SCORE:
          outlierThreshold = 2;
          break;
      }
    } else {
      outlierThreshold = props.outlierThreshold;
    }

    // Create the AZ mapper resource that all of the resources
    // will share
    this.azMapper = new AvailabilityZoneMapper(this, 'AZMapper', {
      availabilityZoneNames: props.service.availabilityZoneNames,
    });

    // Create the canary testing stack if the user provided input
    if (props.service.canaryTestProps) {
      let canaryStack: StackWithDynamicSource = new StackWithDynamicSource(
        this,
        'Canary',
        {
          assetsBucketsParameterName: props.assetsBucketParameterName,
          assetsBucketPrefixParameterName:
            props.assetsBucketPrefixParameterName,
        },
      );

      this.setupCanaryTests(canaryStack, props);
    }

    // Create the outlier detection lambda function stack if we're not
    // using static outlier detection
    if (props.outlierDetectionAlgorithm != OutlierDetectionAlgorithm.STATIC) {
      let outlierDetectionStack: StackWithDynamicSource =
        new StackWithDynamicSource(this, 'OutlierDetectionStack', {
          assetsBucketsParameterName: props.assetsBucketParameterName,
          assetsBucketPrefixParameterName:
            props.assetsBucketPrefixParameterName,
        });
  
      this.outlierDetectionFunction = new OutlierDetectionFunction(
        outlierDetectionStack,
        'OutlierDetectionFunction',
        {},
      ).function;
    }

    // Create the per operation alarms and contributor insight rules
    this.perOperationAlarmsAndRules = Object.fromEntries(
      props.service.operations.map((operation: IOperation) => {
        let nestedStack: NestedStack = new NestedStack(
          this,
          operation.operationName + 'OperationAlarmsAndRulesNestedStack',
        );

        return [
          operation.operationName,
          new OperationAlarmsAndRules(nestedStack, operation.operationName, {
            operation: operation,
            latencyOutlierDetectionAlgorithm: props.outlierDetectionAlgorithm,
            availabilityOutlierDetectionAlgorithm: props.outlierDetectionAlgorithm,
            latencyOutlierThreshold: outlierThreshold,
            availabilityOutlierThreshold: outlierThreshold,
            loadBalancer: props.service.loadBalancer,
            azMapper: this.azMapper,
            outlierDetectionFunction: this.outlierDetectionFunction,
          }),
        ];
      }),
    );

    this.perOperationZonalImpactAlarms = Object.fromEntries(
      Object.entries(this.perOperationAlarmsAndRules).map(([key, value]) => {
        return [key, value.aggregateZonalAlarmsMap];
      }),
    );

    let serviceAlarmsStack: NestedStack = new NestedStack(
      this,
      'ServiceAlarmsNestedStack',
    );

    this.serviceAlarms = new ServiceAlarmsAndRules(
      serviceAlarmsStack,
      props.service.serviceName,
      {
        perOperationAlarmsAndRules: this.perOperationAlarmsAndRules,
        service: props.service,
        azMapper: this.azMapper,
      },
    );

    if (props.createDashboards) {
      this.operationDashboards = [];

      props.service.operations.forEach((x) => {
        let dashboardStack: NestedStack = new NestedStack(
          this,
          x.operationName + 'Dashboard',
          {},
        );

        this.operationDashboards!.push(
          new OperationAvailabilityAndLatencyDashboard(
            dashboardStack,
            x.operationName,
            {
              operationAlarmsAndRules: this.perOperationAlarmsAndRules[x.operationName],
              azMapper: this.azMapper,
              interval: props.interval
                ? props.interval
                : Duration.minutes(60),
            },
          ).dashboard,
        );
      });

      let dashboardStack: NestedStack = new NestedStack(
        this,
        'ServiceDashboard',
        {},
      );

      // TOOD: Revamp service level dashboard and rethink alarms
      this.serviceDashboard = new ServiceAvailabilityAndLatencyDashboard(
        dashboardStack,
        props.service.serviceName.toLowerCase(),
        {
          interval: props.interval ? props.interval : Duration.minutes(60),
          service: props.service,
          aggregateRegionalAlarm:
            this.serviceAlarms.regionalFaultCountServerSideAlarm,
          zonalAggregateAlarms:
            this.serviceAlarms.zonalAggregateIsolatedImpactAlarms,
          azMapper: this.azMapper,
          operationsDashboard: this.operationDashboards
        },
      ).dashboard;
    }
  }
}
