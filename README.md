![Build Workflow](https://github.com/cdklabs/cdk-multi-az-observability/actions/workflows/build.yml/badge.svg) ![Release Workflow](https://github.com/cdklabs/cdk-multi-az-observability/actions/workflows/release.yml/badge.svg) ![GitHub Release](https://img.shields.io/github/v/release/cdklabs/cdk-multi-az-observability?include_prereleases&sort=semver&logo=github&label=version)

# multi-az-observability
This is a CDK construct for multi-AZ observability to help detect single-AZ impairments. This is currently an `alpha` version, but is being used in the AWS [Advanced Multi-AZ Resilience Patterns](https://catalog.workshops.aws/multi-az-gray-failures/en-US) workshop.

There is a lot of available information to think through and combine to provide signals about single-AZ impact. To simplify the setup and use reasonable defaults, this construct (available in [TypeScript](https://www.npmjs.com/package/@cdklabs/multi-az-observability), [Go](https://github.com/cdklabs/cdk-multi-az-observability-go), [Python](https://pypi.org/project/cdklabs.multi-az-observability/), [.NET](https://www.nuget.org/packages/Cdklabs.MultiAZObservability), and [Java](https://central.sonatype.com/artifact/io.github.cdklabs/cdk-multi-az-observability)) sets up the necessary observability. To use the CDK construct, you first define your service like this:

```typescript
let service: IService = new Service({
    serviceName: 'test',
    availabilityZoneNames: vpc.availabilityZones,
    baseUrl: 'http://www.example.com',
    faultCountThreshold: 25,
    period: Duration.seconds(60),
    loadBalancer: loadBalancer,
    targetGroups: [ targetGroup1, targetGroup2 ],
    defaultAvailabilityMetricDetails: {
      metricNamespace: 'front-end/metrics',
      successMetricNames: ['Success'],
      faultMetricNames: ['Fault', 'Error'],
      alarmStatistic: 'Sum',
      unit: Unit.COUNT,
      period: Duration.seconds(60),
      evaluationPeriods: 5,
      datapointsToAlarm: 3,
      successAlarmThreshold: 99.9,
      faultAlarmThreshold: 0.1,
      graphedFaultStatistics: ['Sum'],
      graphedSuccessStatistics: ['Sum'],
    },
    defaultLatencyMetricDetails: {
      metricNamespace: 'front-end/metrics',
      successMetricNames: ['SuccessLatency'],
      faultMetricNames: ['FaultLatency'],
      alarmStatistic: 'p99',
      unit: Unit.MILLISECONDS,
      period: Duration.seconds(60),
      evaluationPeriods: 5,
      datapointsToAlarm: 3,
      successAlarmThreshold: Duration.millis(150),
      graphedFaultStatistics: ['p99'],
      graphedSuccessStatistics: ['p50', 'p99', 'tm99'],
    },
    defaultContributorInsightRuleDetails: {
      successLatencyMetricJsonPath: '$.SuccessLatency',
      faultMetricJsonPath: '$.Faults',
      operationNameJsonPath: '$.Operation',
      instanceIdJsonPath: '$.InstanceId',
      availabilityZoneIdJsonPath: '$.AZ-ID',
      logGroups: [logGroup],
    },
    canaryTestProps: {
      requestCount: 10,
      schedule: 'rate(1 minute)',
      loadBalancer: loadBalancer,
      networkConfiguration: {
        vpc: vpc,
        subnetSelection: { subnetType: SubnetType.PRIVATE_ISOLATED },
      },
    },
    minimumUnhealthyTargets: {
        percentage: 0.1
    }
  });

let rideOperation: Operation = {
    operationName: 'ride',
    service: service,
    path: '/ride',
    critical: true,
    httpMethods: ['GET'],
    serverSideContributorInsightRuleDetails: {
      logGroups: [logGroup],
      successLatencyMetricJsonPath: '$.SuccessLatency',
      faultMetricJsonPath: '$.Faults',
      operationNameJsonPath: '$.Operation',
      instanceIdJsonPath: '$.InstanceId',
      availabilityZoneIdJsonPath: '$.AZ-ID',
    },
    serverSideAvailabilityMetricDetails: new OperationAvailabilityMetricDetails(
      {
        operationName: 'ride',
        metricDimensions: new MetricDimensions(
          { Operation: 'ride' },
          'AZ-ID',
          'Region',
        ),
      },
      service.defaultAvailabilityMetricDetails,
    ),
    serverSideLatencyMetricDetails: new OperationLatencyMetricDetails(
      {
        operationName: 'ride',
        metricDimensions: new MetricDimensions(
          { Operation: 'ride' },
          'AZ-ID',
          'Region',
        ),
      },
      service.defaultLatencyMetricDetails,
    ),
};

let payOperation: Operation = {
    operationName: 'pay',
    service: service,
    path: '/pay',
    critical: true,
    httpMethods: ['GET'],
    serverSideContributorInsightRuleDetails: {
      logGroups: [logGroup],
      successLatencyMetricJsonPath: '$.SuccessLatency',
      faultMetricJsonPath: '$.Faults',
      operationNameJsonPath: '$.Operation',
      instanceIdJsonPath: '$.InstanceId',
      availabilityZoneIdJsonPath: '$.AZ-ID',
    },
    serverSideAvailabilityMetricDetails: new OperationAvailabilityMetricDetails(
      {
        operationName: 'pay',
        metricDimensions: new MetricDimensions(
          { Operation: 'ride' },
          'AZ-ID',
          'Region',
        ),
      },
      service.defaultAvailabilityMetricDetails,
    ),
    serverSideLatencyMetricDetails: new OperationLatencyMetricDetails(
      {
        operationName: 'pay',
        metricDimensions: new MetricDimensions(
          { Operation: 'ride' },
          'AZ-ID',
          'Region',
        ),
      },
      service.defaultLatencyMetricDetails,
    ),
};

service.addOperation(rideOperation);
service.addOperation(payOperation);
```

Then you provide that service definition to the CDK construct.

```typescript
new InstrumentedServiceMultiAZObservability(stack, 'MAZObservability', {
    createDashboards: true,
    service: service,
    interval: Duration.minutes(60)
});
```

You define some characteristics of the service, default values for metrics and alarms, and then add operations as well as any overrides for default values that you need. The construct can also automatically create synthetic canaries that test each operation with a very simple HTTP check, or you can configure your own synthetics and just tell the construct about the metric details and optionally log files. This creates metrics, alarms, and dashboards that can be used to detect single-AZ impact. You can access these alarms from the `multiAvailabilityZoneObservability` object and use them in your CDK project to start automation, send SNS notifications, or incorporate in your own dashboards.

If you don't have service specific logs and custom metrics with per-AZ dimensions, you can still use the construct to evaluate ALB and/or NAT Gateway metrics to find single AZ impairments.

```typescript
new BasicServiceMultiAZObservability(stack, 'MAZObservability', {
    applicationLoadBalancerProps: {
      albTargetGroupMap: [
        {
          applicationLoadBalancer: new ApplicationLoadBalancer(stack, 'alb', {
            vpc: vpc,
            crossZoneEnabled: true,
          }),
          targetGroups: [
            targetGroup1,
            targetGroup2
          ]
        }
      ],
      faultCountPercentThreshold: 1,
      latencyStatistic: Stats.percentile(99),
      latencyThreshold: Duration.millis(200),
      latencyOutlierAlgorithm: ApplicationLoadBalancerLatencyOutlierAlgorithm.STATIC,
      latencyOutlierThreshold: 45
    },
    natGatewayProps: {
       natGateways: {
            "us-east-1a": [ natGateway1 ],
            "us-east-1b": [ natGateway2 ],
            "us-east-1c": [ natGateway3 ],
        }
        packetLossPercentThreshold: 0.01,
    },
    serviceName: 'test',
    period: cdk.Duration.seconds(60),
    createDashboard: true,
    evaluationPeriods: 5,
    datapointsToAlarm: 3,
});
```

If you provide a load balancer, the construct assumes it is deployed in each AZ of the VPC the load balancer is associated with and will look for HTTP metrics using those AZs as dimensions.

Both options support running workloads on EC2, ECS, Lambda, and EKS.