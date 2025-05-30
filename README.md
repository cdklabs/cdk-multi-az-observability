![Build Workflow](https://github.com/cdklabs/cdk-multi-az-observability/actions/workflows/build.yml/badge.svg) ![Release Workflow](https://github.com/cdklabs/cdk-multi-az-observability/actions/workflows/release.yml/badge.svg) ![GitHub Release](https://img.shields.io/github/v/release/cdklabs/cdk-multi-az-observability?include_prereleases&sort=semver&logo=github&label=version)

# multi-az-observability
This is a CDK construct for multi-AZ observability to help detect single-AZ impairments. This is currently an `alpha` version, but is being used in the AWS [Advanced Multi-AZ Resilience Patterns](https://catalog.workshops.aws/multi-az-gray-failures/en-US) workshop.

There is a lot of available information to think through and combine to provide signals about single-AZ impact. To simplify the setup and use reasonable defaults, this construct (available in [TypeScript](https://www.npmjs.com/package/@cdklabs/multi-az-observability), [Go](https://github.com/cdklabs/cdk-multi-az-observability-go), [Python](https://pypi.org/project/cdklabs.multi-az-observability/), [.NET](https://www.nuget.org/packages/Cdklabs.MultiAZObservability), and [Java](https://central.sonatype.com/artifact/io.github.cdklabs/cdk-multi-az-observability)) sets up the necessary observability. To use the CDK construct, you first define your service like this:

```csharp
var wildRydesService = new Service(new ServiceProps(){
    ServiceName = "WildRydes",
    BaseUrl = "http://www.example.com",
    FaultCountThreshold = 25,
    AvailabilityZoneNames = vpc.AvailabilityZones,
    Period = Duration.Seconds(60),
    LoadBalancer = loadBalancer,
    DefaultAvailabilityMetricDetails = new ServiceAvailabilityMetricDetails(new ServiceAvailabilityMetricDetailsProps() {
        AlarmStatistic = "Sum",
        DatapointsToAlarm = 2,
        EvaluationPeriods = 3,
        FaultAlarmThreshold = 1,
        FaultMetricNames = new string[] { "Fault", "Failure" },
        GraphedFaultStatistics = new string[] { "Sum" },
        GraphedSuccessStatistics = new string[] { "Sum" },
        MetricNamespace = metricsNamespace,
        Period = Duration.Seconds(60),
        SuccessAlarmThreshold = 99,
        SuccessMetricNames = new string[] {"Success"},
        Unit = Unit.COUNT,
    }),
    DefaultLatencyMetricDetails = new ServiceLatencyMetricDetails(new ServiceLatencyMetricDetailsProps(){
        AlarmStatistic = "p99",
        DatapointsToAlarm = 2,
        EvaluationPeriods = 3,
        FaultMetricNames = new string[] { "FaultLatency" },
        GraphedFaultStatistics = new string[] { "p50" },
        GraphedSuccessStatistics = new string[] { "p50", "p99", "tm50", "tm99" },
        MetricNamespace = metricsNamespace,
        Period = Duration.Seconds(60),
        SuccessAlarmThreshold = Duration.Millis(100),
        SuccessMetricNames = new string[] {"SuccessLatency"},
        Unit = Unit.MILLISECONDS,
    }),
    DefaultContributorInsightRuleDetails =  new ContributorInsightRuleDetails(new ContributorInsightRuleDetailsProps() {
        AvailabilityZoneIdJsonPath = azIdJsonPath,
        FaultMetricJsonPath = faultMetricJsonPath,
        InstanceIdJsonPath = instanceIdJsonPath,
        LogGroups = serverLogGroups,
        OperationNameJsonPath = operationNameJsonPath,
        SuccessLatencyMetricJsonPath = successLatencyMetricJsonPath
    }),
    CanaryTestProps = new AddCanaryTestProps() {
        RequestCount = 60,
        RegionalRequestCount = 60,
        LoadBalancer = loadBalancer,
        Schedule = "rate(1 minute)",
        Timeout = Duration.Seconds(3),
        NetworkConfiguration = new NetworkConfigurationProps() {
            Vpc = vpc,
            SubnetSelection = new SubnetSelection() { SubnetType = SubnetType.PRIVATE_ISOLATED }
        }            
    }
}

wildRydesService.AddOperation(new Operation(new OperationProps() {
    OperationName = "Signin",
    Path = "/signin",
    Service = wildRydesService,
    Critical = true,
    HttpMethods = new string[] { "GET" },
    ServerSideAvailabilityMetricDetails = new OperationAvailabilityMetricDetails(new OperationAvailabilityMetricDetailsProps() {
        OperationName = "Signin",
        MetricDimensions = new MetricDimensions(new Dictionary<string, string> {{ "Operation", "Signin"}}, "AZ-ID", "Region")
    }, wildRydesService.DefaultAvailabilityMetricDetails),
    ServerSideLatencyMetricDetails = new OperationLatencyMetricDetails(new OperationLatencyMetricDetailsProps() {
        OperationName = "Signin",
        SuccessAlarmThreshold = Duration.Millis(150),
        MetricDimensions = new MetricDimensions(new Dictionary<string, string> {{ "Operation", "Signin"}}, "AZ-ID", "Region")
    }, wildRydesService.DefaultLatencyMetricDetails),
    CanaryTestLatencyMetricsOverride = new CanaryTestLatencyMetricsOverride(new CanaryTestLatencyMetricsOverrideProps() {
        SuccessAlarmThreshold = Duration.Millis(500)
    })
})
wildRydesService.AddOperation(new Operation(new OperationProps() {
    OperationName = "Pay",
    Path = "/pay",
    Service = wildRydesService,
    HttpMethods = new string[] { "GET" },
    Critical = true,
    ServerSideAvailabilityMetricDetails = new OperationAvailabilityMetricDetails(new OperationAvailabilityMetricDetailsProps() {
        OperationName = "Pay",
        MetricDimensions = new MetricDimensions(new Dictionary<string, string> {{ "Operation", "Pay"}}, "AZ-ID", "Region")
    }, wildRydesService.DefaultAvailabilityMetricDetails),
    ServerSideLatencyMetricDetails = new OperationLatencyMetricDetails(new OperationLatencyMetricDetailsProps() {
        OperationName = "Pay",
        SuccessAlarmThreshold = Duration.Millis(200),
        MetricDimensions = new MetricDimensions(new Dictionary<string, string> {{ "Operation", "Pay"}}, "AZ-ID", "Region")
    }, wildRydesService.DefaultLatencyMetricDetails),
    CanaryTestLatencyMetricsOverride = new CanaryTestLatencyMetricsOverride(new CanaryTestLatencyMetricsOverrideProps() {
        SuccessAlarmThreshold = Duration.Millis(500)
    })
})
wildRydesService.AddOperation(new Operation(new OperationProps() {
    OperationName = "Ride",
    Path = "/ride",
    Service = wildRydesService,
    HttpMethods = new string[] { "GET" },
    Critical = true,
    ServerSideAvailabilityMetricDetails = new OperationAvailabilityMetricDetails(new OperationAvailabilityMetricDetailsProps() {
        OperationName = "Ride",
        MetricDimensions = new MetricDimensions(new Dictionary<string, string> {{ "Operation", "Ride"}}, "AZ-ID", "Region")
    }, wildRydesService.DefaultAvailabilityMetricDetails),
    ServerSideLatencyMetricDetails = new OperationLatencyMetricDetails(new OperationLatencyMetricDetailsProps() {
        OperationName = "Ride",
        SuccessAlarmThreshold = Duration.Millis(350),
        MetricDimensions = new MetricDimensions(new Dictionary<string, string> {{ "Operation", "Ride"}}, "AZ-ID", "Region")
    }, wildRydesService.DefaultLatencyMetricDetails),
    CanaryTestLatencyMetricsOverride = new CanaryTestLatencyMetricsOverride(new CanaryTestLatencyMetricsOverrideProps() {
        SuccessAlarmThreshold = Duration.Millis(650)
    })
})
wildRydesService.AddOperation(new Operation(new OperationProps() {
    OperationName = "Home",
    Path = "/home",
    Service = wildRydesService,
    HttpMethods = new string[] { "GET" },
    Critical = true,
    ServerSideAvailabilityMetricDetails = new OperationAvailabilityMetricDetails(new OperationAvailabilityMetricDetailsProps() {
        OperationName = "Home",
        MetricDimensions = new MetricDimensions(new Dictionary<string, string> {{ "Operation", "Home"}}, "AZ-ID", "Region")
    }, wildRydesService.DefaultAvailabilityMetricDetails),
    ServerSideLatencyMetricDetails = new OperationLatencyMetricDetails(new OperationLatencyMetricDetailsProps() {
        OperationName = "Home",
        SuccessAlarmThreshold = Duration.Millis(100),
        MetricDimensions = new MetricDimensions(new Dictionary<string, string> {{ "Operation", "Home"}}, "AZ-ID", "Region")
    }, wildRydesService.DefaultLatencyMetricDetails),
    CanaryTestLatencyMetricsOverride = new CanaryTestLatencyMetricsOverride(new CanaryTestLatencyMetricsOverrideProps() {
        SuccessAlarmThreshold = Duration.Millis(500)
    })
}));
```

Then you provide that service definition to the CDK construct.

```csharp
InstrumentedServiceMultiAZObservability multiAvailabilityZoneObservability = new InstrumentedServiceMultiAZObservability(this, "MultiAZObservability", new InstrumentedServiceMultiAZObservabilityProps() {
    Service = wildRydesService,
    CreateDashboards = true,
    Interval = Duration.Minutes(60), // The interval for the dashboard
    OutlierDetectionAlgorithm = OutlierDetectionAlgorithm.STATIC
});
```

You define some characteristics of the service, default values for metrics and alarms, and then add operations as well as any overrides for default values that you need. The construct can also automatically create synthetic canaries that test each operation with a very simple HTTP check, or you can configure your own synthetics and just tell the construct about the metric details and optionally log files. This creates metrics, alarms, and dashboards that can be used to detect single-AZ impact. You can access these alarms from the `multiAvailabilityZoneObservability` object and use them in your CDK project to start automation, send SNS notifications, or incorporate in your own dashboards.

If you don't have service specific logs and custom metrics with per-AZ dimensions, you can still use the construct to evaluate ALB and/or NAT Gateway metrics to find single AZ impairments.

```csharp
BasicServiceMultiAZObservability multiAZObservability = new BasicServiceMultiAZObservability(this, "basic-service-", new BasicServiceMultiAZObservabilityProps() {  
    ApplicationLoadBalancerProps = new ApplicationLoadBalancerDetectionProps() {
        ApplicationLoadBalancers = [ myALB ],
        LatencyStatistic = Stats.Percentile(99),
        FaultCountPercentThreshold = 1,
        LatencyThreshold = Duration.Millis(500)
    },
    NatGatewayProps = new NatGatewayDetectionProps() {     
        PacketLossPercentThreshold = 0.01,
        NatGateways = {
           { "us-east-1a", [ natGateway1 ] },
           { "us-east-1b", [ natGateway2 ] },
           { "us-east-1c", [ natGateway3 ] }
        },
    },
    CreateDashboard = true,
    DatapointsToAlarm = 2,
    EvaluationPeriods = 3,
    ServiceName = "WildRydes",
    Period = Duration.Seconds(60),
    Interval = Duration.Minutes(60),          
});
```

If you provide a load balancer, the construct assumes it is deployed in each AZ of the VPC the load balancer is associated with and will look for HTTP metrics using those AZs as dimensions.

Both options support running workloads on EC2, ECS, Lambda, and EKS.<!-- Updated: Fri May 30 12:30:58 CEST 2025 -->
