# multi-az-observability
This is a CDK construct for multi-AZ observability to help detect single-AZ impairments. This is currently an `alpha` version, but is being used in the AWS [Advanced Multi-AZ Resilience Patterns](https://catalog.workshops.aws/multi-az-gray-failures/en-US) workshop.

There is a lot of available information to think through and combine to provide signals about single-AZ impact. To simplify the setup and use reasonable defaults, this construct (available in TypeScript, Go, Python, and .NET [Java coming soon]) sets up the necessary observability. To use the CDK construct, you first define your service like this:

```csharp
var wildRydesService = new Service(new ServiceProps(){
    ServiceName = "WildRydes",
    BaseUrl = "http://www.example.com",
    FaultCountThreshold = 25,
    AvailabilityZoneNames = vpc.AvailabilityZones,
    Period = Duration.Seconds(60),
    LoadBalancer = loadBalancer,
    DefaultAvailabilityMetricDetails = new ServiceMetricDetails(new ServiceMetricDetailsProps() {
        AlarmStatistic = "Sum",
        DatapointsToAlarm = 3,
        EvaluationPeriods = 5,
        FaultAlarmThreshold = 1,
        FaultMetricNames = new string[] { "Fault", "Error" },
        GraphedFaultStatistics = new string[] { "Sum" },
        GraphedSuccessStatistics = new string[] { "Sum" },
        MetricNamespace = metricsNamespace,
        Period = Duration.Seconds(60),
        SuccessAlarmThreshold = 99,
        SuccessMetricNames = new string[] {"Success"},
        Unit = Unit.COUNT,
    }),
    DefaultLatencyMetricDetails = new ServiceMetricDetails(new ServiceMetricDetailsProps(){
        AlarmStatistic = "p99",
        DatapointsToAlarm = 3,
        EvaluationPeriods = 5,
        FaultAlarmThreshold = 1,
        FaultMetricNames = new string[] { "FaultLatency" },
        GraphedFaultStatistics = new string[] { "p50" },
        GraphedSuccessStatistics = new string[] { "p50", "p99", "tm50", "tm99" },
        MetricNamespace = metricsNamespace,
        Period = Duration.Seconds(60),
        SuccessAlarmThreshold = 100,
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
        RequestCount = 10,
        LoadBalancer = loadBalancer,
        Schedule = "rate(1 minute)",
        NetworkConfiguration = new NetworkConfigurationProps() {
            Vpc = vpc,
            SubnetSelection = new SubnetSelection() { SubnetType = SubnetType.PRIVATE_ISOLATED }
        }
    }
});
wildRydesService.AddOperation(new Operation(new OperationProps() {
    OperationName = "Signin",
    Path = "/signin",
    Service = wildRydesService,
    Critical = true,
    HttpMethods = new string[] { "GET" },
    ServerSideAvailabilityMetricDetails = new OperationMetricDetails(new OperationMetricDetailsProps() {
        OperationName = "Signin",
        MetricDimensions = new MetricDimensions(new Dictionary<string, string> {{ "Operation", "Signin"}}, "AZ-ID", "Region")
    }, wildRydesService.DefaultAvailabilityMetricDetails),
    ServerSideLatencyMetricDetails = new OperationMetricDetails(new OperationMetricDetailsProps() {
        OperationName = "Signin",
        SuccessAlarmThreshold = 150,
        MetricDimensions = new MetricDimensions(new Dictionary<string, string> {{ "Operation", "Signin"}}, "AZ-ID", "Region")
    }, wildRydesService.DefaultLatencyMetricDetails),
    CanaryTestLatencyMetricsOverride = new CanaryTestMetricsOverride(new CanaryTestMetricsOverrideProps() {
        SuccessAlarmThreshold = 250
    })
}));
wildRydesService.AddOperation(new Operation(new OperationProps() {
    OperationName = "Pay",
    Path = "/pay",
    Service = wildRydesService,
    HttpMethods = new string[] { "GET" },
    Critical = true,
    ServerSideAvailabilityMetricDetails = new OperationMetricDetails(new OperationMetricDetailsProps() {
        OperationName = "Pay",
        MetricDimensions = new MetricDimensions(new Dictionary<string, string> {{ "Operation", "Pay"}}, "AZ-ID", "Region")
    }, wildRydesService.DefaultAvailabilityMetricDetails),
    ServerSideLatencyMetricDetails = new OperationMetricDetails(new OperationMetricDetailsProps() {
        OperationName = "Pay",
        SuccessAlarmThreshold = 200,
        MetricDimensions = new MetricDimensions(new Dictionary<string, string> {{ "Operation", "Pay"}}, "AZ-ID", "Region")
    }, wildRydesService.DefaultLatencyMetricDetails),
    CanaryTestLatencyMetricsOverride = new CanaryTestMetricsOverride(new CanaryTestMetricsOverrideProps() {
        SuccessAlarmThreshold = 300
    })
}));
wildRydesService.AddOperation(new Operation(new OperationProps() {
    OperationName = "Ride",
    Path = "/ride",
    Service = wildRydesService,
    HttpMethods = new string[] { "GET" },
    Critical = true,
    ServerSideAvailabilityMetricDetails = new OperationMetricDetails(new OperationMetricDetailsProps() {
        OperationName = "Ride",
        MetricDimensions = new MetricDimensions(new Dictionary<string, string> {{ "Operation", "Ride"}}, "AZ-ID", "Region")
    }, wildRydesService.DefaultAvailabilityMetricDetails),
    ServerSideLatencyMetricDetails = new OperationMetricDetails(new OperationMetricDetailsProps() {
        OperationName = "Ride",
        SuccessAlarmThreshold = 350,
        MetricDimensions = new MetricDimensions(new Dictionary<string, string> {{ "Operation", "Ride"}}, "AZ-ID", "Region")
    }, wildRydesService.DefaultLatencyMetricDetails),
    CanaryTestLatencyMetricsOverride = new CanaryTestMetricsOverride(new CanaryTestMetricsOverrideProps() {
        SuccessAlarmThreshold = 550
    })
}));
wildRydesService.AddOperation(new Operation(new OperationProps() {
    OperationName = "Home",
    Path = "/home",
    Service = wildRydesService,
    HttpMethods = new string[] { "GET" },
    Critical = true,
    ServerSideAvailabilityMetricDetails = new OperationMetricDetails(new OperationMetricDetailsProps() {
        OperationName = "Home",
        MetricDimensions = new MetricDimensions(new Dictionary<string, string> {{ "Operation", "Ride"}}, "AZ-ID", "Region")
    }, wildRydesService.DefaultAvailabilityMetricDetails),
    ServerSideLatencyMetricDetails = new OperationMetricDetails(new OperationMetricDetailsProps() {
        OperationName = "Home",
        SuccessAlarmThreshold = 100,
        MetricDimensions = new MetricDimensions(new Dictionary<string, string> {{ "Operation", "Ride"}}, "AZ-ID", "Region")
    }, wildRydesService.DefaultLatencyMetricDetails),
    CanaryTestLatencyMetricsOverride = new CanaryTestMetricsOverride(new CanaryTestMetricsOverrideProps() {
        SuccessAlarmThreshold = 200
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

You define some characteristics of the service, default values for metrics and alarms, and then add operations as well as any overrides for default values that you need. The construct can also automatically create synthetic canaries that test each operation with a very simple HTTP check, or you can configure your own synthetics and just tell the construct about the metric details and optionally log files. This creates metrics, alarms, and dashboards that can be used to detect single-AZ impact.

If you don't have service specific logs and custom metrics with per-AZ dimensions, you can still use the construct to evaluate ALB and NAT Gateway metrics to find single AZ faults.

```csharp
BasicServiceMultiAZObservability multiAvailabilityZoneObservability = new BasicServiceMultiAZObservability(this, "MultiAZObservability", new BasicServiceMultiAZObservabilityProps() {
    ApplicationLoadBalancers = new IApplicationLoadBalancer[] { loadBalancer },
    NatGateways = new Dictionary<string, CfnNatGateway>() {
        { "us-east-1a", natGateway1},
        { "us-east-1b", natGateway2},
        { "us-east-1c", natGateway3},
    },
    CreateDashboard = true,
    OutlierDetectionAlgorithm = OutlierDetectionAlgorithm.STATIC,
    FaultCountPercentageThreshold = 1.0, // The fault rate to alarm on for errors seen from the ALBs in the same AZ
    PacketLossImpactPercentageThreshold = 0.01, // The percentage of packet loss to alarm on for the NAT Gateways in the same AZ
    ServiceName = "WildRydes",
    Period = Duration.Seconds(60), // The period for metric evaluation
    Interval = Duration.Minutes(60) // The interval for the dashboards
    EvaluationPeriods = 5,
    DatapointsToAlarm = 3
});
```

If you provide a load balancer, the construct assumes it is deployed in each AZ of the VPC the load balancer is associated with and will look for HTTP metrics using those AZs as dimensions.

Both options support running workloads on EC2, ECS, Lambda, and EKS.
