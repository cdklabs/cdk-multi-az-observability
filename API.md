# API Reference <a name="API Reference" id="api-reference"></a>

## Constructs <a name="Constructs" id="Constructs"></a>

### AvailabilityZoneMapper <a name="AvailabilityZoneMapper" id="@cdklabs/multi-az-observability.AvailabilityZoneMapper"></a>

- *Implements:* <a href="#@cdklabs/multi-az-observability.IAvailabilityZoneMapper">IAvailabilityZoneMapper</a>

A construct that allows you to map AZ names to ids and back.

#### Initializers <a name="Initializers" id="@cdklabs/multi-az-observability.AvailabilityZoneMapper.Initializer"></a>

```typescript
import { AvailabilityZoneMapper } from '@cdklabs/multi-az-observability'

new AvailabilityZoneMapper(scope: Construct, id: string, props?: AvailabilityZoneMapperProps)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@cdklabs/multi-az-observability.AvailabilityZoneMapper.Initializer.parameter.scope">scope</a></code> | <code>constructs.Construct</code> | *No description.* |
| <code><a href="#@cdklabs/multi-az-observability.AvailabilityZoneMapper.Initializer.parameter.id">id</a></code> | <code>string</code> | *No description.* |
| <code><a href="#@cdklabs/multi-az-observability.AvailabilityZoneMapper.Initializer.parameter.props">props</a></code> | <code><a href="#@cdklabs/multi-az-observability.AvailabilityZoneMapperProps">AvailabilityZoneMapperProps</a></code> | *No description.* |

---

##### `scope`<sup>Required</sup> <a name="scope" id="@cdklabs/multi-az-observability.AvailabilityZoneMapper.Initializer.parameter.scope"></a>

- *Type:* constructs.Construct

---

##### `id`<sup>Required</sup> <a name="id" id="@cdklabs/multi-az-observability.AvailabilityZoneMapper.Initializer.parameter.id"></a>

- *Type:* string

---

##### `props`<sup>Optional</sup> <a name="props" id="@cdklabs/multi-az-observability.AvailabilityZoneMapper.Initializer.parameter.props"></a>

- *Type:* <a href="#@cdklabs/multi-az-observability.AvailabilityZoneMapperProps">AvailabilityZoneMapperProps</a>

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#@cdklabs/multi-az-observability.AvailabilityZoneMapper.toString">toString</a></code> | Returns a string representation of this construct. |
| <code><a href="#@cdklabs/multi-az-observability.AvailabilityZoneMapper.allAvailabilityZoneIdsAsArray">allAvailabilityZoneIdsAsArray</a></code> | Returns a reference that can be cast to a string array with all of the Availability Zone Ids. |
| <code><a href="#@cdklabs/multi-az-observability.AvailabilityZoneMapper.allAvailabilityZoneIdsAsCommaDelimitedList">allAvailabilityZoneIdsAsCommaDelimitedList</a></code> | Returns a comma delimited list of Availability Zone Ids for the supplied Availability Zone names. |
| <code><a href="#@cdklabs/multi-az-observability.AvailabilityZoneMapper.allAvailabilityZoneNamesAsCommaDelimitedList">allAvailabilityZoneNamesAsCommaDelimitedList</a></code> | Gets all of the Availability Zone names in this Region as a comma delimited list. |
| <code><a href="#@cdklabs/multi-az-observability.AvailabilityZoneMapper.availabilityZoneId">availabilityZoneId</a></code> | Gets the Availability Zone Id for the given Availability Zone Name in this account. |
| <code><a href="#@cdklabs/multi-az-observability.AvailabilityZoneMapper.availabilityZoneIdFromAvailabilityZoneLetter">availabilityZoneIdFromAvailabilityZoneLetter</a></code> | Given a letter like "f" or "a", returns the Availability Zone Id for that Availability Zone name in this account. |
| <code><a href="#@cdklabs/multi-az-observability.AvailabilityZoneMapper.availabilityZoneIdsAsArray">availabilityZoneIdsAsArray</a></code> | Returns an array for Availability Zone Ids for the supplied Availability Zone names, they are returned in the same order the names were provided. |
| <code><a href="#@cdklabs/multi-az-observability.AvailabilityZoneMapper.availabilityZoneIdsAsCommaDelimitedList">availabilityZoneIdsAsCommaDelimitedList</a></code> | Returns a comma delimited list of Availability Zone Ids for the supplied Availability Zone names. |
| <code><a href="#@cdklabs/multi-az-observability.AvailabilityZoneMapper.availabilityZoneName">availabilityZoneName</a></code> | Gets the Availability Zone Name for the given Availability Zone Id in this account. |
| <code><a href="#@cdklabs/multi-az-observability.AvailabilityZoneMapper.regionPrefixForAvailabilityZoneIds">regionPrefixForAvailabilityZoneIds</a></code> | Gets the prefix for the region used with Availability Zone Ids, for example in us-east-1, this returns "use1". |

---

##### `toString` <a name="toString" id="@cdklabs/multi-az-observability.AvailabilityZoneMapper.toString"></a>

```typescript
public toString(): string
```

Returns a string representation of this construct.

##### `allAvailabilityZoneIdsAsArray` <a name="allAvailabilityZoneIdsAsArray" id="@cdklabs/multi-az-observability.AvailabilityZoneMapper.allAvailabilityZoneIdsAsArray"></a>

```typescript
public allAvailabilityZoneIdsAsArray(): Reference
```

Returns a reference that can be cast to a string array with all of the Availability Zone Ids.

##### `allAvailabilityZoneIdsAsCommaDelimitedList` <a name="allAvailabilityZoneIdsAsCommaDelimitedList" id="@cdklabs/multi-az-observability.AvailabilityZoneMapper.allAvailabilityZoneIdsAsCommaDelimitedList"></a>

```typescript
public allAvailabilityZoneIdsAsCommaDelimitedList(): string
```

Returns a comma delimited list of Availability Zone Ids for the supplied Availability Zone names.

You can use this string with Fn.Select(x, Fn.Split(",", azs)) to
get a specific Availability Zone Id

##### `allAvailabilityZoneNamesAsCommaDelimitedList` <a name="allAvailabilityZoneNamesAsCommaDelimitedList" id="@cdklabs/multi-az-observability.AvailabilityZoneMapper.allAvailabilityZoneNamesAsCommaDelimitedList"></a>

```typescript
public allAvailabilityZoneNamesAsCommaDelimitedList(): string
```

Gets all of the Availability Zone names in this Region as a comma delimited list.

You can use this string with Fn.Select(x, Fn.Split(",", azs)) to
get a specific Availability Zone Name

##### `availabilityZoneId` <a name="availabilityZoneId" id="@cdklabs/multi-az-observability.AvailabilityZoneMapper.availabilityZoneId"></a>

```typescript
public availabilityZoneId(availabilityZoneName: string): string
```

Gets the Availability Zone Id for the given Availability Zone Name in this account.

###### `availabilityZoneName`<sup>Required</sup> <a name="availabilityZoneName" id="@cdklabs/multi-az-observability.AvailabilityZoneMapper.availabilityZoneId.parameter.availabilityZoneName"></a>

- *Type:* string

---

##### `availabilityZoneIdFromAvailabilityZoneLetter` <a name="availabilityZoneIdFromAvailabilityZoneLetter" id="@cdklabs/multi-az-observability.AvailabilityZoneMapper.availabilityZoneIdFromAvailabilityZoneLetter"></a>

```typescript
public availabilityZoneIdFromAvailabilityZoneLetter(letter: string): string
```

Given a letter like "f" or "a", returns the Availability Zone Id for that Availability Zone name in this account.

###### `letter`<sup>Required</sup> <a name="letter" id="@cdklabs/multi-az-observability.AvailabilityZoneMapper.availabilityZoneIdFromAvailabilityZoneLetter.parameter.letter"></a>

- *Type:* string

---

##### `availabilityZoneIdsAsArray` <a name="availabilityZoneIdsAsArray" id="@cdklabs/multi-az-observability.AvailabilityZoneMapper.availabilityZoneIdsAsArray"></a>

```typescript
public availabilityZoneIdsAsArray(availabilityZoneNames: string[]): string[]
```

Returns an array for Availability Zone Ids for the supplied Availability Zone names, they are returned in the same order the names were provided.

###### `availabilityZoneNames`<sup>Required</sup> <a name="availabilityZoneNames" id="@cdklabs/multi-az-observability.AvailabilityZoneMapper.availabilityZoneIdsAsArray.parameter.availabilityZoneNames"></a>

- *Type:* string[]

---

##### `availabilityZoneIdsAsCommaDelimitedList` <a name="availabilityZoneIdsAsCommaDelimitedList" id="@cdklabs/multi-az-observability.AvailabilityZoneMapper.availabilityZoneIdsAsCommaDelimitedList"></a>

```typescript
public availabilityZoneIdsAsCommaDelimitedList(availabilityZoneNames: string[]): string
```

Returns a comma delimited list of Availability Zone Ids for the supplied Availability Zone names.

You can use this string with Fn.Select(x, Fn.Split(",", azs)) to
get a specific Availability Zone Id

###### `availabilityZoneNames`<sup>Required</sup> <a name="availabilityZoneNames" id="@cdklabs/multi-az-observability.AvailabilityZoneMapper.availabilityZoneIdsAsCommaDelimitedList.parameter.availabilityZoneNames"></a>

- *Type:* string[]

---

##### `availabilityZoneName` <a name="availabilityZoneName" id="@cdklabs/multi-az-observability.AvailabilityZoneMapper.availabilityZoneName"></a>

```typescript
public availabilityZoneName(availabilityZoneId: string): string
```

Gets the Availability Zone Name for the given Availability Zone Id in this account.

###### `availabilityZoneId`<sup>Required</sup> <a name="availabilityZoneId" id="@cdklabs/multi-az-observability.AvailabilityZoneMapper.availabilityZoneName.parameter.availabilityZoneId"></a>

- *Type:* string

---

##### `regionPrefixForAvailabilityZoneIds` <a name="regionPrefixForAvailabilityZoneIds" id="@cdklabs/multi-az-observability.AvailabilityZoneMapper.regionPrefixForAvailabilityZoneIds"></a>

```typescript
public regionPrefixForAvailabilityZoneIds(): string
```

Gets the prefix for the region used with Availability Zone Ids, for example in us-east-1, this returns "use1".

#### Static Functions <a name="Static Functions" id="Static Functions"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#@cdklabs/multi-az-observability.AvailabilityZoneMapper.isConstruct">isConstruct</a></code> | Checks if `x` is a construct. |

---

##### ~~`isConstruct`~~ <a name="isConstruct" id="@cdklabs/multi-az-observability.AvailabilityZoneMapper.isConstruct"></a>

```typescript
import { AvailabilityZoneMapper } from '@cdklabs/multi-az-observability'

AvailabilityZoneMapper.isConstruct(x: any)
```

Checks if `x` is a construct.

###### `x`<sup>Required</sup> <a name="x" id="@cdklabs/multi-az-observability.AvailabilityZoneMapper.isConstruct.parameter.x"></a>

- *Type:* any

Any object.

---

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@cdklabs/multi-az-observability.AvailabilityZoneMapper.property.node">node</a></code> | <code>constructs.Node</code> | The tree node. |
| <code><a href="#@cdklabs/multi-az-observability.AvailabilityZoneMapper.property.function">function</a></code> | <code>aws-cdk-lib.aws_lambda.IFunction</code> | The function that does the mapping. |
| <code><a href="#@cdklabs/multi-az-observability.AvailabilityZoneMapper.property.logGroup">logGroup</a></code> | <code>aws-cdk-lib.aws_logs.ILogGroup</code> | The log group for the function's logs. |
| <code><a href="#@cdklabs/multi-az-observability.AvailabilityZoneMapper.property.mapper">mapper</a></code> | <code>aws-cdk-lib.CustomResource</code> | The custom resource that can be referenced to use Fn::GetAtt functions on to retrieve availability zone names and ids. |

---

##### `node`<sup>Required</sup> <a name="node" id="@cdklabs/multi-az-observability.AvailabilityZoneMapper.property.node"></a>

```typescript
public readonly node: Node;
```

- *Type:* constructs.Node

The tree node.

---

##### `function`<sup>Required</sup> <a name="function" id="@cdklabs/multi-az-observability.AvailabilityZoneMapper.property.function"></a>

```typescript
public readonly function: IFunction;
```

- *Type:* aws-cdk-lib.aws_lambda.IFunction

The function that does the mapping.

---

##### `logGroup`<sup>Required</sup> <a name="logGroup" id="@cdklabs/multi-az-observability.AvailabilityZoneMapper.property.logGroup"></a>

```typescript
public readonly logGroup: ILogGroup;
```

- *Type:* aws-cdk-lib.aws_logs.ILogGroup

The log group for the function's logs.

---

##### `mapper`<sup>Required</sup> <a name="mapper" id="@cdklabs/multi-az-observability.AvailabilityZoneMapper.property.mapper"></a>

```typescript
public readonly mapper: CustomResource;
```

- *Type:* aws-cdk-lib.CustomResource

The custom resource that can be referenced to use Fn::GetAtt functions on to retrieve availability zone names and ids.

---


### BasicServiceMultiAZObservability <a name="BasicServiceMultiAZObservability" id="@cdklabs/multi-az-observability.BasicServiceMultiAZObservability"></a>

- *Implements:* <a href="#@cdklabs/multi-az-observability.IBasicServiceMultiAZObservability">IBasicServiceMultiAZObservability</a>

Basic observability for a service using metrics from ALBs and NAT Gateways.

#### Initializers <a name="Initializers" id="@cdklabs/multi-az-observability.BasicServiceMultiAZObservability.Initializer"></a>

```typescript
import { BasicServiceMultiAZObservability } from '@cdklabs/multi-az-observability'

new BasicServiceMultiAZObservability(scope: Construct, id: string, props: BasicServiceMultiAZObservabilityProps)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@cdklabs/multi-az-observability.BasicServiceMultiAZObservability.Initializer.parameter.scope">scope</a></code> | <code>constructs.Construct</code> | *No description.* |
| <code><a href="#@cdklabs/multi-az-observability.BasicServiceMultiAZObservability.Initializer.parameter.id">id</a></code> | <code>string</code> | *No description.* |
| <code><a href="#@cdklabs/multi-az-observability.BasicServiceMultiAZObservability.Initializer.parameter.props">props</a></code> | <code><a href="#@cdklabs/multi-az-observability.BasicServiceMultiAZObservabilityProps">BasicServiceMultiAZObservabilityProps</a></code> | *No description.* |

---

##### `scope`<sup>Required</sup> <a name="scope" id="@cdklabs/multi-az-observability.BasicServiceMultiAZObservability.Initializer.parameter.scope"></a>

- *Type:* constructs.Construct

---

##### `id`<sup>Required</sup> <a name="id" id="@cdklabs/multi-az-observability.BasicServiceMultiAZObservability.Initializer.parameter.id"></a>

- *Type:* string

---

##### `props`<sup>Required</sup> <a name="props" id="@cdklabs/multi-az-observability.BasicServiceMultiAZObservability.Initializer.parameter.props"></a>

- *Type:* <a href="#@cdklabs/multi-az-observability.BasicServiceMultiAZObservabilityProps">BasicServiceMultiAZObservabilityProps</a>

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#@cdklabs/multi-az-observability.BasicServiceMultiAZObservability.toString">toString</a></code> | Returns a string representation of this construct. |

---

##### `toString` <a name="toString" id="@cdklabs/multi-az-observability.BasicServiceMultiAZObservability.toString"></a>

```typescript
public toString(): string
```

Returns a string representation of this construct.

#### Static Functions <a name="Static Functions" id="Static Functions"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#@cdklabs/multi-az-observability.BasicServiceMultiAZObservability.isConstruct">isConstruct</a></code> | Checks if `x` is a construct. |

---

##### ~~`isConstruct`~~ <a name="isConstruct" id="@cdklabs/multi-az-observability.BasicServiceMultiAZObservability.isConstruct"></a>

```typescript
import { BasicServiceMultiAZObservability } from '@cdklabs/multi-az-observability'

BasicServiceMultiAZObservability.isConstruct(x: any)
```

Checks if `x` is a construct.

###### `x`<sup>Required</sup> <a name="x" id="@cdklabs/multi-az-observability.BasicServiceMultiAZObservability.isConstruct.parameter.x"></a>

- *Type:* any

Any object.

---

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@cdklabs/multi-az-observability.BasicServiceMultiAZObservability.property.node">node</a></code> | <code>constructs.Node</code> | The tree node. |
| <code><a href="#@cdklabs/multi-az-observability.BasicServiceMultiAZObservability.property.aggregateZonalIsolatedImpactAlarms">aggregateZonalIsolatedImpactAlarms</a></code> | <code>{[ key: string ]: aws-cdk-lib.aws_cloudwatch.IAlarm}</code> | The alarms indicating if an AZ has isolated impact from either ALB or NAT GW metrics. |
| <code><a href="#@cdklabs/multi-az-observability.BasicServiceMultiAZObservability.property.serviceName">serviceName</a></code> | <code>string</code> | The name of the service. |
| <code><a href="#@cdklabs/multi-az-observability.BasicServiceMultiAZObservability.property.albZonalIsolatedImpactAlarms">albZonalIsolatedImpactAlarms</a></code> | <code>{[ key: string ]: aws-cdk-lib.aws_cloudwatch.IAlarm}</code> | The alarms indicating if an AZ is an outlier for ALB faults and has isolated impact. |
| <code><a href="#@cdklabs/multi-az-observability.BasicServiceMultiAZObservability.property.applicationLoadBalancers">applicationLoadBalancers</a></code> | <code>aws-cdk-lib.aws_elasticloadbalancingv2.IApplicationLoadBalancer[]</code> | The application load balancers being used by the service. |
| <code><a href="#@cdklabs/multi-az-observability.BasicServiceMultiAZObservability.property.dashboard">dashboard</a></code> | <code>aws-cdk-lib.aws_cloudwatch.Dashboard</code> | The dashboard that is optionally created. |
| <code><a href="#@cdklabs/multi-az-observability.BasicServiceMultiAZObservability.property.natGateways">natGateways</a></code> | <code>{[ key: string ]: aws-cdk-lib.aws_ec2.CfnNatGateway[]}</code> | The NAT Gateways being used in the service, each set of NAT Gateways are keyed by their Availability Zone Id. |
| <code><a href="#@cdklabs/multi-az-observability.BasicServiceMultiAZObservability.property.natGWZonalIsolatedImpactAlarms">natGWZonalIsolatedImpactAlarms</a></code> | <code>{[ key: string ]: aws-cdk-lib.aws_cloudwatch.IAlarm}</code> | The alarms indicating if an AZ is an outlier for NAT GW packet loss and has isolated impact. |

---

##### `node`<sup>Required</sup> <a name="node" id="@cdklabs/multi-az-observability.BasicServiceMultiAZObservability.property.node"></a>

```typescript
public readonly node: Node;
```

- *Type:* constructs.Node

The tree node.

---

##### `aggregateZonalIsolatedImpactAlarms`<sup>Required</sup> <a name="aggregateZonalIsolatedImpactAlarms" id="@cdklabs/multi-az-observability.BasicServiceMultiAZObservability.property.aggregateZonalIsolatedImpactAlarms"></a>

```typescript
public readonly aggregateZonalIsolatedImpactAlarms: {[ key: string ]: IAlarm};
```

- *Type:* {[ key: string ]: aws-cdk-lib.aws_cloudwatch.IAlarm}

The alarms indicating if an AZ has isolated impact from either ALB or NAT GW metrics.

---

##### `serviceName`<sup>Required</sup> <a name="serviceName" id="@cdklabs/multi-az-observability.BasicServiceMultiAZObservability.property.serviceName"></a>

```typescript
public readonly serviceName: string;
```

- *Type:* string

The name of the service.

---

##### `albZonalIsolatedImpactAlarms`<sup>Optional</sup> <a name="albZonalIsolatedImpactAlarms" id="@cdklabs/multi-az-observability.BasicServiceMultiAZObservability.property.albZonalIsolatedImpactAlarms"></a>

```typescript
public readonly albZonalIsolatedImpactAlarms: {[ key: string ]: IAlarm};
```

- *Type:* {[ key: string ]: aws-cdk-lib.aws_cloudwatch.IAlarm}

The alarms indicating if an AZ is an outlier for ALB faults and has isolated impact.

---

##### `applicationLoadBalancers`<sup>Optional</sup> <a name="applicationLoadBalancers" id="@cdklabs/multi-az-observability.BasicServiceMultiAZObservability.property.applicationLoadBalancers"></a>

```typescript
public readonly applicationLoadBalancers: IApplicationLoadBalancer[];
```

- *Type:* aws-cdk-lib.aws_elasticloadbalancingv2.IApplicationLoadBalancer[]

The application load balancers being used by the service.

---

##### `dashboard`<sup>Optional</sup> <a name="dashboard" id="@cdklabs/multi-az-observability.BasicServiceMultiAZObservability.property.dashboard"></a>

```typescript
public readonly dashboard: Dashboard;
```

- *Type:* aws-cdk-lib.aws_cloudwatch.Dashboard

The dashboard that is optionally created.

---

##### `natGateways`<sup>Optional</sup> <a name="natGateways" id="@cdklabs/multi-az-observability.BasicServiceMultiAZObservability.property.natGateways"></a>

```typescript
public readonly natGateways: {[ key: string ]: CfnNatGateway[]};
```

- *Type:* {[ key: string ]: aws-cdk-lib.aws_ec2.CfnNatGateway[]}

The NAT Gateways being used in the service, each set of NAT Gateways are keyed by their Availability Zone Id.

---

##### `natGWZonalIsolatedImpactAlarms`<sup>Optional</sup> <a name="natGWZonalIsolatedImpactAlarms" id="@cdklabs/multi-az-observability.BasicServiceMultiAZObservability.property.natGWZonalIsolatedImpactAlarms"></a>

```typescript
public readonly natGWZonalIsolatedImpactAlarms: {[ key: string ]: IAlarm};
```

- *Type:* {[ key: string ]: aws-cdk-lib.aws_cloudwatch.IAlarm}

The alarms indicating if an AZ is an outlier for NAT GW packet loss and has isolated impact.

---


### InstrumentedServiceMultiAZObservability <a name="InstrumentedServiceMultiAZObservability" id="@cdklabs/multi-az-observability.InstrumentedServiceMultiAZObservability"></a>

- *Implements:* <a href="#@cdklabs/multi-az-observability.IInstrumentedServiceMultiAZObservability">IInstrumentedServiceMultiAZObservability</a>

An service that implements its own instrumentation to record availability and latency metrics that can be used to create alarms, rules, and dashboards from.

#### Initializers <a name="Initializers" id="@cdklabs/multi-az-observability.InstrumentedServiceMultiAZObservability.Initializer"></a>

```typescript
import { InstrumentedServiceMultiAZObservability } from '@cdklabs/multi-az-observability'

new InstrumentedServiceMultiAZObservability(scope: Construct, id: string, props: InstrumentedServiceMultiAZObservabilityProps)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@cdklabs/multi-az-observability.InstrumentedServiceMultiAZObservability.Initializer.parameter.scope">scope</a></code> | <code>constructs.Construct</code> | *No description.* |
| <code><a href="#@cdklabs/multi-az-observability.InstrumentedServiceMultiAZObservability.Initializer.parameter.id">id</a></code> | <code>string</code> | *No description.* |
| <code><a href="#@cdklabs/multi-az-observability.InstrumentedServiceMultiAZObservability.Initializer.parameter.props">props</a></code> | <code><a href="#@cdklabs/multi-az-observability.InstrumentedServiceMultiAZObservabilityProps">InstrumentedServiceMultiAZObservabilityProps</a></code> | *No description.* |

---

##### `scope`<sup>Required</sup> <a name="scope" id="@cdklabs/multi-az-observability.InstrumentedServiceMultiAZObservability.Initializer.parameter.scope"></a>

- *Type:* constructs.Construct

---

##### `id`<sup>Required</sup> <a name="id" id="@cdklabs/multi-az-observability.InstrumentedServiceMultiAZObservability.Initializer.parameter.id"></a>

- *Type:* string

---

##### `props`<sup>Required</sup> <a name="props" id="@cdklabs/multi-az-observability.InstrumentedServiceMultiAZObservability.Initializer.parameter.props"></a>

- *Type:* <a href="#@cdklabs/multi-az-observability.InstrumentedServiceMultiAZObservabilityProps">InstrumentedServiceMultiAZObservabilityProps</a>

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#@cdklabs/multi-az-observability.InstrumentedServiceMultiAZObservability.toString">toString</a></code> | Returns a string representation of this construct. |

---

##### `toString` <a name="toString" id="@cdklabs/multi-az-observability.InstrumentedServiceMultiAZObservability.toString"></a>

```typescript
public toString(): string
```

Returns a string representation of this construct.

#### Static Functions <a name="Static Functions" id="Static Functions"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#@cdklabs/multi-az-observability.InstrumentedServiceMultiAZObservability.isConstruct">isConstruct</a></code> | Checks if `x` is a construct. |

---

##### ~~`isConstruct`~~ <a name="isConstruct" id="@cdklabs/multi-az-observability.InstrumentedServiceMultiAZObservability.isConstruct"></a>

```typescript
import { InstrumentedServiceMultiAZObservability } from '@cdklabs/multi-az-observability'

InstrumentedServiceMultiAZObservability.isConstruct(x: any)
```

Checks if `x` is a construct.

###### `x`<sup>Required</sup> <a name="x" id="@cdklabs/multi-az-observability.InstrumentedServiceMultiAZObservability.isConstruct.parameter.x"></a>

- *Type:* any

Any object.

---

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@cdklabs/multi-az-observability.InstrumentedServiceMultiAZObservability.property.node">node</a></code> | <code>constructs.Node</code> | The tree node. |
| <code><a href="#@cdklabs/multi-az-observability.InstrumentedServiceMultiAZObservability.property.perOperationZonalImpactAlarms">perOperationZonalImpactAlarms</a></code> | <code>{[ key: string ]: {[ key: string ]: aws-cdk-lib.aws_cloudwatch.IAlarm}}</code> | Index into the dictionary by operation name, then by Availability Zone Id to get the alarms that indicate an AZ shows isolated impact from availability or latency as seen by either the server-side or canary. |
| <code><a href="#@cdklabs/multi-az-observability.InstrumentedServiceMultiAZObservability.property.serviceAlarms">serviceAlarms</a></code> | <code><a href="#@cdklabs/multi-az-observability.IServiceAlarmsAndRules">IServiceAlarmsAndRules</a></code> | The alarms and rules for the overall service. |
| <code><a href="#@cdklabs/multi-az-observability.InstrumentedServiceMultiAZObservability.property.canaryLogGroup">canaryLogGroup</a></code> | <code>aws-cdk-lib.aws_logs.ILogGroup</code> | If the service is configured to have canary tests created, this will be the log group where the canary's logs are stored. |
| <code><a href="#@cdklabs/multi-az-observability.InstrumentedServiceMultiAZObservability.property.operationDashboards">operationDashboards</a></code> | <code>aws-cdk-lib.aws_cloudwatch.Dashboard[]</code> | The dashboards for each operation. |
| <code><a href="#@cdklabs/multi-az-observability.InstrumentedServiceMultiAZObservability.property.serviceDashboard">serviceDashboard</a></code> | <code>aws-cdk-lib.aws_cloudwatch.Dashboard</code> | The service level dashboard. |

---

##### `node`<sup>Required</sup> <a name="node" id="@cdklabs/multi-az-observability.InstrumentedServiceMultiAZObservability.property.node"></a>

```typescript
public readonly node: Node;
```

- *Type:* constructs.Node

The tree node.

---

##### `perOperationZonalImpactAlarms`<sup>Required</sup> <a name="perOperationZonalImpactAlarms" id="@cdklabs/multi-az-observability.InstrumentedServiceMultiAZObservability.property.perOperationZonalImpactAlarms"></a>

```typescript
public readonly perOperationZonalImpactAlarms: {[ key: string ]: {[ key: string ]: IAlarm}};
```

- *Type:* {[ key: string ]: {[ key: string ]: aws-cdk-lib.aws_cloudwatch.IAlarm}}

Index into the dictionary by operation name, then by Availability Zone Id to get the alarms that indicate an AZ shows isolated impact from availability or latency as seen by either the server-side or canary.

These are the alarms
you would want to use to trigger automation to evacuate an AZ.

---

##### `serviceAlarms`<sup>Required</sup> <a name="serviceAlarms" id="@cdklabs/multi-az-observability.InstrumentedServiceMultiAZObservability.property.serviceAlarms"></a>

```typescript
public readonly serviceAlarms: IServiceAlarmsAndRules;
```

- *Type:* <a href="#@cdklabs/multi-az-observability.IServiceAlarmsAndRules">IServiceAlarmsAndRules</a>

The alarms and rules for the overall service.

---

##### `canaryLogGroup`<sup>Optional</sup> <a name="canaryLogGroup" id="@cdklabs/multi-az-observability.InstrumentedServiceMultiAZObservability.property.canaryLogGroup"></a>

```typescript
public readonly canaryLogGroup: ILogGroup;
```

- *Type:* aws-cdk-lib.aws_logs.ILogGroup
- *Default:* No log group is created if the canary is not requested.

If the service is configured to have canary tests created, this will be the log group where the canary's logs are stored.

---

##### `operationDashboards`<sup>Optional</sup> <a name="operationDashboards" id="@cdklabs/multi-az-observability.InstrumentedServiceMultiAZObservability.property.operationDashboards"></a>

```typescript
public readonly operationDashboards: Dashboard[];
```

- *Type:* aws-cdk-lib.aws_cloudwatch.Dashboard[]

The dashboards for each operation.

---

##### `serviceDashboard`<sup>Optional</sup> <a name="serviceDashboard" id="@cdklabs/multi-az-observability.InstrumentedServiceMultiAZObservability.property.serviceDashboard"></a>

```typescript
public readonly serviceDashboard: Dashboard;
```

- *Type:* aws-cdk-lib.aws_cloudwatch.Dashboard

The service level dashboard.

---


## Structs <a name="Structs" id="Structs"></a>

### AddCanaryTestProps <a name="AddCanaryTestProps" id="@cdklabs/multi-az-observability.AddCanaryTestProps"></a>

The props for requesting a canary be made for an operation.

#### Initializer <a name="Initializer" id="@cdklabs/multi-az-observability.AddCanaryTestProps.Initializer"></a>

```typescript
import { AddCanaryTestProps } from '@cdklabs/multi-az-observability'

const addCanaryTestProps: AddCanaryTestProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@cdklabs/multi-az-observability.AddCanaryTestProps.property.loadBalancer">loadBalancer</a></code> | <code>aws-cdk-lib.aws_elasticloadbalancingv2.ILoadBalancerV2</code> | The load balancer that will be tested against. |
| <code><a href="#@cdklabs/multi-az-observability.AddCanaryTestProps.property.requestCount">requestCount</a></code> | <code>number</code> | The number of requests to send on each test. |
| <code><a href="#@cdklabs/multi-az-observability.AddCanaryTestProps.property.schedule">schedule</a></code> | <code>string</code> | A schedule expression. |
| <code><a href="#@cdklabs/multi-az-observability.AddCanaryTestProps.property.headers">headers</a></code> | <code>{[ key: string ]: string}</code> | Any headers to include. |
| <code><a href="#@cdklabs/multi-az-observability.AddCanaryTestProps.property.httpMethods">httpMethods</a></code> | <code>string[]</code> | Defining this will override the methods defined in the operation and will use these instead. |
| <code><a href="#@cdklabs/multi-az-observability.AddCanaryTestProps.property.ignoreTlsErrors">ignoreTlsErrors</a></code> | <code>boolean</code> | Whether to ignore TLS validation errors. |
| <code><a href="#@cdklabs/multi-az-observability.AddCanaryTestProps.property.networkConfiguration">networkConfiguration</a></code> | <code><a href="#@cdklabs/multi-az-observability.NetworkConfigurationProps">NetworkConfigurationProps</a></code> | The VPC network configuration. |
| <code><a href="#@cdklabs/multi-az-observability.AddCanaryTestProps.property.postData">postData</a></code> | <code>string</code> | Data to supply in a POST, PUT, or PATCH operation. |
| <code><a href="#@cdklabs/multi-az-observability.AddCanaryTestProps.property.regionalRequestCount">regionalRequestCount</a></code> | <code>number</code> | Specifies a separate number of request to send to the regional endpoint. |
| <code><a href="#@cdklabs/multi-az-observability.AddCanaryTestProps.property.timeout">timeout</a></code> | <code>aws-cdk-lib.Duration</code> | The timeout for each individual HTTP request. |

---

##### `loadBalancer`<sup>Required</sup> <a name="loadBalancer" id="@cdklabs/multi-az-observability.AddCanaryTestProps.property.loadBalancer"></a>

```typescript
public readonly loadBalancer: ILoadBalancerV2;
```

- *Type:* aws-cdk-lib.aws_elasticloadbalancingv2.ILoadBalancerV2

The load balancer that will be tested against.

---

##### `requestCount`<sup>Required</sup> <a name="requestCount" id="@cdklabs/multi-az-observability.AddCanaryTestProps.property.requestCount"></a>

```typescript
public readonly requestCount: number;
```

- *Type:* number

The number of requests to send on each test.

---

##### `schedule`<sup>Required</sup> <a name="schedule" id="@cdklabs/multi-az-observability.AddCanaryTestProps.property.schedule"></a>

```typescript
public readonly schedule: string;
```

- *Type:* string

A schedule expression.

---

##### `headers`<sup>Optional</sup> <a name="headers" id="@cdklabs/multi-az-observability.AddCanaryTestProps.property.headers"></a>

```typescript
public readonly headers: {[ key: string ]: string};
```

- *Type:* {[ key: string ]: string}
- *Default:* No additional headers are added to the requests

Any headers to include.

---

##### `httpMethods`<sup>Optional</sup> <a name="httpMethods" id="@cdklabs/multi-az-observability.AddCanaryTestProps.property.httpMethods"></a>

```typescript
public readonly httpMethods: string[];
```

- *Type:* string[]
- *Default:* The operation's defined HTTP methods will be used to conduct the canary tests

Defining this will override the methods defined in the operation and will use these instead.

---

##### `ignoreTlsErrors`<sup>Optional</sup> <a name="ignoreTlsErrors" id="@cdklabs/multi-az-observability.AddCanaryTestProps.property.ignoreTlsErrors"></a>

```typescript
public readonly ignoreTlsErrors: boolean;
```

- *Type:* boolean
- *Default:* false

Whether to ignore TLS validation errors.

---

##### `networkConfiguration`<sup>Optional</sup> <a name="networkConfiguration" id="@cdklabs/multi-az-observability.AddCanaryTestProps.property.networkConfiguration"></a>

```typescript
public readonly networkConfiguration: NetworkConfigurationProps;
```

- *Type:* <a href="#@cdklabs/multi-az-observability.NetworkConfigurationProps">NetworkConfigurationProps</a>
- *Default:* The Lambda function is not run in a VPC

The VPC network configuration.

---

##### `postData`<sup>Optional</sup> <a name="postData" id="@cdklabs/multi-az-observability.AddCanaryTestProps.property.postData"></a>

```typescript
public readonly postData: string;
```

- *Type:* string
- *Default:* No data is sent in a POST, PUT, or PATCH request

Data to supply in a POST, PUT, or PATCH operation.

---

##### `regionalRequestCount`<sup>Optional</sup> <a name="regionalRequestCount" id="@cdklabs/multi-az-observability.AddCanaryTestProps.property.regionalRequestCount"></a>

```typescript
public readonly regionalRequestCount: number;
```

- *Type:* number
- *Default:* The same number of requests specified by the requestCount property is used.

Specifies a separate number of request to send to the regional endpoint.

---

##### `timeout`<sup>Optional</sup> <a name="timeout" id="@cdklabs/multi-az-observability.AddCanaryTestProps.property.timeout"></a>

```typescript
public readonly timeout: Duration;
```

- *Type:* aws-cdk-lib.Duration
- *Default:* Defaults to 2 seconds

The timeout for each individual HTTP request.

---

### AvailabilityZoneMapperProps <a name="AvailabilityZoneMapperProps" id="@cdklabs/multi-az-observability.AvailabilityZoneMapperProps"></a>

Properties for the AZ mapper.

#### Initializer <a name="Initializer" id="@cdklabs/multi-az-observability.AvailabilityZoneMapperProps.Initializer"></a>

```typescript
import { AvailabilityZoneMapperProps } from '@cdklabs/multi-az-observability'

const availabilityZoneMapperProps: AvailabilityZoneMapperProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@cdklabs/multi-az-observability.AvailabilityZoneMapperProps.property.availabilityZoneNames">availabilityZoneNames</a></code> | <code>string[]</code> | The currently in use Availability Zone names which constrains the list of AZ IDs that are returned. |

---

##### `availabilityZoneNames`<sup>Optional</sup> <a name="availabilityZoneNames" id="@cdklabs/multi-az-observability.AvailabilityZoneMapperProps.property.availabilityZoneNames"></a>

```typescript
public readonly availabilityZoneNames: string[];
```

- *Type:* string[]
- *Default:* No names are provided and the mapper returns all AZs in the region in its lists

The currently in use Availability Zone names which constrains the list of AZ IDs that are returned.

---

### BasicServiceMultiAZObservabilityProps <a name="BasicServiceMultiAZObservabilityProps" id="@cdklabs/multi-az-observability.BasicServiceMultiAZObservabilityProps"></a>

Properties for creating basic multi-AZ observability.

#### Initializer <a name="Initializer" id="@cdklabs/multi-az-observability.BasicServiceMultiAZObservabilityProps.Initializer"></a>

```typescript
import { BasicServiceMultiAZObservabilityProps } from '@cdklabs/multi-az-observability'

const basicServiceMultiAZObservabilityProps: BasicServiceMultiAZObservabilityProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@cdklabs/multi-az-observability.BasicServiceMultiAZObservabilityProps.property.datapointsToAlarm">datapointsToAlarm</a></code> | <code>number</code> | The number of datapoints to alarm on for latency and availability alarms. |
| <code><a href="#@cdklabs/multi-az-observability.BasicServiceMultiAZObservabilityProps.property.evaluationPeriods">evaluationPeriods</a></code> | <code>number</code> | The number of evaluation periods for latency and availabiltiy alarms. |
| <code><a href="#@cdklabs/multi-az-observability.BasicServiceMultiAZObservabilityProps.property.faultCountPercentageThreshold">faultCountPercentageThreshold</a></code> | <code>number</code> | The percentage of faults for a single ALB to consider an AZ to be unhealthy, this should align with your availability goal. |
| <code><a href="#@cdklabs/multi-az-observability.BasicServiceMultiAZObservabilityProps.property.latencyStatistic">latencyStatistic</a></code> | <code>string</code> | The statistic used to measure target response latency, like p99,  which can be specified using Stats.percentile(99) or "p99". |
| <code><a href="#@cdklabs/multi-az-observability.BasicServiceMultiAZObservabilityProps.property.latencyThreshold">latencyThreshold</a></code> | <code>number</code> | The threshold in seconds for ALB targets whose responses are slower than this value at the specified percentile statistic. |
| <code><a href="#@cdklabs/multi-az-observability.BasicServiceMultiAZObservabilityProps.property.serviceName">serviceName</a></code> | <code>string</code> | The service's name. |
| <code><a href="#@cdklabs/multi-az-observability.BasicServiceMultiAZObservabilityProps.property.applicationLoadBalancers">applicationLoadBalancers</a></code> | <code>aws-cdk-lib.aws_elasticloadbalancingv2.IApplicationLoadBalancer[]</code> | The application load balancers being used by the service. |
| <code><a href="#@cdklabs/multi-az-observability.BasicServiceMultiAZObservabilityProps.property.assetsBucketParameterName">assetsBucketParameterName</a></code> | <code>string</code> | If you are not using a static bucket to deploy assets, for example you are synthing this and it gets uploaded to a bucket whose name is unknown to you (maybe used as part of a central CI/CD system) and is provided as a parameter to your stack, specify that parameter name here. |
| <code><a href="#@cdklabs/multi-az-observability.BasicServiceMultiAZObservabilityProps.property.assetsBucketPrefixParameterName">assetsBucketPrefixParameterName</a></code> | <code>string</code> | If you are not using a static bucket to deploy assets, for example you are synthing this and it gets uploaded to a bucket that uses a prefix that is unknown to you (maybe used as part of a central CI/CD system) and is provided as a parameter to your stack, specify that parameter name here. |
| <code><a href="#@cdklabs/multi-az-observability.BasicServiceMultiAZObservabilityProps.property.createDashboard">createDashboard</a></code> | <code>boolean</code> | Whether to create a dashboard displaying the metrics and alarms. |
| <code><a href="#@cdklabs/multi-az-observability.BasicServiceMultiAZObservabilityProps.property.interval">interval</a></code> | <code>aws-cdk-lib.Duration</code> | Dashboard interval. |
| <code><a href="#@cdklabs/multi-az-observability.BasicServiceMultiAZObservabilityProps.property.latencyOutlierCalculation">latencyOutlierCalculation</a></code> | <code><a href="#@cdklabs/multi-az-observability.ApplicationLoadBalancerLatencyOutlierCalculation">ApplicationLoadBalancerLatencyOutlierCalculation</a></code> | The method used to determine if an AZ is an outlier for latency for Application Load Balancer metrics. |
| <code><a href="#@cdklabs/multi-az-observability.BasicServiceMultiAZObservabilityProps.property.natGateways">natGateways</a></code> | <code>{[ key: string ]: aws-cdk-lib.aws_ec2.CfnNatGateway[]}</code> | (Optional) A map of Availability Zone name to the NAT Gateways in that AZ. |
| <code><a href="#@cdklabs/multi-az-observability.BasicServiceMultiAZObservabilityProps.property.packetLossImpactPercentageThreshold">packetLossImpactPercentageThreshold</a></code> | <code>number</code> | The amount of packet loss in a NAT GW to determine if an AZ is actually impacted, recommendation is 0.01%. |
| <code><a href="#@cdklabs/multi-az-observability.BasicServiceMultiAZObservabilityProps.property.period">period</a></code> | <code>aws-cdk-lib.Duration</code> | The period to evaluate metrics. |

---

##### `datapointsToAlarm`<sup>Required</sup> <a name="datapointsToAlarm" id="@cdklabs/multi-az-observability.BasicServiceMultiAZObservabilityProps.property.datapointsToAlarm"></a>

```typescript
public readonly datapointsToAlarm: number;
```

- *Type:* number

The number of datapoints to alarm on for latency and availability alarms.

---

##### `evaluationPeriods`<sup>Required</sup> <a name="evaluationPeriods" id="@cdklabs/multi-az-observability.BasicServiceMultiAZObservabilityProps.property.evaluationPeriods"></a>

```typescript
public readonly evaluationPeriods: number;
```

- *Type:* number

The number of evaluation periods for latency and availabiltiy alarms.

---

##### `faultCountPercentageThreshold`<sup>Required</sup> <a name="faultCountPercentageThreshold" id="@cdklabs/multi-az-observability.BasicServiceMultiAZObservabilityProps.property.faultCountPercentageThreshold"></a>

```typescript
public readonly faultCountPercentageThreshold: number;
```

- *Type:* number

The percentage of faults for a single ALB to consider an AZ to be unhealthy, this should align with your availability goal.

For example
1% or 5%, specify as 1 or 5.

---

##### `latencyStatistic`<sup>Required</sup> <a name="latencyStatistic" id="@cdklabs/multi-az-observability.BasicServiceMultiAZObservabilityProps.property.latencyStatistic"></a>

```typescript
public readonly latencyStatistic: string;
```

- *Type:* string

The statistic used to measure target response latency, like p99,  which can be specified using Stats.percentile(99) or "p99".

---

##### `latencyThreshold`<sup>Required</sup> <a name="latencyThreshold" id="@cdklabs/multi-az-observability.BasicServiceMultiAZObservabilityProps.property.latencyThreshold"></a>

```typescript
public readonly latencyThreshold: number;
```

- *Type:* number

The threshold in seconds for ALB targets whose responses are slower than this value at the specified percentile statistic.

---

##### `serviceName`<sup>Required</sup> <a name="serviceName" id="@cdklabs/multi-az-observability.BasicServiceMultiAZObservabilityProps.property.serviceName"></a>

```typescript
public readonly serviceName: string;
```

- *Type:* string

The service's name.

---

##### `applicationLoadBalancers`<sup>Optional</sup> <a name="applicationLoadBalancers" id="@cdklabs/multi-az-observability.BasicServiceMultiAZObservabilityProps.property.applicationLoadBalancers"></a>

```typescript
public readonly applicationLoadBalancers: IApplicationLoadBalancer[];
```

- *Type:* aws-cdk-lib.aws_elasticloadbalancingv2.IApplicationLoadBalancer[]
- *Default:* "No alarms for ALBs will be created"

The application load balancers being used by the service.

There will be an alarm created for 
each AZ for each ALB. Then, there will be a composite alarm for AZ created from the input
of all ALBs. You must either specify an ALB or a NAT GW.

---

##### `assetsBucketParameterName`<sup>Optional</sup> <a name="assetsBucketParameterName" id="@cdklabs/multi-az-observability.BasicServiceMultiAZObservabilityProps.property.assetsBucketParameterName"></a>

```typescript
public readonly assetsBucketParameterName: string;
```

- *Type:* string
- *Default:* "The assets will be uploaded to the default defined asset location."

If you are not using a static bucket to deploy assets, for example you are synthing this and it gets uploaded to a bucket whose name is unknown to you (maybe used as part of a central CI/CD system) and is provided as a parameter to your stack, specify that parameter name here.

It will override the bucket location CDK provides by
default for bundled assets. The stack containing this contruct needs
to have a parameter defined that uses this name. The underlying
stacks in this construct that deploy assets will copy the parent stack's
value for this property.

---

##### `assetsBucketPrefixParameterName`<sup>Optional</sup> <a name="assetsBucketPrefixParameterName" id="@cdklabs/multi-az-observability.BasicServiceMultiAZObservabilityProps.property.assetsBucketPrefixParameterName"></a>

```typescript
public readonly assetsBucketPrefixParameterName: string;
```

- *Type:* string
- *Default:* "No object prefix will be added to your custom assets location. However, if you have overridden something like the 'BucketPrefix' property in your stack synthesizer with a variable like '${AssetsBucketPrefix}', you will need to define this property so it doesn't cause a reference error even if the prefix value is blank."

If you are not using a static bucket to deploy assets, for example you are synthing this and it gets uploaded to a bucket that uses a prefix that is unknown to you (maybe used as part of a central CI/CD system) and is provided as a parameter to your stack, specify that parameter name here.

It will override the bucket prefix CDK provides by
default for bundled assets. This property only takes effect if you
defined the assetsBucketParameterName. The stack containing this contruct needs
to have a parameter defined that uses this name. The underlying
stacks in this construct that deploy assets will copy the parent stack's
value for this property.

---

##### `createDashboard`<sup>Optional</sup> <a name="createDashboard" id="@cdklabs/multi-az-observability.BasicServiceMultiAZObservabilityProps.property.createDashboard"></a>

```typescript
public readonly createDashboard: boolean;
```

- *Type:* boolean
- *Default:* false

Whether to create a dashboard displaying the metrics and alarms.

---

##### `interval`<sup>Optional</sup> <a name="interval" id="@cdklabs/multi-az-observability.BasicServiceMultiAZObservabilityProps.property.interval"></a>

```typescript
public readonly interval: Duration;
```

- *Type:* aws-cdk-lib.Duration
- *Default:* Duration.hours(1)

Dashboard interval.

---

##### `latencyOutlierCalculation`<sup>Optional</sup> <a name="latencyOutlierCalculation" id="@cdklabs/multi-az-observability.BasicServiceMultiAZObservabilityProps.property.latencyOutlierCalculation"></a>

```typescript
public readonly latencyOutlierCalculation: ApplicationLoadBalancerLatencyOutlierCalculation;
```

- *Type:* <a href="#@cdklabs/multi-az-observability.ApplicationLoadBalancerLatencyOutlierCalculation">ApplicationLoadBalancerLatencyOutlierCalculation</a>
- *Default:* Z_SCORE

The method used to determine if an AZ is an outlier for latency for Application Load Balancer metrics.

---

##### `natGateways`<sup>Optional</sup> <a name="natGateways" id="@cdklabs/multi-az-observability.BasicServiceMultiAZObservabilityProps.property.natGateways"></a>

```typescript
public readonly natGateways: {[ key: string ]: CfnNatGateway[]};
```

- *Type:* {[ key: string ]: aws-cdk-lib.aws_ec2.CfnNatGateway[]}
- *Default:* "No alarms for NAT Gateways will be created"

(Optional) A map of Availability Zone name to the NAT Gateways in that AZ.

One alarm per NAT GW will be created. If multiple NAT GWs
are provided for a single AZ, those alarms will be aggregated into
a composite alarm for the AZ. You must either specify an ALB or a NAT GW.

---

##### `packetLossImpactPercentageThreshold`<sup>Optional</sup> <a name="packetLossImpactPercentageThreshold" id="@cdklabs/multi-az-observability.BasicServiceMultiAZObservabilityProps.property.packetLossImpactPercentageThreshold"></a>

```typescript
public readonly packetLossImpactPercentageThreshold: number;
```

- *Type:* number
- *Default:* "0.01 (as in 0.01%)"

The amount of packet loss in a NAT GW to determine if an AZ is actually impacted, recommendation is 0.01%.

---

##### `period`<sup>Optional</sup> <a name="period" id="@cdklabs/multi-az-observability.BasicServiceMultiAZObservabilityProps.property.period"></a>

```typescript
public readonly period: Duration;
```

- *Type:* aws-cdk-lib.Duration
- *Default:* Duration.minutes(1)

The period to evaluate metrics.

---

### CanaryMetricProps <a name="CanaryMetricProps" id="@cdklabs/multi-az-observability.CanaryMetricProps"></a>

Properties for canary metrics in an operation.

#### Initializer <a name="Initializer" id="@cdklabs/multi-az-observability.CanaryMetricProps.Initializer"></a>

```typescript
import { CanaryMetricProps } from '@cdklabs/multi-az-observability'

const canaryMetricProps: CanaryMetricProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@cdklabs/multi-az-observability.CanaryMetricProps.property.canaryAvailabilityMetricDetails">canaryAvailabilityMetricDetails</a></code> | <code><a href="#@cdklabs/multi-az-observability.IOperationMetricDetails">IOperationMetricDetails</a></code> | The canary availability metric details. |
| <code><a href="#@cdklabs/multi-az-observability.CanaryMetricProps.property.canaryLatencyMetricDetails">canaryLatencyMetricDetails</a></code> | <code><a href="#@cdklabs/multi-az-observability.IOperationMetricDetails">IOperationMetricDetails</a></code> | The canary latency metric details. |

---

##### `canaryAvailabilityMetricDetails`<sup>Required</sup> <a name="canaryAvailabilityMetricDetails" id="@cdklabs/multi-az-observability.CanaryMetricProps.property.canaryAvailabilityMetricDetails"></a>

```typescript
public readonly canaryAvailabilityMetricDetails: IOperationMetricDetails;
```

- *Type:* <a href="#@cdklabs/multi-az-observability.IOperationMetricDetails">IOperationMetricDetails</a>

The canary availability metric details.

---

##### `canaryLatencyMetricDetails`<sup>Required</sup> <a name="canaryLatencyMetricDetails" id="@cdklabs/multi-az-observability.CanaryMetricProps.property.canaryLatencyMetricDetails"></a>

```typescript
public readonly canaryLatencyMetricDetails: IOperationMetricDetails;
```

- *Type:* <a href="#@cdklabs/multi-az-observability.IOperationMetricDetails">IOperationMetricDetails</a>

The canary latency metric details.

---

### CanaryTestMetricsOverrideProps <a name="CanaryTestMetricsOverrideProps" id="@cdklabs/multi-az-observability.CanaryTestMetricsOverrideProps"></a>

The properties for creating an override.

#### Initializer <a name="Initializer" id="@cdklabs/multi-az-observability.CanaryTestMetricsOverrideProps.Initializer"></a>

```typescript
import { CanaryTestMetricsOverrideProps } from '@cdklabs/multi-az-observability'

const canaryTestMetricsOverrideProps: CanaryTestMetricsOverrideProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@cdklabs/multi-az-observability.CanaryTestMetricsOverrideProps.property.alarmStatistic">alarmStatistic</a></code> | <code>string</code> | The statistic used for alarms, for availability metrics this should be "Sum", for latency metrics it could something like "p99" or "p99.9". |
| <code><a href="#@cdklabs/multi-az-observability.CanaryTestMetricsOverrideProps.property.datapointsToAlarm">datapointsToAlarm</a></code> | <code>number</code> | The number of datapoints to alarm on for latency and availability alarms. |
| <code><a href="#@cdklabs/multi-az-observability.CanaryTestMetricsOverrideProps.property.evaluationPeriods">evaluationPeriods</a></code> | <code>number</code> | The number of evaluation periods for latency and availabiltiy alarms. |
| <code><a href="#@cdklabs/multi-az-observability.CanaryTestMetricsOverrideProps.property.faultAlarmThreshold">faultAlarmThreshold</a></code> | <code>number</code> | The threshold for alarms associated with fault metrics, for example if measuring fault rate, the threshold may be 1, meaning you would want an alarm that triggers if the fault rate goes above 1%. |
| <code><a href="#@cdklabs/multi-az-observability.CanaryTestMetricsOverrideProps.property.period">period</a></code> | <code>aws-cdk-lib.Duration</code> | The period for the metrics. |
| <code><a href="#@cdklabs/multi-az-observability.CanaryTestMetricsOverrideProps.property.successAlarmThreshold">successAlarmThreshold</a></code> | <code>number</code> | The threshold for alarms associated with success metrics, for example if measuring success rate, the threshold may be 99, meaning you would want an alarm that triggers if success drops below 99%. |

---

##### `alarmStatistic`<sup>Optional</sup> <a name="alarmStatistic" id="@cdklabs/multi-az-observability.CanaryTestMetricsOverrideProps.property.alarmStatistic"></a>

```typescript
public readonly alarmStatistic: string;
```

- *Type:* string
- *Default:* This property will use the default defined for the service

The statistic used for alarms, for availability metrics this should be "Sum", for latency metrics it could something like "p99" or "p99.9".

---

##### `datapointsToAlarm`<sup>Optional</sup> <a name="datapointsToAlarm" id="@cdklabs/multi-az-observability.CanaryTestMetricsOverrideProps.property.datapointsToAlarm"></a>

```typescript
public readonly datapointsToAlarm: number;
```

- *Type:* number
- *Default:* This property will use the default defined for the service

The number of datapoints to alarm on for latency and availability alarms.

---

##### `evaluationPeriods`<sup>Optional</sup> <a name="evaluationPeriods" id="@cdklabs/multi-az-observability.CanaryTestMetricsOverrideProps.property.evaluationPeriods"></a>

```typescript
public readonly evaluationPeriods: number;
```

- *Type:* number
- *Default:* This property will use the default defined for the service

The number of evaluation periods for latency and availabiltiy alarms.

---

##### `faultAlarmThreshold`<sup>Optional</sup> <a name="faultAlarmThreshold" id="@cdklabs/multi-az-observability.CanaryTestMetricsOverrideProps.property.faultAlarmThreshold"></a>

```typescript
public readonly faultAlarmThreshold: number;
```

- *Type:* number
- *Default:* This property will use the default defined for the service

The threshold for alarms associated with fault metrics, for example if measuring fault rate, the threshold may be 1, meaning you would want an alarm that triggers if the fault rate goes above 1%.

---

##### `period`<sup>Optional</sup> <a name="period" id="@cdklabs/multi-az-observability.CanaryTestMetricsOverrideProps.property.period"></a>

```typescript
public readonly period: Duration;
```

- *Type:* aws-cdk-lib.Duration
- *Default:* This property will use the default defined for the service

The period for the metrics.

---

##### `successAlarmThreshold`<sup>Optional</sup> <a name="successAlarmThreshold" id="@cdklabs/multi-az-observability.CanaryTestMetricsOverrideProps.property.successAlarmThreshold"></a>

```typescript
public readonly successAlarmThreshold: number;
```

- *Type:* number
- *Default:* This property will use the default defined for the service

The threshold for alarms associated with success metrics, for example if measuring success rate, the threshold may be 99, meaning you would want an alarm that triggers if success drops below 99%.

---

### ContributorInsightRuleDetailsProps <a name="ContributorInsightRuleDetailsProps" id="@cdklabs/multi-az-observability.ContributorInsightRuleDetailsProps"></a>

The contributor insight rule details properties.

#### Initializer <a name="Initializer" id="@cdklabs/multi-az-observability.ContributorInsightRuleDetailsProps.Initializer"></a>

```typescript
import { ContributorInsightRuleDetailsProps } from '@cdklabs/multi-az-observability'

const contributorInsightRuleDetailsProps: ContributorInsightRuleDetailsProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@cdklabs/multi-az-observability.ContributorInsightRuleDetailsProps.property.availabilityZoneIdJsonPath">availabilityZoneIdJsonPath</a></code> | <code>string</code> | The path in the log files to the field that identifies the Availability Zone Id that the request was handled in, for example { "AZ-ID": "use1-az1" } would have a path of $.AZ-ID. |
| <code><a href="#@cdklabs/multi-az-observability.ContributorInsightRuleDetailsProps.property.faultMetricJsonPath">faultMetricJsonPath</a></code> | <code>string</code> | The path in the log files to the field that identifies if the response resulted in a fault, for example { "Fault" : 1 } would have a path of $.Fault. |
| <code><a href="#@cdklabs/multi-az-observability.ContributorInsightRuleDetailsProps.property.instanceIdJsonPath">instanceIdJsonPath</a></code> | <code>string</code> | The JSON path to the instance id field in the log files, only required for server-side rules. |
| <code><a href="#@cdklabs/multi-az-observability.ContributorInsightRuleDetailsProps.property.logGroups">logGroups</a></code> | <code>aws-cdk-lib.aws_logs.ILogGroup[]</code> | The log groups where CloudWatch logs for the operation are located. |
| <code><a href="#@cdklabs/multi-az-observability.ContributorInsightRuleDetailsProps.property.operationNameJsonPath">operationNameJsonPath</a></code> | <code>string</code> | The path in the log files to the field that identifies the operation the log file is for. |
| <code><a href="#@cdklabs/multi-az-observability.ContributorInsightRuleDetailsProps.property.successLatencyMetricJsonPath">successLatencyMetricJsonPath</a></code> | <code>string</code> | The path in the log files to the field that indicates the latency for the response. |

---

##### `availabilityZoneIdJsonPath`<sup>Required</sup> <a name="availabilityZoneIdJsonPath" id="@cdklabs/multi-az-observability.ContributorInsightRuleDetailsProps.property.availabilityZoneIdJsonPath"></a>

```typescript
public readonly availabilityZoneIdJsonPath: string;
```

- *Type:* string

The path in the log files to the field that identifies the Availability Zone Id that the request was handled in, for example { "AZ-ID": "use1-az1" } would have a path of $.AZ-ID.

---

##### `faultMetricJsonPath`<sup>Required</sup> <a name="faultMetricJsonPath" id="@cdklabs/multi-az-observability.ContributorInsightRuleDetailsProps.property.faultMetricJsonPath"></a>

```typescript
public readonly faultMetricJsonPath: string;
```

- *Type:* string

The path in the log files to the field that identifies if the response resulted in a fault, for example { "Fault" : 1 } would have a path of $.Fault.

---

##### `instanceIdJsonPath`<sup>Required</sup> <a name="instanceIdJsonPath" id="@cdklabs/multi-az-observability.ContributorInsightRuleDetailsProps.property.instanceIdJsonPath"></a>

```typescript
public readonly instanceIdJsonPath: string;
```

- *Type:* string

The JSON path to the instance id field in the log files, only required for server-side rules.

---

##### `logGroups`<sup>Required</sup> <a name="logGroups" id="@cdklabs/multi-az-observability.ContributorInsightRuleDetailsProps.property.logGroups"></a>

```typescript
public readonly logGroups: ILogGroup[];
```

- *Type:* aws-cdk-lib.aws_logs.ILogGroup[]

The log groups where CloudWatch logs for the operation are located.

If
this is not provided, Contributor Insight rules cannot be created.

---

##### `operationNameJsonPath`<sup>Required</sup> <a name="operationNameJsonPath" id="@cdklabs/multi-az-observability.ContributorInsightRuleDetailsProps.property.operationNameJsonPath"></a>

```typescript
public readonly operationNameJsonPath: string;
```

- *Type:* string

The path in the log files to the field that identifies the operation the log file is for.

---

##### `successLatencyMetricJsonPath`<sup>Required</sup> <a name="successLatencyMetricJsonPath" id="@cdklabs/multi-az-observability.ContributorInsightRuleDetailsProps.property.successLatencyMetricJsonPath"></a>

```typescript
public readonly successLatencyMetricJsonPath: string;
```

- *Type:* string

The path in the log files to the field that indicates the latency for the response.

This could either be success latency or fault
latency depending on the alarms and rules you are creating.

---

### InstrumentedServiceMultiAZObservabilityProps <a name="InstrumentedServiceMultiAZObservabilityProps" id="@cdklabs/multi-az-observability.InstrumentedServiceMultiAZObservabilityProps"></a>

The properties for adding alarms and dashboards for an instrumented service.

#### Initializer <a name="Initializer" id="@cdklabs/multi-az-observability.InstrumentedServiceMultiAZObservabilityProps.Initializer"></a>

```typescript
import { InstrumentedServiceMultiAZObservabilityProps } from '@cdklabs/multi-az-observability'

const instrumentedServiceMultiAZObservabilityProps: InstrumentedServiceMultiAZObservabilityProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@cdklabs/multi-az-observability.InstrumentedServiceMultiAZObservabilityProps.property.outlierDetectionAlgorithm">outlierDetectionAlgorithm</a></code> | <code><a href="#@cdklabs/multi-az-observability.OutlierDetectionAlgorithm">OutlierDetectionAlgorithm</a></code> | The algorithm to use for performing outlier detection. |
| <code><a href="#@cdklabs/multi-az-observability.InstrumentedServiceMultiAZObservabilityProps.property.service">service</a></code> | <code><a href="#@cdklabs/multi-az-observability.IService">IService</a></code> | The service that the alarms and dashboards are being crated for. |
| <code><a href="#@cdklabs/multi-az-observability.InstrumentedServiceMultiAZObservabilityProps.property.assetsBucketParameterName">assetsBucketParameterName</a></code> | <code>string</code> | If you are not using a static bucket to deploy assets, for example you are synthing this and it gets uploaded to a bucket whose name is unknown to you (maybe used as part of a central CI/CD system) and is provided as a parameter to your stack, specify that parameter name here. |
| <code><a href="#@cdklabs/multi-az-observability.InstrumentedServiceMultiAZObservabilityProps.property.assetsBucketPrefixParameterName">assetsBucketPrefixParameterName</a></code> | <code>string</code> | If you are not using a static bucket to deploy assets, for example you are synthing this and it gets uploaded to a bucket that uses a prefix that is unknown to you (maybe used as part of a central CI/CD system) and is provided as a parameter to your stack, specify that parameter name here. |
| <code><a href="#@cdklabs/multi-az-observability.InstrumentedServiceMultiAZObservabilityProps.property.createDashboards">createDashboards</a></code> | <code>boolean</code> | Indicates whether to create per operation and overall service dashboards. |
| <code><a href="#@cdklabs/multi-az-observability.InstrumentedServiceMultiAZObservabilityProps.property.interval">interval</a></code> | <code>aws-cdk-lib.Duration</code> | The interval used in the dashboard, defaults to 60 minutes. |
| <code><a href="#@cdklabs/multi-az-observability.InstrumentedServiceMultiAZObservabilityProps.property.outlierThreshold">outlierThreshold</a></code> | <code>number</code> | The outlier threshold for determining if an AZ is an outlier for latency or faults. |

---

##### `outlierDetectionAlgorithm`<sup>Required</sup> <a name="outlierDetectionAlgorithm" id="@cdklabs/multi-az-observability.InstrumentedServiceMultiAZObservabilityProps.property.outlierDetectionAlgorithm"></a>

```typescript
public readonly outlierDetectionAlgorithm: OutlierDetectionAlgorithm;
```

- *Type:* <a href="#@cdklabs/multi-az-observability.OutlierDetectionAlgorithm">OutlierDetectionAlgorithm</a>

The algorithm to use for performing outlier detection.

---

##### `service`<sup>Required</sup> <a name="service" id="@cdklabs/multi-az-observability.InstrumentedServiceMultiAZObservabilityProps.property.service"></a>

```typescript
public readonly service: IService;
```

- *Type:* <a href="#@cdklabs/multi-az-observability.IService">IService</a>

The service that the alarms and dashboards are being crated for.

---

##### `assetsBucketParameterName`<sup>Optional</sup> <a name="assetsBucketParameterName" id="@cdklabs/multi-az-observability.InstrumentedServiceMultiAZObservabilityProps.property.assetsBucketParameterName"></a>

```typescript
public readonly assetsBucketParameterName: string;
```

- *Type:* string
- *Default:* The assets will be uploaded to the default defined asset location.

If you are not using a static bucket to deploy assets, for example you are synthing this and it gets uploaded to a bucket whose name is unknown to you (maybe used as part of a central CI/CD system) and is provided as a parameter to your stack, specify that parameter name here.

It will override the bucket location CDK provides by
default for bundled assets. The stack containing this contruct needs
to have a parameter defined that uses this name. The underlying
stacks in this construct that deploy assets will copy the parent stack's
value for this property.

---

##### `assetsBucketPrefixParameterName`<sup>Optional</sup> <a name="assetsBucketPrefixParameterName" id="@cdklabs/multi-az-observability.InstrumentedServiceMultiAZObservabilityProps.property.assetsBucketPrefixParameterName"></a>

```typescript
public readonly assetsBucketPrefixParameterName: string;
```

- *Type:* string
- *Default:* No object prefix will be added to your custom assets location. However, if you have overridden something like the 'BucketPrefix' property in your stack synthesizer with a variable like "${AssetsBucketPrefix", you will need to define this property so it doesn't cause a reference error even if the prefix value is blank.

If you are not using a static bucket to deploy assets, for example you are synthing this and it gets uploaded to a bucket that uses a prefix that is unknown to you (maybe used as part of a central CI/CD system) and is provided as a parameter to your stack, specify that parameter name here.

It will override the bucket prefix CDK provides by
default for bundled assets. This property only takes effect if you
defined the assetsBucketParameterName. The stack containing this contruct needs
to have a parameter defined that uses this name. The underlying
stacks in this construct that deploy assets will copy the parent stack's
value for this property.

---

##### `createDashboards`<sup>Optional</sup> <a name="createDashboards" id="@cdklabs/multi-az-observability.InstrumentedServiceMultiAZObservabilityProps.property.createDashboards"></a>

```typescript
public readonly createDashboards: boolean;
```

- *Type:* boolean
- *Default:* No dashboards are created

Indicates whether to create per operation and overall service dashboards.

---

##### `interval`<sup>Optional</sup> <a name="interval" id="@cdklabs/multi-az-observability.InstrumentedServiceMultiAZObservabilityProps.property.interval"></a>

```typescript
public readonly interval: Duration;
```

- *Type:* aws-cdk-lib.Duration
- *Default:* 60 minutes

The interval used in the dashboard, defaults to 60 minutes.

---

##### `outlierThreshold`<sup>Optional</sup> <a name="outlierThreshold" id="@cdklabs/multi-az-observability.InstrumentedServiceMultiAZObservabilityProps.property.outlierThreshold"></a>

```typescript
public readonly outlierThreshold: number;
```

- *Type:* number
- *Default:* Depends on the outlier detection algorithm selected

The outlier threshold for determining if an AZ is an outlier for latency or faults.

This number is interpreted
differently for different outlier algorithms. When used with
STATIC, the number should be between 0 and 1 to represent the
percentage of errors (like .7) that an AZ must be responsible
for to be considered an outlier. When used with CHI_SQUARED, it
represents the p value that indicates statistical significance, like
0.05 which means the skew has less than or equal to a 5% chance of
occuring. When used with Z_SCORE it indicates how many standard
deviations to evaluate for an AZ being an outlier, typically 3 is
standard for Z_SCORE.

Standard defaults based on the outlier detection algorithm:
STATIC: 0.7
CHI_SQUARED: 0.05
Z_SCORE: 2
IQR: 1.5
MAD: 3

---

### NetworkConfigurationProps <a name="NetworkConfigurationProps" id="@cdklabs/multi-az-observability.NetworkConfigurationProps"></a>

The network configuration for the canary function.

#### Initializer <a name="Initializer" id="@cdklabs/multi-az-observability.NetworkConfigurationProps.Initializer"></a>

```typescript
import { NetworkConfigurationProps } from '@cdklabs/multi-az-observability'

const networkConfigurationProps: NetworkConfigurationProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@cdklabs/multi-az-observability.NetworkConfigurationProps.property.subnetSelection">subnetSelection</a></code> | <code>aws-cdk-lib.aws_ec2.SubnetSelection</code> | The subnets the Lambda function will be deployed in the VPC. |
| <code><a href="#@cdklabs/multi-az-observability.NetworkConfigurationProps.property.vpc">vpc</a></code> | <code>aws-cdk-lib.aws_ec2.IVpc</code> | The VPC to run the canary in. |

---

##### `subnetSelection`<sup>Required</sup> <a name="subnetSelection" id="@cdklabs/multi-az-observability.NetworkConfigurationProps.property.subnetSelection"></a>

```typescript
public readonly subnetSelection: SubnetSelection;
```

- *Type:* aws-cdk-lib.aws_ec2.SubnetSelection

The subnets the Lambda function will be deployed in the VPC.

---

##### `vpc`<sup>Required</sup> <a name="vpc" id="@cdklabs/multi-az-observability.NetworkConfigurationProps.property.vpc"></a>

```typescript
public readonly vpc: IVpc;
```

- *Type:* aws-cdk-lib.aws_ec2.IVpc

The VPC to run the canary in.

A security group will be created
that allows the function to communicate with the VPC as well
as the required IAM permissions.

---

### OperationMetricDetailsProps <a name="OperationMetricDetailsProps" id="@cdklabs/multi-az-observability.OperationMetricDetailsProps"></a>

The properties for operation metric details.

#### Initializer <a name="Initializer" id="@cdklabs/multi-az-observability.OperationMetricDetailsProps.Initializer"></a>

```typescript
import { OperationMetricDetailsProps } from '@cdklabs/multi-az-observability'

const operationMetricDetailsProps: OperationMetricDetailsProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@cdklabs/multi-az-observability.OperationMetricDetailsProps.property.metricDimensions">metricDimensions</a></code> | <code><a href="#@cdklabs/multi-az-observability.MetricDimensions">MetricDimensions</a></code> | The user implemented functions for providing the metric's dimensions. |
| <code><a href="#@cdklabs/multi-az-observability.OperationMetricDetailsProps.property.operationName">operationName</a></code> | <code>string</code> | The operation these metric details are for. |
| <code><a href="#@cdklabs/multi-az-observability.OperationMetricDetailsProps.property.alarmStatistic">alarmStatistic</a></code> | <code>string</code> | The statistic used for alarms, for availability metrics this should be "Sum", for latency metrics it could something like "p99" or "p99.9". |
| <code><a href="#@cdklabs/multi-az-observability.OperationMetricDetailsProps.property.datapointsToAlarm">datapointsToAlarm</a></code> | <code>number</code> | The number of datapoints to alarm on for latency and availability alarms. |
| <code><a href="#@cdklabs/multi-az-observability.OperationMetricDetailsProps.property.evaluationPeriods">evaluationPeriods</a></code> | <code>number</code> | The number of evaluation periods for latency and availabiltiy alarms. |
| <code><a href="#@cdklabs/multi-az-observability.OperationMetricDetailsProps.property.faultAlarmThreshold">faultAlarmThreshold</a></code> | <code>number</code> | The threshold for alarms associated with fault metrics, for example if measuring fault rate, the threshold may be 1, meaning you would want an alarm that triggers if the fault rate goes above 1%. |
| <code><a href="#@cdklabs/multi-az-observability.OperationMetricDetailsProps.property.faultMetricNames">faultMetricNames</a></code> | <code>string[]</code> | The names of fault indicating metrics. |
| <code><a href="#@cdklabs/multi-az-observability.OperationMetricDetailsProps.property.graphedFaultStatistics">graphedFaultStatistics</a></code> | <code>string[]</code> | The statistics for faults you want to appear on dashboards, for example, with latency metrics, you might want p50, p99, and tm99. |
| <code><a href="#@cdklabs/multi-az-observability.OperationMetricDetailsProps.property.graphedSuccessStatistics">graphedSuccessStatistics</a></code> | <code>string[]</code> | The statistics for successes you want to appear on dashboards, for example, with latency metrics, you might want p50, p99, and tm99. |
| <code><a href="#@cdklabs/multi-az-observability.OperationMetricDetailsProps.property.metricNamespace">metricNamespace</a></code> | <code>string</code> | The CloudWatch metric namespace for these metrics. |
| <code><a href="#@cdklabs/multi-az-observability.OperationMetricDetailsProps.property.period">period</a></code> | <code>aws-cdk-lib.Duration</code> | The period for the metrics. |
| <code><a href="#@cdklabs/multi-az-observability.OperationMetricDetailsProps.property.successAlarmThreshold">successAlarmThreshold</a></code> | <code>number</code> | The threshold for alarms associated with success metrics, for example if measuring success rate, the threshold may be 99, meaning you would want an alarm that triggers if success drops below 99%. |
| <code><a href="#@cdklabs/multi-az-observability.OperationMetricDetailsProps.property.successMetricNames">successMetricNames</a></code> | <code>string[]</code> | The names of success indicating metrics. |
| <code><a href="#@cdklabs/multi-az-observability.OperationMetricDetailsProps.property.unit">unit</a></code> | <code>aws-cdk-lib.aws_cloudwatch.Unit</code> | The unit used for these metrics. |

---

##### `metricDimensions`<sup>Required</sup> <a name="metricDimensions" id="@cdklabs/multi-az-observability.OperationMetricDetailsProps.property.metricDimensions"></a>

```typescript
public readonly metricDimensions: MetricDimensions;
```

- *Type:* <a href="#@cdklabs/multi-az-observability.MetricDimensions">MetricDimensions</a>

The user implemented functions for providing the metric's dimensions.

---

##### `operationName`<sup>Required</sup> <a name="operationName" id="@cdklabs/multi-az-observability.OperationMetricDetailsProps.property.operationName"></a>

```typescript
public readonly operationName: string;
```

- *Type:* string

The operation these metric details are for.

---

##### `alarmStatistic`<sup>Optional</sup> <a name="alarmStatistic" id="@cdklabs/multi-az-observability.OperationMetricDetailsProps.property.alarmStatistic"></a>

```typescript
public readonly alarmStatistic: string;
```

- *Type:* string
- *Default:* The service default is used

The statistic used for alarms, for availability metrics this should be "Sum", for latency metrics it could something like "p99" or "p99.9".

---

##### `datapointsToAlarm`<sup>Optional</sup> <a name="datapointsToAlarm" id="@cdklabs/multi-az-observability.OperationMetricDetailsProps.property.datapointsToAlarm"></a>

```typescript
public readonly datapointsToAlarm: number;
```

- *Type:* number
- *Default:* The service default is used

The number of datapoints to alarm on for latency and availability alarms.

---

##### `evaluationPeriods`<sup>Optional</sup> <a name="evaluationPeriods" id="@cdklabs/multi-az-observability.OperationMetricDetailsProps.property.evaluationPeriods"></a>

```typescript
public readonly evaluationPeriods: number;
```

- *Type:* number
- *Default:* The service default is used

The number of evaluation periods for latency and availabiltiy alarms.

---

##### `faultAlarmThreshold`<sup>Optional</sup> <a name="faultAlarmThreshold" id="@cdklabs/multi-az-observability.OperationMetricDetailsProps.property.faultAlarmThreshold"></a>

```typescript
public readonly faultAlarmThreshold: number;
```

- *Type:* number
- *Default:* The service default is used

The threshold for alarms associated with fault metrics, for example if measuring fault rate, the threshold may be 1, meaning you would want an alarm that triggers if the fault rate goes above 1%.

---

##### `faultMetricNames`<sup>Optional</sup> <a name="faultMetricNames" id="@cdklabs/multi-az-observability.OperationMetricDetailsProps.property.faultMetricNames"></a>

```typescript
public readonly faultMetricNames: string[];
```

- *Type:* string[]
- *Default:* The service default is used

The names of fault indicating metrics.

---

##### `graphedFaultStatistics`<sup>Optional</sup> <a name="graphedFaultStatistics" id="@cdklabs/multi-az-observability.OperationMetricDetailsProps.property.graphedFaultStatistics"></a>

```typescript
public readonly graphedFaultStatistics: string[];
```

- *Type:* string[]
- *Default:* The service default is used

The statistics for faults you want to appear on dashboards, for example, with latency metrics, you might want p50, p99, and tm99.

For availability
metrics this will typically just be "Sum".

---

##### `graphedSuccessStatistics`<sup>Optional</sup> <a name="graphedSuccessStatistics" id="@cdklabs/multi-az-observability.OperationMetricDetailsProps.property.graphedSuccessStatistics"></a>

```typescript
public readonly graphedSuccessStatistics: string[];
```

- *Type:* string[]
- *Default:* The service default is used

The statistics for successes you want to appear on dashboards, for example, with latency metrics, you might want p50, p99, and tm99.

For availability
metrics this will typically just be "Sum".

---

##### `metricNamespace`<sup>Optional</sup> <a name="metricNamespace" id="@cdklabs/multi-az-observability.OperationMetricDetailsProps.property.metricNamespace"></a>

```typescript
public readonly metricNamespace: string;
```

- *Type:* string
- *Default:* The service default is used

The CloudWatch metric namespace for these metrics.

---

##### `period`<sup>Optional</sup> <a name="period" id="@cdklabs/multi-az-observability.OperationMetricDetailsProps.property.period"></a>

```typescript
public readonly period: Duration;
```

- *Type:* aws-cdk-lib.Duration
- *Default:* The service default is used

The period for the metrics.

---

##### `successAlarmThreshold`<sup>Optional</sup> <a name="successAlarmThreshold" id="@cdklabs/multi-az-observability.OperationMetricDetailsProps.property.successAlarmThreshold"></a>

```typescript
public readonly successAlarmThreshold: number;
```

- *Type:* number
- *Default:* The service default is used

The threshold for alarms associated with success metrics, for example if measuring success rate, the threshold may be 99, meaning you would want an alarm that triggers if success drops below 99%.

---

##### `successMetricNames`<sup>Optional</sup> <a name="successMetricNames" id="@cdklabs/multi-az-observability.OperationMetricDetailsProps.property.successMetricNames"></a>

```typescript
public readonly successMetricNames: string[];
```

- *Type:* string[]
- *Default:* The service default is used

The names of success indicating metrics.

---

##### `unit`<sup>Optional</sup> <a name="unit" id="@cdklabs/multi-az-observability.OperationMetricDetailsProps.property.unit"></a>

```typescript
public readonly unit: Unit;
```

- *Type:* aws-cdk-lib.aws_cloudwatch.Unit
- *Default:* The service default is used

The unit used for these metrics.

---

### OperationProps <a name="OperationProps" id="@cdklabs/multi-az-observability.OperationProps"></a>

Properties for an operation.

#### Initializer <a name="Initializer" id="@cdklabs/multi-az-observability.OperationProps.Initializer"></a>

```typescript
import { OperationProps } from '@cdklabs/multi-az-observability'

const operationProps: OperationProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@cdklabs/multi-az-observability.OperationProps.property.critical">critical</a></code> | <code>boolean</code> | Indicates this is a critical operation for the service and will be included in service level metrics and dashboards. |
| <code><a href="#@cdklabs/multi-az-observability.OperationProps.property.httpMethods">httpMethods</a></code> | <code>string[]</code> | The http methods supported by the operation. |
| <code><a href="#@cdklabs/multi-az-observability.OperationProps.property.operationName">operationName</a></code> | <code>string</code> | The name of the operation. |
| <code><a href="#@cdklabs/multi-az-observability.OperationProps.property.path">path</a></code> | <code>string</code> | The HTTP path for the operation for canaries to run against, something like "/products/list". |
| <code><a href="#@cdklabs/multi-az-observability.OperationProps.property.serverSideAvailabilityMetricDetails">serverSideAvailabilityMetricDetails</a></code> | <code><a href="#@cdklabs/multi-az-observability.IOperationMetricDetails">IOperationMetricDetails</a></code> | The server side availability metric details. |
| <code><a href="#@cdklabs/multi-az-observability.OperationProps.property.serverSideLatencyMetricDetails">serverSideLatencyMetricDetails</a></code> | <code><a href="#@cdklabs/multi-az-observability.IOperationMetricDetails">IOperationMetricDetails</a></code> | The server side latency metric details. |
| <code><a href="#@cdklabs/multi-az-observability.OperationProps.property.service">service</a></code> | <code><a href="#@cdklabs/multi-az-observability.IService">IService</a></code> | The service the operation is associated with. |
| <code><a href="#@cdklabs/multi-az-observability.OperationProps.property.canaryMetricDetails">canaryMetricDetails</a></code> | <code><a href="#@cdklabs/multi-az-observability.ICanaryMetrics">ICanaryMetrics</a></code> | Optional metric details if the service has a canary. |
| <code><a href="#@cdklabs/multi-az-observability.OperationProps.property.canaryTestAvailabilityMetricsOverride">canaryTestAvailabilityMetricsOverride</a></code> | <code><a href="#@cdklabs/multi-az-observability.ICanaryTestMetricsOverride">ICanaryTestMetricsOverride</a></code> | The override values for automatically created canary tests so you can use values other than the service defaults to define the thresholds for availability. |
| <code><a href="#@cdklabs/multi-az-observability.OperationProps.property.canaryTestLatencyMetricsOverride">canaryTestLatencyMetricsOverride</a></code> | <code><a href="#@cdklabs/multi-az-observability.ICanaryTestMetricsOverride">ICanaryTestMetricsOverride</a></code> | The override values for automatically created canary tests so you can use values other than the service defaults to define the thresholds for latency. |
| <code><a href="#@cdklabs/multi-az-observability.OperationProps.property.canaryTestProps">canaryTestProps</a></code> | <code><a href="#@cdklabs/multi-az-observability.AddCanaryTestProps">AddCanaryTestProps</a></code> | If you define this property, a synthetic canary will be provisioned to test the operation. |
| <code><a href="#@cdklabs/multi-az-observability.OperationProps.property.optOutOfServiceCreatedCanary">optOutOfServiceCreatedCanary</a></code> | <code>boolean</code> | Set to true if you have defined CanaryTestProps for your service, which applies to all operations, but you want to opt out of creating the canary test for this operation. |
| <code><a href="#@cdklabs/multi-az-observability.OperationProps.property.serverSideContributorInsightRuleDetails">serverSideContributorInsightRuleDetails</a></code> | <code><a href="#@cdklabs/multi-az-observability.IContributorInsightRuleDetails">IContributorInsightRuleDetails</a></code> | The server side details for contributor insights rules. |

---

##### `critical`<sup>Required</sup> <a name="critical" id="@cdklabs/multi-az-observability.OperationProps.property.critical"></a>

```typescript
public readonly critical: boolean;
```

- *Type:* boolean

Indicates this is a critical operation for the service and will be included in service level metrics and dashboards.

---

##### `httpMethods`<sup>Required</sup> <a name="httpMethods" id="@cdklabs/multi-az-observability.OperationProps.property.httpMethods"></a>

```typescript
public readonly httpMethods: string[];
```

- *Type:* string[]

The http methods supported by the operation.

---

##### `operationName`<sup>Required</sup> <a name="operationName" id="@cdklabs/multi-az-observability.OperationProps.property.operationName"></a>

```typescript
public readonly operationName: string;
```

- *Type:* string

The name of the operation.

---

##### `path`<sup>Required</sup> <a name="path" id="@cdklabs/multi-az-observability.OperationProps.property.path"></a>

```typescript
public readonly path: string;
```

- *Type:* string

The HTTP path for the operation for canaries to run against, something like "/products/list".

---

##### `serverSideAvailabilityMetricDetails`<sup>Required</sup> <a name="serverSideAvailabilityMetricDetails" id="@cdklabs/multi-az-observability.OperationProps.property.serverSideAvailabilityMetricDetails"></a>

```typescript
public readonly serverSideAvailabilityMetricDetails: IOperationMetricDetails;
```

- *Type:* <a href="#@cdklabs/multi-az-observability.IOperationMetricDetails">IOperationMetricDetails</a>

The server side availability metric details.

---

##### `serverSideLatencyMetricDetails`<sup>Required</sup> <a name="serverSideLatencyMetricDetails" id="@cdklabs/multi-az-observability.OperationProps.property.serverSideLatencyMetricDetails"></a>

```typescript
public readonly serverSideLatencyMetricDetails: IOperationMetricDetails;
```

- *Type:* <a href="#@cdklabs/multi-az-observability.IOperationMetricDetails">IOperationMetricDetails</a>

The server side latency metric details.

---

##### `service`<sup>Required</sup> <a name="service" id="@cdklabs/multi-az-observability.OperationProps.property.service"></a>

```typescript
public readonly service: IService;
```

- *Type:* <a href="#@cdklabs/multi-az-observability.IService">IService</a>

The service the operation is associated with.

---

##### `canaryMetricDetails`<sup>Optional</sup> <a name="canaryMetricDetails" id="@cdklabs/multi-az-observability.OperationProps.property.canaryMetricDetails"></a>

```typescript
public readonly canaryMetricDetails: ICanaryMetrics;
```

- *Type:* <a href="#@cdklabs/multi-az-observability.ICanaryMetrics">ICanaryMetrics</a>
- *Default:* No alarms, rules, or dashboards will be created from canary metrics

Optional metric details if the service has a canary.

---

##### `canaryTestAvailabilityMetricsOverride`<sup>Optional</sup> <a name="canaryTestAvailabilityMetricsOverride" id="@cdklabs/multi-az-observability.OperationProps.property.canaryTestAvailabilityMetricsOverride"></a>

```typescript
public readonly canaryTestAvailabilityMetricsOverride: ICanaryTestMetricsOverride;
```

- *Type:* <a href="#@cdklabs/multi-az-observability.ICanaryTestMetricsOverride">ICanaryTestMetricsOverride</a>
- *Default:* No availability metric details will be overridden and the service defaults will be used for the automatically created canaries

The override values for automatically created canary tests so you can use values other than the service defaults to define the thresholds for availability.

---

##### `canaryTestLatencyMetricsOverride`<sup>Optional</sup> <a name="canaryTestLatencyMetricsOverride" id="@cdklabs/multi-az-observability.OperationProps.property.canaryTestLatencyMetricsOverride"></a>

```typescript
public readonly canaryTestLatencyMetricsOverride: ICanaryTestMetricsOverride;
```

- *Type:* <a href="#@cdklabs/multi-az-observability.ICanaryTestMetricsOverride">ICanaryTestMetricsOverride</a>
- *Default:* No latency metric details will be overridden and the service defaults will be used for the automatically created canaries

The override values for automatically created canary tests so you can use values other than the service defaults to define the thresholds for latency.

---

##### `canaryTestProps`<sup>Optional</sup> <a name="canaryTestProps" id="@cdklabs/multi-az-observability.OperationProps.property.canaryTestProps"></a>

```typescript
public readonly canaryTestProps: AddCanaryTestProps;
```

- *Type:* <a href="#@cdklabs/multi-az-observability.AddCanaryTestProps">AddCanaryTestProps</a>
- *Default:* The default for the service will be used, if that is undefined, then no canary will be provisioned for this operation.

If you define this property, a synthetic canary will be provisioned to test the operation.

---

##### `optOutOfServiceCreatedCanary`<sup>Optional</sup> <a name="optOutOfServiceCreatedCanary" id="@cdklabs/multi-az-observability.OperationProps.property.optOutOfServiceCreatedCanary"></a>

```typescript
public readonly optOutOfServiceCreatedCanary: boolean;
```

- *Type:* boolean
- *Default:* The operation is not opted out

Set to true if you have defined CanaryTestProps for your service, which applies to all operations, but you want to opt out of creating the canary test for this operation.

---

##### `serverSideContributorInsightRuleDetails`<sup>Optional</sup> <a name="serverSideContributorInsightRuleDetails" id="@cdklabs/multi-az-observability.OperationProps.property.serverSideContributorInsightRuleDetails"></a>

```typescript
public readonly serverSideContributorInsightRuleDetails: IContributorInsightRuleDetails;
```

- *Type:* <a href="#@cdklabs/multi-az-observability.IContributorInsightRuleDetails">IContributorInsightRuleDetails</a>
- *Default:* The default service contributor insight rule details will be used. If those are not defined no Contributor Insight rules will be created and the number of instances contributing to AZ faults or high latency will not be considered, so a single bad instance could make the AZ appear to look impaired.

The server side details for contributor insights rules.

---

### ServiceMetricDetailsProps <a name="ServiceMetricDetailsProps" id="@cdklabs/multi-az-observability.ServiceMetricDetailsProps"></a>

The properties for default service metric details.

#### Initializer <a name="Initializer" id="@cdklabs/multi-az-observability.ServiceMetricDetailsProps.Initializer"></a>

```typescript
import { ServiceMetricDetailsProps } from '@cdklabs/multi-az-observability'

const serviceMetricDetailsProps: ServiceMetricDetailsProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@cdklabs/multi-az-observability.ServiceMetricDetailsProps.property.alarmStatistic">alarmStatistic</a></code> | <code>string</code> | The statistic used for alarms, for availability metrics this should be "Sum", for latency metrics it could something like "p99" or "p99.9". |
| <code><a href="#@cdklabs/multi-az-observability.ServiceMetricDetailsProps.property.datapointsToAlarm">datapointsToAlarm</a></code> | <code>number</code> | The number of datapoints to alarm on for latency and availability alarms. |
| <code><a href="#@cdklabs/multi-az-observability.ServiceMetricDetailsProps.property.evaluationPeriods">evaluationPeriods</a></code> | <code>number</code> | The number of evaluation periods for latency and availabiltiy alarms. |
| <code><a href="#@cdklabs/multi-az-observability.ServiceMetricDetailsProps.property.faultAlarmThreshold">faultAlarmThreshold</a></code> | <code>number</code> | The threshold for alarms associated with fault metrics, for example if measuring fault rate, the threshold may be 1, meaning you would want an alarm that triggers if the fault rate goes above 1%. |
| <code><a href="#@cdklabs/multi-az-observability.ServiceMetricDetailsProps.property.faultMetricNames">faultMetricNames</a></code> | <code>string[]</code> | The names of fault indicating metrics. |
| <code><a href="#@cdklabs/multi-az-observability.ServiceMetricDetailsProps.property.metricNamespace">metricNamespace</a></code> | <code>string</code> | The CloudWatch metric namespace for these metrics. |
| <code><a href="#@cdklabs/multi-az-observability.ServiceMetricDetailsProps.property.period">period</a></code> | <code>aws-cdk-lib.Duration</code> | The period for the metrics. |
| <code><a href="#@cdklabs/multi-az-observability.ServiceMetricDetailsProps.property.successAlarmThreshold">successAlarmThreshold</a></code> | <code>number</code> | The threshold for alarms associated with success metrics, for example if measuring success rate, the threshold may be 99, meaning you would want an alarm that triggers if success drops below 99%. |
| <code><a href="#@cdklabs/multi-az-observability.ServiceMetricDetailsProps.property.successMetricNames">successMetricNames</a></code> | <code>string[]</code> | The names of success indicating metrics. |
| <code><a href="#@cdklabs/multi-az-observability.ServiceMetricDetailsProps.property.unit">unit</a></code> | <code>aws-cdk-lib.aws_cloudwatch.Unit</code> | The unit used for these metrics. |
| <code><a href="#@cdklabs/multi-az-observability.ServiceMetricDetailsProps.property.graphedFaultStatistics">graphedFaultStatistics</a></code> | <code>string[]</code> | The statistics for faults you want to appear on dashboards, for example, with latency metrics, you might want p50, p99, and tm99. |
| <code><a href="#@cdklabs/multi-az-observability.ServiceMetricDetailsProps.property.graphedSuccessStatistics">graphedSuccessStatistics</a></code> | <code>string[]</code> | The statistics for successes you want to appear on dashboards, for example, with latency metrics, you might want p50, p99, and tm99. |

---

##### `alarmStatistic`<sup>Required</sup> <a name="alarmStatistic" id="@cdklabs/multi-az-observability.ServiceMetricDetailsProps.property.alarmStatistic"></a>

```typescript
public readonly alarmStatistic: string;
```

- *Type:* string

The statistic used for alarms, for availability metrics this should be "Sum", for latency metrics it could something like "p99" or "p99.9".

---

##### `datapointsToAlarm`<sup>Required</sup> <a name="datapointsToAlarm" id="@cdklabs/multi-az-observability.ServiceMetricDetailsProps.property.datapointsToAlarm"></a>

```typescript
public readonly datapointsToAlarm: number;
```

- *Type:* number

The number of datapoints to alarm on for latency and availability alarms.

---

##### `evaluationPeriods`<sup>Required</sup> <a name="evaluationPeriods" id="@cdklabs/multi-az-observability.ServiceMetricDetailsProps.property.evaluationPeriods"></a>

```typescript
public readonly evaluationPeriods: number;
```

- *Type:* number

The number of evaluation periods for latency and availabiltiy alarms.

---

##### `faultAlarmThreshold`<sup>Required</sup> <a name="faultAlarmThreshold" id="@cdklabs/multi-az-observability.ServiceMetricDetailsProps.property.faultAlarmThreshold"></a>

```typescript
public readonly faultAlarmThreshold: number;
```

- *Type:* number

The threshold for alarms associated with fault metrics, for example if measuring fault rate, the threshold may be 1, meaning you would want an alarm that triggers if the fault rate goes above 1%.

---

##### `faultMetricNames`<sup>Required</sup> <a name="faultMetricNames" id="@cdklabs/multi-az-observability.ServiceMetricDetailsProps.property.faultMetricNames"></a>

```typescript
public readonly faultMetricNames: string[];
```

- *Type:* string[]

The names of fault indicating metrics.

---

##### `metricNamespace`<sup>Required</sup> <a name="metricNamespace" id="@cdklabs/multi-az-observability.ServiceMetricDetailsProps.property.metricNamespace"></a>

```typescript
public readonly metricNamespace: string;
```

- *Type:* string

The CloudWatch metric namespace for these metrics.

---

##### `period`<sup>Required</sup> <a name="period" id="@cdklabs/multi-az-observability.ServiceMetricDetailsProps.property.period"></a>

```typescript
public readonly period: Duration;
```

- *Type:* aws-cdk-lib.Duration

The period for the metrics.

---

##### `successAlarmThreshold`<sup>Required</sup> <a name="successAlarmThreshold" id="@cdklabs/multi-az-observability.ServiceMetricDetailsProps.property.successAlarmThreshold"></a>

```typescript
public readonly successAlarmThreshold: number;
```

- *Type:* number

The threshold for alarms associated with success metrics, for example if measuring success rate, the threshold may be 99, meaning you would want an alarm that triggers if success drops below 99%.

---

##### `successMetricNames`<sup>Required</sup> <a name="successMetricNames" id="@cdklabs/multi-az-observability.ServiceMetricDetailsProps.property.successMetricNames"></a>

```typescript
public readonly successMetricNames: string[];
```

- *Type:* string[]

The names of success indicating metrics.

---

##### `unit`<sup>Required</sup> <a name="unit" id="@cdklabs/multi-az-observability.ServiceMetricDetailsProps.property.unit"></a>

```typescript
public readonly unit: Unit;
```

- *Type:* aws-cdk-lib.aws_cloudwatch.Unit

The unit used for these metrics.

---

##### `graphedFaultStatistics`<sup>Optional</sup> <a name="graphedFaultStatistics" id="@cdklabs/multi-az-observability.ServiceMetricDetailsProps.property.graphedFaultStatistics"></a>

```typescript
public readonly graphedFaultStatistics: string[];
```

- *Type:* string[]
- *Default:* For availability metrics, this will be "Sum", for latency metrics it will be just "p99"

The statistics for faults you want to appear on dashboards, for example, with latency metrics, you might want p50, p99, and tm99.

For availability
metrics this will typically just be "Sum".

---

##### `graphedSuccessStatistics`<sup>Optional</sup> <a name="graphedSuccessStatistics" id="@cdklabs/multi-az-observability.ServiceMetricDetailsProps.property.graphedSuccessStatistics"></a>

```typescript
public readonly graphedSuccessStatistics: string[];
```

- *Type:* string[]
- *Default:* For availability metrics, this will be "Sum", for latency metrics it will be just "p99"

The statistics for successes you want to appear on dashboards, for example, with latency metrics, you might want p50, p99, and tm99.

For availability
metrics this will typically just be "Sum".

---

### ServiceProps <a name="ServiceProps" id="@cdklabs/multi-az-observability.ServiceProps"></a>

Properties to initialize a service.

#### Initializer <a name="Initializer" id="@cdklabs/multi-az-observability.ServiceProps.Initializer"></a>

```typescript
import { ServiceProps } from '@cdklabs/multi-az-observability'

const serviceProps: ServiceProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@cdklabs/multi-az-observability.ServiceProps.property.availabilityZoneNames">availabilityZoneNames</a></code> | <code>string[]</code> | A list of the Availability Zone names used by this application. |
| <code><a href="#@cdklabs/multi-az-observability.ServiceProps.property.baseUrl">baseUrl</a></code> | <code>string</code> | The base endpoint for this service, like "https://www.example.com". Operation paths will be appended to this endpoint for canary testing the service. |
| <code><a href="#@cdklabs/multi-az-observability.ServiceProps.property.defaultAvailabilityMetricDetails">defaultAvailabilityMetricDetails</a></code> | <code><a href="#@cdklabs/multi-az-observability.IServiceMetricDetails">IServiceMetricDetails</a></code> | The default settings that are used for availability metrics for all operations unless specifically overridden in an operation definition. |
| <code><a href="#@cdklabs/multi-az-observability.ServiceProps.property.defaultLatencyMetricDetails">defaultLatencyMetricDetails</a></code> | <code><a href="#@cdklabs/multi-az-observability.IServiceMetricDetails">IServiceMetricDetails</a></code> | The default settings that are used for availability metrics for all operations unless specifically overridden in an operation definition. |
| <code><a href="#@cdklabs/multi-az-observability.ServiceProps.property.faultCountThreshold">faultCountThreshold</a></code> | <code>number</code> | The fault count threshold that indicates the service is unhealthy. |
| <code><a href="#@cdklabs/multi-az-observability.ServiceProps.property.period">period</a></code> | <code>aws-cdk-lib.Duration</code> | The period for which metrics for the service should be aggregated. |
| <code><a href="#@cdklabs/multi-az-observability.ServiceProps.property.serviceName">serviceName</a></code> | <code>string</code> | The name of your service. |
| <code><a href="#@cdklabs/multi-az-observability.ServiceProps.property.canaryTestProps">canaryTestProps</a></code> | <code><a href="#@cdklabs/multi-az-observability.AddCanaryTestProps">AddCanaryTestProps</a></code> | Define these settings if you want to automatically add canary tests to your operations. |
| <code><a href="#@cdklabs/multi-az-observability.ServiceProps.property.defaultContributorInsightRuleDetails">defaultContributorInsightRuleDetails</a></code> | <code><a href="#@cdklabs/multi-az-observability.IContributorInsightRuleDetails">IContributorInsightRuleDetails</a></code> | The default settings that are used for contributor insight rules. |
| <code><a href="#@cdklabs/multi-az-observability.ServiceProps.property.loadBalancer">loadBalancer</a></code> | <code>aws-cdk-lib.aws_elasticloadbalancingv2.ILoadBalancerV2</code> | The load balancer this service sits behind. |

---

##### `availabilityZoneNames`<sup>Required</sup> <a name="availabilityZoneNames" id="@cdklabs/multi-az-observability.ServiceProps.property.availabilityZoneNames"></a>

```typescript
public readonly availabilityZoneNames: string[];
```

- *Type:* string[]

A list of the Availability Zone names used by this application.

---

##### `baseUrl`<sup>Required</sup> <a name="baseUrl" id="@cdklabs/multi-az-observability.ServiceProps.property.baseUrl"></a>

```typescript
public readonly baseUrl: string;
```

- *Type:* string

The base endpoint for this service, like "https://www.example.com". Operation paths will be appended to this endpoint for canary testing the service.

---

##### `defaultAvailabilityMetricDetails`<sup>Required</sup> <a name="defaultAvailabilityMetricDetails" id="@cdklabs/multi-az-observability.ServiceProps.property.defaultAvailabilityMetricDetails"></a>

```typescript
public readonly defaultAvailabilityMetricDetails: IServiceMetricDetails;
```

- *Type:* <a href="#@cdklabs/multi-az-observability.IServiceMetricDetails">IServiceMetricDetails</a>

The default settings that are used for availability metrics for all operations unless specifically overridden in an operation definition.

---

##### `defaultLatencyMetricDetails`<sup>Required</sup> <a name="defaultLatencyMetricDetails" id="@cdklabs/multi-az-observability.ServiceProps.property.defaultLatencyMetricDetails"></a>

```typescript
public readonly defaultLatencyMetricDetails: IServiceMetricDetails;
```

- *Type:* <a href="#@cdklabs/multi-az-observability.IServiceMetricDetails">IServiceMetricDetails</a>

The default settings that are used for availability metrics for all operations unless specifically overridden in an operation definition.

---

##### `faultCountThreshold`<sup>Required</sup> <a name="faultCountThreshold" id="@cdklabs/multi-az-observability.ServiceProps.property.faultCountThreshold"></a>

```typescript
public readonly faultCountThreshold: number;
```

- *Type:* number

The fault count threshold that indicates the service is unhealthy.

This is an absolute value of faults
being produced by all critical operations in aggregate.

---

##### `period`<sup>Required</sup> <a name="period" id="@cdklabs/multi-az-observability.ServiceProps.property.period"></a>

```typescript
public readonly period: Duration;
```

- *Type:* aws-cdk-lib.Duration

The period for which metrics for the service should be aggregated.

---

##### `serviceName`<sup>Required</sup> <a name="serviceName" id="@cdklabs/multi-az-observability.ServiceProps.property.serviceName"></a>

```typescript
public readonly serviceName: string;
```

- *Type:* string

The name of your service.

---

##### `canaryTestProps`<sup>Optional</sup> <a name="canaryTestProps" id="@cdklabs/multi-az-observability.ServiceProps.property.canaryTestProps"></a>

```typescript
public readonly canaryTestProps: AddCanaryTestProps;
```

- *Type:* <a href="#@cdklabs/multi-az-observability.AddCanaryTestProps">AddCanaryTestProps</a>
- *Default:* Automatic canary tests will not be created for operations in this service.

Define these settings if you want to automatically add canary tests to your operations.

Operations can individually opt out
of canary test creation if you define this setting.

---

##### `defaultContributorInsightRuleDetails`<sup>Optional</sup> <a name="defaultContributorInsightRuleDetails" id="@cdklabs/multi-az-observability.ServiceProps.property.defaultContributorInsightRuleDetails"></a>

```typescript
public readonly defaultContributorInsightRuleDetails: IContributorInsightRuleDetails;
```

- *Type:* <a href="#@cdklabs/multi-az-observability.IContributorInsightRuleDetails">IContributorInsightRuleDetails</a>
- *Default:* No defaults are provided and must be specified per operation if the operation has logs that can be queried by contributor insights

The default settings that are used for contributor insight rules.

---

##### `loadBalancer`<sup>Optional</sup> <a name="loadBalancer" id="@cdklabs/multi-az-observability.ServiceProps.property.loadBalancer"></a>

```typescript
public readonly loadBalancer: ILoadBalancerV2;
```

- *Type:* aws-cdk-lib.aws_elasticloadbalancingv2.ILoadBalancerV2
- *Default:* Load balancer metrics won't be shown on dashboards and its ARN won't be included in top level alarm descriptions that automation can use to implement a zonal shift.

The load balancer this service sits behind.

---

## Classes <a name="Classes" id="Classes"></a>

### CanaryMetrics <a name="CanaryMetrics" id="@cdklabs/multi-az-observability.CanaryMetrics"></a>

- *Implements:* <a href="#@cdklabs/multi-az-observability.ICanaryMetrics">ICanaryMetrics</a>

Represents metrics for a canary testing a service.

#### Initializers <a name="Initializers" id="@cdklabs/multi-az-observability.CanaryMetrics.Initializer"></a>

```typescript
import { CanaryMetrics } from '@cdklabs/multi-az-observability'

new CanaryMetrics(props: CanaryMetricProps)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@cdklabs/multi-az-observability.CanaryMetrics.Initializer.parameter.props">props</a></code> | <code><a href="#@cdklabs/multi-az-observability.CanaryMetricProps">CanaryMetricProps</a></code> | *No description.* |

---

##### `props`<sup>Required</sup> <a name="props" id="@cdklabs/multi-az-observability.CanaryMetrics.Initializer.parameter.props"></a>

- *Type:* <a href="#@cdklabs/multi-az-observability.CanaryMetricProps">CanaryMetricProps</a>

---



#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@cdklabs/multi-az-observability.CanaryMetrics.property.canaryAvailabilityMetricDetails">canaryAvailabilityMetricDetails</a></code> | <code><a href="#@cdklabs/multi-az-observability.IOperationMetricDetails">IOperationMetricDetails</a></code> | The canary availability metric details. |
| <code><a href="#@cdklabs/multi-az-observability.CanaryMetrics.property.canaryLatencyMetricDetails">canaryLatencyMetricDetails</a></code> | <code><a href="#@cdklabs/multi-az-observability.IOperationMetricDetails">IOperationMetricDetails</a></code> | The canary latency metric details. |

---

##### `canaryAvailabilityMetricDetails`<sup>Required</sup> <a name="canaryAvailabilityMetricDetails" id="@cdklabs/multi-az-observability.CanaryMetrics.property.canaryAvailabilityMetricDetails"></a>

```typescript
public readonly canaryAvailabilityMetricDetails: IOperationMetricDetails;
```

- *Type:* <a href="#@cdklabs/multi-az-observability.IOperationMetricDetails">IOperationMetricDetails</a>

The canary availability metric details.

---

##### `canaryLatencyMetricDetails`<sup>Required</sup> <a name="canaryLatencyMetricDetails" id="@cdklabs/multi-az-observability.CanaryMetrics.property.canaryLatencyMetricDetails"></a>

```typescript
public readonly canaryLatencyMetricDetails: IOperationMetricDetails;
```

- *Type:* <a href="#@cdklabs/multi-az-observability.IOperationMetricDetails">IOperationMetricDetails</a>

The canary latency metric details.

---


### CanaryTestMetricsOverride <a name="CanaryTestMetricsOverride" id="@cdklabs/multi-az-observability.CanaryTestMetricsOverride"></a>

- *Implements:* <a href="#@cdklabs/multi-az-observability.ICanaryTestMetricsOverride">ICanaryTestMetricsOverride</a>

Provides overrides for the default metric settings used for the automatically created canary tests.

#### Initializers <a name="Initializers" id="@cdklabs/multi-az-observability.CanaryTestMetricsOverride.Initializer"></a>

```typescript
import { CanaryTestMetricsOverride } from '@cdklabs/multi-az-observability'

new CanaryTestMetricsOverride(props: CanaryTestMetricsOverrideProps)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@cdklabs/multi-az-observability.CanaryTestMetricsOverride.Initializer.parameter.props">props</a></code> | <code><a href="#@cdklabs/multi-az-observability.CanaryTestMetricsOverrideProps">CanaryTestMetricsOverrideProps</a></code> | *No description.* |

---

##### `props`<sup>Required</sup> <a name="props" id="@cdklabs/multi-az-observability.CanaryTestMetricsOverride.Initializer.parameter.props"></a>

- *Type:* <a href="#@cdklabs/multi-az-observability.CanaryTestMetricsOverrideProps">CanaryTestMetricsOverrideProps</a>

---



#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@cdklabs/multi-az-observability.CanaryTestMetricsOverride.property.alarmStatistic">alarmStatistic</a></code> | <code>string</code> | The statistic used for alarms, for availability metrics this should be "Sum", for latency metrics it could something like "p99" or "p99.9". |
| <code><a href="#@cdklabs/multi-az-observability.CanaryTestMetricsOverride.property.datapointsToAlarm">datapointsToAlarm</a></code> | <code>number</code> | The number of datapoints to alarm on for latency and availability alarms. |
| <code><a href="#@cdklabs/multi-az-observability.CanaryTestMetricsOverride.property.evaluationPeriods">evaluationPeriods</a></code> | <code>number</code> | The number of evaluation periods for latency and availabiltiy alarms. |
| <code><a href="#@cdklabs/multi-az-observability.CanaryTestMetricsOverride.property.faultAlarmThreshold">faultAlarmThreshold</a></code> | <code>number</code> | The threshold for alarms associated with fault metrics, for example if measuring fault rate, the threshold may be 1, meaning you would want an alarm that triggers if the fault rate goes above 1%. |
| <code><a href="#@cdklabs/multi-az-observability.CanaryTestMetricsOverride.property.period">period</a></code> | <code>aws-cdk-lib.Duration</code> | The period for the metrics. |
| <code><a href="#@cdklabs/multi-az-observability.CanaryTestMetricsOverride.property.successAlarmThreshold">successAlarmThreshold</a></code> | <code>number</code> | The threshold for alarms associated with success metrics, for example if measuring success rate, the threshold may be 99, meaning you would want an alarm that triggers if success drops below 99%. |

---

##### `alarmStatistic`<sup>Optional</sup> <a name="alarmStatistic" id="@cdklabs/multi-az-observability.CanaryTestMetricsOverride.property.alarmStatistic"></a>

```typescript
public readonly alarmStatistic: string;
```

- *Type:* string

The statistic used for alarms, for availability metrics this should be "Sum", for latency metrics it could something like "p99" or "p99.9".

---

##### `datapointsToAlarm`<sup>Optional</sup> <a name="datapointsToAlarm" id="@cdklabs/multi-az-observability.CanaryTestMetricsOverride.property.datapointsToAlarm"></a>

```typescript
public readonly datapointsToAlarm: number;
```

- *Type:* number

The number of datapoints to alarm on for latency and availability alarms.

---

##### `evaluationPeriods`<sup>Optional</sup> <a name="evaluationPeriods" id="@cdklabs/multi-az-observability.CanaryTestMetricsOverride.property.evaluationPeriods"></a>

```typescript
public readonly evaluationPeriods: number;
```

- *Type:* number

The number of evaluation periods for latency and availabiltiy alarms.

---

##### `faultAlarmThreshold`<sup>Optional</sup> <a name="faultAlarmThreshold" id="@cdklabs/multi-az-observability.CanaryTestMetricsOverride.property.faultAlarmThreshold"></a>

```typescript
public readonly faultAlarmThreshold: number;
```

- *Type:* number

The threshold for alarms associated with fault metrics, for example if measuring fault rate, the threshold may be 1, meaning you would want an alarm that triggers if the fault rate goes above 1%.

---

##### `period`<sup>Optional</sup> <a name="period" id="@cdklabs/multi-az-observability.CanaryTestMetricsOverride.property.period"></a>

```typescript
public readonly period: Duration;
```

- *Type:* aws-cdk-lib.Duration

The period for the metrics.

---

##### `successAlarmThreshold`<sup>Optional</sup> <a name="successAlarmThreshold" id="@cdklabs/multi-az-observability.CanaryTestMetricsOverride.property.successAlarmThreshold"></a>

```typescript
public readonly successAlarmThreshold: number;
```

- *Type:* number

The threshold for alarms associated with success metrics, for example if measuring success rate, the threshold may be 99, meaning you would want an alarm that triggers if success drops below 99%.

---


### ContributorInsightRuleDetails <a name="ContributorInsightRuleDetails" id="@cdklabs/multi-az-observability.ContributorInsightRuleDetails"></a>

- *Implements:* <a href="#@cdklabs/multi-az-observability.IContributorInsightRuleDetails">IContributorInsightRuleDetails</a>

The contributor insight rule details for creating an insight rule.

#### Initializers <a name="Initializers" id="@cdklabs/multi-az-observability.ContributorInsightRuleDetails.Initializer"></a>

```typescript
import { ContributorInsightRuleDetails } from '@cdklabs/multi-az-observability'

new ContributorInsightRuleDetails(props: ContributorInsightRuleDetailsProps)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@cdklabs/multi-az-observability.ContributorInsightRuleDetails.Initializer.parameter.props">props</a></code> | <code><a href="#@cdklabs/multi-az-observability.ContributorInsightRuleDetailsProps">ContributorInsightRuleDetailsProps</a></code> | *No description.* |

---

##### `props`<sup>Required</sup> <a name="props" id="@cdklabs/multi-az-observability.ContributorInsightRuleDetails.Initializer.parameter.props"></a>

- *Type:* <a href="#@cdklabs/multi-az-observability.ContributorInsightRuleDetailsProps">ContributorInsightRuleDetailsProps</a>

---



#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@cdklabs/multi-az-observability.ContributorInsightRuleDetails.property.availabilityZoneIdJsonPath">availabilityZoneIdJsonPath</a></code> | <code>string</code> | The path in the log files to the field that identifies the Availability Zone Id that the request was handled in, for example { "AZ-ID": "use1-az1" } would have a path of $.AZ-ID. |
| <code><a href="#@cdklabs/multi-az-observability.ContributorInsightRuleDetails.property.faultMetricJsonPath">faultMetricJsonPath</a></code> | <code>string</code> | The path in the log files to the field that identifies if the response resulted in a fault, for example { "Fault" : 1 } would have a path of $.Fault. |
| <code><a href="#@cdklabs/multi-az-observability.ContributorInsightRuleDetails.property.instanceIdJsonPath">instanceIdJsonPath</a></code> | <code>string</code> | The JSON path to the instance id field in the log files, only required for server-side rules. |
| <code><a href="#@cdklabs/multi-az-observability.ContributorInsightRuleDetails.property.logGroups">logGroups</a></code> | <code>aws-cdk-lib.aws_logs.ILogGroup[]</code> | The log groups where CloudWatch logs for the operation are located. |
| <code><a href="#@cdklabs/multi-az-observability.ContributorInsightRuleDetails.property.operationNameJsonPath">operationNameJsonPath</a></code> | <code>string</code> | The path in the log files to the field that identifies the operation the log file is for. |
| <code><a href="#@cdklabs/multi-az-observability.ContributorInsightRuleDetails.property.successLatencyMetricJsonPath">successLatencyMetricJsonPath</a></code> | <code>string</code> | The path in the log files to the field that indicates the latency for the response. |

---

##### `availabilityZoneIdJsonPath`<sup>Required</sup> <a name="availabilityZoneIdJsonPath" id="@cdklabs/multi-az-observability.ContributorInsightRuleDetails.property.availabilityZoneIdJsonPath"></a>

```typescript
public readonly availabilityZoneIdJsonPath: string;
```

- *Type:* string

The path in the log files to the field that identifies the Availability Zone Id that the request was handled in, for example { "AZ-ID": "use1-az1" } would have a path of $.AZ-ID.

---

##### `faultMetricJsonPath`<sup>Required</sup> <a name="faultMetricJsonPath" id="@cdklabs/multi-az-observability.ContributorInsightRuleDetails.property.faultMetricJsonPath"></a>

```typescript
public readonly faultMetricJsonPath: string;
```

- *Type:* string

The path in the log files to the field that identifies if the response resulted in a fault, for example { "Fault" : 1 } would have a path of $.Fault.

---

##### `instanceIdJsonPath`<sup>Required</sup> <a name="instanceIdJsonPath" id="@cdklabs/multi-az-observability.ContributorInsightRuleDetails.property.instanceIdJsonPath"></a>

```typescript
public readonly instanceIdJsonPath: string;
```

- *Type:* string

The JSON path to the instance id field in the log files, only required for server-side rules.

---

##### `logGroups`<sup>Required</sup> <a name="logGroups" id="@cdklabs/multi-az-observability.ContributorInsightRuleDetails.property.logGroups"></a>

```typescript
public readonly logGroups: ILogGroup[];
```

- *Type:* aws-cdk-lib.aws_logs.ILogGroup[]

The log groups where CloudWatch logs for the operation are located.

If
this is not provided, Contributor Insight rules cannot be created.

---

##### `operationNameJsonPath`<sup>Required</sup> <a name="operationNameJsonPath" id="@cdklabs/multi-az-observability.ContributorInsightRuleDetails.property.operationNameJsonPath"></a>

```typescript
public readonly operationNameJsonPath: string;
```

- *Type:* string

The path in the log files to the field that identifies the operation the log file is for.

---

##### `successLatencyMetricJsonPath`<sup>Required</sup> <a name="successLatencyMetricJsonPath" id="@cdklabs/multi-az-observability.ContributorInsightRuleDetails.property.successLatencyMetricJsonPath"></a>

```typescript
public readonly successLatencyMetricJsonPath: string;
```

- *Type:* string

The path in the log files to the field that indicates the latency for the response.

This could either be success latency or fault
latency depending on the alarms and rules you are creating.

---


### MetricDimensions <a name="MetricDimensions" id="@cdklabs/multi-az-observability.MetricDimensions"></a>

Provides the ability to get operation specific metric dimensions for metrics at the regional level as well as Availability Zone level.

#### Initializers <a name="Initializers" id="@cdklabs/multi-az-observability.MetricDimensions.Initializer"></a>

```typescript
import { MetricDimensions } from '@cdklabs/multi-az-observability'

new MetricDimensions(staticDimensions: {[ key: string ]: string}, availabilityZoneIdKey: string, regionKey?: string)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@cdklabs/multi-az-observability.MetricDimensions.Initializer.parameter.staticDimensions">staticDimensions</a></code> | <code>{[ key: string ]: string}</code> | *No description.* |
| <code><a href="#@cdklabs/multi-az-observability.MetricDimensions.Initializer.parameter.availabilityZoneIdKey">availabilityZoneIdKey</a></code> | <code>string</code> | *No description.* |
| <code><a href="#@cdklabs/multi-az-observability.MetricDimensions.Initializer.parameter.regionKey">regionKey</a></code> | <code>string</code> | *No description.* |

---

##### `staticDimensions`<sup>Required</sup> <a name="staticDimensions" id="@cdklabs/multi-az-observability.MetricDimensions.Initializer.parameter.staticDimensions"></a>

- *Type:* {[ key: string ]: string}

---

##### `availabilityZoneIdKey`<sup>Required</sup> <a name="availabilityZoneIdKey" id="@cdklabs/multi-az-observability.MetricDimensions.Initializer.parameter.availabilityZoneIdKey"></a>

- *Type:* string

---

##### `regionKey`<sup>Optional</sup> <a name="regionKey" id="@cdklabs/multi-az-observability.MetricDimensions.Initializer.parameter.regionKey"></a>

- *Type:* string

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#@cdklabs/multi-az-observability.MetricDimensions.regionalDimensions">regionalDimensions</a></code> | Gets the regional dimensions for these metrics by combining the static metric dimensions with the keys provided the optional Region key, expected to return something like {   "Region": "us-east-1",   "Operation": "ride",   "Service": "WildRydes" }. |
| <code><a href="#@cdklabs/multi-az-observability.MetricDimensions.zonalDimensions">zonalDimensions</a></code> | Gets the zonal dimensions for these metrics by combining the static metric dimensions with the keys provided for Availability Zone and optional Region, expected to return something like {   "Region": "us-east-1",   "AZ-ID": "use1-az1",   "Operation": "ride",   "Service": "WildRydes" }. |

---

##### `regionalDimensions` <a name="regionalDimensions" id="@cdklabs/multi-az-observability.MetricDimensions.regionalDimensions"></a>

```typescript
public regionalDimensions(region: string): {[ key: string ]: string}
```

Gets the regional dimensions for these metrics by combining the static metric dimensions with the keys provided the optional Region key, expected to return something like {   "Region": "us-east-1",   "Operation": "ride",   "Service": "WildRydes" }.

###### `region`<sup>Required</sup> <a name="region" id="@cdklabs/multi-az-observability.MetricDimensions.regionalDimensions.parameter.region"></a>

- *Type:* string

---

##### `zonalDimensions` <a name="zonalDimensions" id="@cdklabs/multi-az-observability.MetricDimensions.zonalDimensions"></a>

```typescript
public zonalDimensions(availabilityZoneId: string, region: string): {[ key: string ]: string}
```

Gets the zonal dimensions for these metrics by combining the static metric dimensions with the keys provided for Availability Zone and optional Region, expected to return something like {   "Region": "us-east-1",   "AZ-ID": "use1-az1",   "Operation": "ride",   "Service": "WildRydes" }.

###### `availabilityZoneId`<sup>Required</sup> <a name="availabilityZoneId" id="@cdklabs/multi-az-observability.MetricDimensions.zonalDimensions.parameter.availabilityZoneId"></a>

- *Type:* string

---

###### `region`<sup>Required</sup> <a name="region" id="@cdklabs/multi-az-observability.MetricDimensions.zonalDimensions.parameter.region"></a>

- *Type:* string

---


#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@cdklabs/multi-az-observability.MetricDimensions.property.availabilityZoneIdKey">availabilityZoneIdKey</a></code> | <code>string</code> | The key used to specify an Availability Zone specific metric dimension, for example: "AZ-ID". |
| <code><a href="#@cdklabs/multi-az-observability.MetricDimensions.property.staticDimensions">staticDimensions</a></code> | <code>{[ key: string ]: string}</code> | The dimensions that are the same for all Availability Zones for example: {   "Operation": "ride",   "Service": "WildRydes" }. |
| <code><a href="#@cdklabs/multi-az-observability.MetricDimensions.property.regionKey">regionKey</a></code> | <code>string</code> | The key used for the Region in your dimensions, if you provide one. |

---

##### `availabilityZoneIdKey`<sup>Required</sup> <a name="availabilityZoneIdKey" id="@cdklabs/multi-az-observability.MetricDimensions.property.availabilityZoneIdKey"></a>

```typescript
public readonly availabilityZoneIdKey: string;
```

- *Type:* string

The key used to specify an Availability Zone specific metric dimension, for example: "AZ-ID".

---

##### `staticDimensions`<sup>Required</sup> <a name="staticDimensions" id="@cdklabs/multi-az-observability.MetricDimensions.property.staticDimensions"></a>

```typescript
public readonly staticDimensions: {[ key: string ]: string};
```

- *Type:* {[ key: string ]: string}

The dimensions that are the same for all Availability Zones for example: {   "Operation": "ride",   "Service": "WildRydes" }.

---

##### `regionKey`<sup>Optional</sup> <a name="regionKey" id="@cdklabs/multi-az-observability.MetricDimensions.property.regionKey"></a>

```typescript
public readonly regionKey: string;
```

- *Type:* string
- *Default:* A region specific key and value is not added to your zonal and regional metric dimensions

The key used for the Region in your dimensions, if you provide one.

---


### Operation <a name="Operation" id="@cdklabs/multi-az-observability.Operation"></a>

- *Implements:* <a href="#@cdklabs/multi-az-observability.IOperation">IOperation</a>

A single operation that is part of a service.

#### Initializers <a name="Initializers" id="@cdklabs/multi-az-observability.Operation.Initializer"></a>

```typescript
import { Operation } from '@cdklabs/multi-az-observability'

new Operation(props: OperationProps)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@cdklabs/multi-az-observability.Operation.Initializer.parameter.props">props</a></code> | <code><a href="#@cdklabs/multi-az-observability.OperationProps">OperationProps</a></code> | *No description.* |

---

##### `props`<sup>Required</sup> <a name="props" id="@cdklabs/multi-az-observability.Operation.Initializer.parameter.props"></a>

- *Type:* <a href="#@cdklabs/multi-az-observability.OperationProps">OperationProps</a>

---



#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@cdklabs/multi-az-observability.Operation.property.critical">critical</a></code> | <code>boolean</code> | Indicates this is a critical operation for the service and will be included in service level metrics and dashboards. |
| <code><a href="#@cdklabs/multi-az-observability.Operation.property.httpMethods">httpMethods</a></code> | <code>string[]</code> | The http methods supported by the operation. |
| <code><a href="#@cdklabs/multi-az-observability.Operation.property.operationName">operationName</a></code> | <code>string</code> | The name of the operation. |
| <code><a href="#@cdklabs/multi-az-observability.Operation.property.path">path</a></code> | <code>string</code> | The HTTP path for the operation for canaries to run against, something like "/products/list". |
| <code><a href="#@cdklabs/multi-az-observability.Operation.property.serverSideAvailabilityMetricDetails">serverSideAvailabilityMetricDetails</a></code> | <code><a href="#@cdklabs/multi-az-observability.IOperationMetricDetails">IOperationMetricDetails</a></code> | The server side availability metric details. |
| <code><a href="#@cdklabs/multi-az-observability.Operation.property.serverSideLatencyMetricDetails">serverSideLatencyMetricDetails</a></code> | <code><a href="#@cdklabs/multi-az-observability.IOperationMetricDetails">IOperationMetricDetails</a></code> | The server side latency metric details. |
| <code><a href="#@cdklabs/multi-az-observability.Operation.property.service">service</a></code> | <code><a href="#@cdklabs/multi-az-observability.IService">IService</a></code> | The service the operation is associated with. |
| <code><a href="#@cdklabs/multi-az-observability.Operation.property.canaryMetricDetails">canaryMetricDetails</a></code> | <code><a href="#@cdklabs/multi-az-observability.ICanaryMetrics">ICanaryMetrics</a></code> | Optional metric details if the service has a canary. |
| <code><a href="#@cdklabs/multi-az-observability.Operation.property.canaryTestAvailabilityMetricsOverride">canaryTestAvailabilityMetricsOverride</a></code> | <code><a href="#@cdklabs/multi-az-observability.ICanaryTestMetricsOverride">ICanaryTestMetricsOverride</a></code> | The override values for automatically created canary tests so you can use values other than the service defaults to define the thresholds for availability. |
| <code><a href="#@cdklabs/multi-az-observability.Operation.property.canaryTestLatencyMetricsOverride">canaryTestLatencyMetricsOverride</a></code> | <code><a href="#@cdklabs/multi-az-observability.ICanaryTestMetricsOverride">ICanaryTestMetricsOverride</a></code> | The override values for automatically created canary tests so you can use values other than the service defaults to define the thresholds for latency. |
| <code><a href="#@cdklabs/multi-az-observability.Operation.property.canaryTestProps">canaryTestProps</a></code> | <code><a href="#@cdklabs/multi-az-observability.AddCanaryTestProps">AddCanaryTestProps</a></code> | If they have been added, the properties for creating new canary tests on this operation. |
| <code><a href="#@cdklabs/multi-az-observability.Operation.property.optOutOfServiceCreatedCanary">optOutOfServiceCreatedCanary</a></code> | <code>boolean</code> | Set to true if you have defined CanaryTestProps for your service, which applies to all operations, but you want to opt out of creating the canary test for this operation. |
| <code><a href="#@cdklabs/multi-az-observability.Operation.property.serverSideContributorInsightRuleDetails">serverSideContributorInsightRuleDetails</a></code> | <code><a href="#@cdklabs/multi-az-observability.IContributorInsightRuleDetails">IContributorInsightRuleDetails</a></code> | The server side details for contributor insights rules. |

---

##### `critical`<sup>Required</sup> <a name="critical" id="@cdklabs/multi-az-observability.Operation.property.critical"></a>

```typescript
public readonly critical: boolean;
```

- *Type:* boolean

Indicates this is a critical operation for the service and will be included in service level metrics and dashboards.

---

##### `httpMethods`<sup>Required</sup> <a name="httpMethods" id="@cdklabs/multi-az-observability.Operation.property.httpMethods"></a>

```typescript
public readonly httpMethods: string[];
```

- *Type:* string[]

The http methods supported by the operation.

---

##### `operationName`<sup>Required</sup> <a name="operationName" id="@cdklabs/multi-az-observability.Operation.property.operationName"></a>

```typescript
public readonly operationName: string;
```

- *Type:* string

The name of the operation.

---

##### `path`<sup>Required</sup> <a name="path" id="@cdklabs/multi-az-observability.Operation.property.path"></a>

```typescript
public readonly path: string;
```

- *Type:* string

The HTTP path for the operation for canaries to run against, something like "/products/list".

---

##### `serverSideAvailabilityMetricDetails`<sup>Required</sup> <a name="serverSideAvailabilityMetricDetails" id="@cdklabs/multi-az-observability.Operation.property.serverSideAvailabilityMetricDetails"></a>

```typescript
public readonly serverSideAvailabilityMetricDetails: IOperationMetricDetails;
```

- *Type:* <a href="#@cdklabs/multi-az-observability.IOperationMetricDetails">IOperationMetricDetails</a>

The server side availability metric details.

---

##### `serverSideLatencyMetricDetails`<sup>Required</sup> <a name="serverSideLatencyMetricDetails" id="@cdklabs/multi-az-observability.Operation.property.serverSideLatencyMetricDetails"></a>

```typescript
public readonly serverSideLatencyMetricDetails: IOperationMetricDetails;
```

- *Type:* <a href="#@cdklabs/multi-az-observability.IOperationMetricDetails">IOperationMetricDetails</a>

The server side latency metric details.

---

##### `service`<sup>Required</sup> <a name="service" id="@cdklabs/multi-az-observability.Operation.property.service"></a>

```typescript
public readonly service: IService;
```

- *Type:* <a href="#@cdklabs/multi-az-observability.IService">IService</a>

The service the operation is associated with.

---

##### `canaryMetricDetails`<sup>Optional</sup> <a name="canaryMetricDetails" id="@cdklabs/multi-az-observability.Operation.property.canaryMetricDetails"></a>

```typescript
public readonly canaryMetricDetails: ICanaryMetrics;
```

- *Type:* <a href="#@cdklabs/multi-az-observability.ICanaryMetrics">ICanaryMetrics</a>

Optional metric details if the service has a canary.

---

##### `canaryTestAvailabilityMetricsOverride`<sup>Optional</sup> <a name="canaryTestAvailabilityMetricsOverride" id="@cdklabs/multi-az-observability.Operation.property.canaryTestAvailabilityMetricsOverride"></a>

```typescript
public readonly canaryTestAvailabilityMetricsOverride: ICanaryTestMetricsOverride;
```

- *Type:* <a href="#@cdklabs/multi-az-observability.ICanaryTestMetricsOverride">ICanaryTestMetricsOverride</a>

The override values for automatically created canary tests so you can use values other than the service defaults to define the thresholds for availability.

---

##### `canaryTestLatencyMetricsOverride`<sup>Optional</sup> <a name="canaryTestLatencyMetricsOverride" id="@cdklabs/multi-az-observability.Operation.property.canaryTestLatencyMetricsOverride"></a>

```typescript
public readonly canaryTestLatencyMetricsOverride: ICanaryTestMetricsOverride;
```

- *Type:* <a href="#@cdklabs/multi-az-observability.ICanaryTestMetricsOverride">ICanaryTestMetricsOverride</a>

The override values for automatically created canary tests so you can use values other than the service defaults to define the thresholds for latency.

---

##### `canaryTestProps`<sup>Optional</sup> <a name="canaryTestProps" id="@cdklabs/multi-az-observability.Operation.property.canaryTestProps"></a>

```typescript
public readonly canaryTestProps: AddCanaryTestProps;
```

- *Type:* <a href="#@cdklabs/multi-az-observability.AddCanaryTestProps">AddCanaryTestProps</a>

If they have been added, the properties for creating new canary tests on this operation.

---

##### `optOutOfServiceCreatedCanary`<sup>Optional</sup> <a name="optOutOfServiceCreatedCanary" id="@cdklabs/multi-az-observability.Operation.property.optOutOfServiceCreatedCanary"></a>

```typescript
public readonly optOutOfServiceCreatedCanary: boolean;
```

- *Type:* boolean
- *Default:* The operation is not opted out

Set to true if you have defined CanaryTestProps for your service, which applies to all operations, but you want to opt out of creating the canary test for this operation.

---

##### `serverSideContributorInsightRuleDetails`<sup>Optional</sup> <a name="serverSideContributorInsightRuleDetails" id="@cdklabs/multi-az-observability.Operation.property.serverSideContributorInsightRuleDetails"></a>

```typescript
public readonly serverSideContributorInsightRuleDetails: IContributorInsightRuleDetails;
```

- *Type:* <a href="#@cdklabs/multi-az-observability.IContributorInsightRuleDetails">IContributorInsightRuleDetails</a>

The server side details for contributor insights rules.

---


### OperationMetricDetails <a name="OperationMetricDetails" id="@cdklabs/multi-az-observability.OperationMetricDetails"></a>

- *Implements:* <a href="#@cdklabs/multi-az-observability.IOperationMetricDetails">IOperationMetricDetails</a>

Generic metric details for an operation.

#### Initializers <a name="Initializers" id="@cdklabs/multi-az-observability.OperationMetricDetails.Initializer"></a>

```typescript
import { OperationMetricDetails } from '@cdklabs/multi-az-observability'

new OperationMetricDetails(props: OperationMetricDetailsProps, defaultProps: IServiceMetricDetails)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@cdklabs/multi-az-observability.OperationMetricDetails.Initializer.parameter.props">props</a></code> | <code><a href="#@cdklabs/multi-az-observability.OperationMetricDetailsProps">OperationMetricDetailsProps</a></code> | *No description.* |
| <code><a href="#@cdklabs/multi-az-observability.OperationMetricDetails.Initializer.parameter.defaultProps">defaultProps</a></code> | <code><a href="#@cdklabs/multi-az-observability.IServiceMetricDetails">IServiceMetricDetails</a></code> | *No description.* |

---

##### `props`<sup>Required</sup> <a name="props" id="@cdklabs/multi-az-observability.OperationMetricDetails.Initializer.parameter.props"></a>

- *Type:* <a href="#@cdklabs/multi-az-observability.OperationMetricDetailsProps">OperationMetricDetailsProps</a>

---

##### `defaultProps`<sup>Required</sup> <a name="defaultProps" id="@cdklabs/multi-az-observability.OperationMetricDetails.Initializer.parameter.defaultProps"></a>

- *Type:* <a href="#@cdklabs/multi-az-observability.IServiceMetricDetails">IServiceMetricDetails</a>

---



#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@cdklabs/multi-az-observability.OperationMetricDetails.property.alarmStatistic">alarmStatistic</a></code> | <code>string</code> | The statistic used for alarms, for availability metrics this should be "Sum", for latency metrics it could something like "p99" or "p99.9". |
| <code><a href="#@cdklabs/multi-az-observability.OperationMetricDetails.property.datapointsToAlarm">datapointsToAlarm</a></code> | <code>number</code> | The number of datapoints to alarm on for latency and availability alarms. |
| <code><a href="#@cdklabs/multi-az-observability.OperationMetricDetails.property.evaluationPeriods">evaluationPeriods</a></code> | <code>number</code> | The number of evaluation periods for latency and availabiltiy alarms. |
| <code><a href="#@cdklabs/multi-az-observability.OperationMetricDetails.property.faultAlarmThreshold">faultAlarmThreshold</a></code> | <code>number</code> | The threshold for alarms associated with fault metrics, for example if measuring fault rate, the threshold may be 1, meaning you would want an alarm that triggers if the fault rate goes above 1%. |
| <code><a href="#@cdklabs/multi-az-observability.OperationMetricDetails.property.faultMetricNames">faultMetricNames</a></code> | <code>string[]</code> | The names of fault indicating metrics. |
| <code><a href="#@cdklabs/multi-az-observability.OperationMetricDetails.property.metricDimensions">metricDimensions</a></code> | <code><a href="#@cdklabs/multi-az-observability.MetricDimensions">MetricDimensions</a></code> | The metric dimensions for this operation, must be implemented as a concrete class by the user. |
| <code><a href="#@cdklabs/multi-az-observability.OperationMetricDetails.property.metricNamespace">metricNamespace</a></code> | <code>string</code> | The CloudWatch metric namespace for these metrics. |
| <code><a href="#@cdklabs/multi-az-observability.OperationMetricDetails.property.operationName">operationName</a></code> | <code>string</code> | The operation these metric details are for. |
| <code><a href="#@cdklabs/multi-az-observability.OperationMetricDetails.property.period">period</a></code> | <code>aws-cdk-lib.Duration</code> | The period for the metrics. |
| <code><a href="#@cdklabs/multi-az-observability.OperationMetricDetails.property.successAlarmThreshold">successAlarmThreshold</a></code> | <code>number</code> | The threshold for alarms associated with success metrics, for example if measuring success rate, the threshold may be 99, meaning you would want an alarm that triggers if success drops below 99%. |
| <code><a href="#@cdklabs/multi-az-observability.OperationMetricDetails.property.successMetricNames">successMetricNames</a></code> | <code>string[]</code> | The names of success indicating metrics. |
| <code><a href="#@cdklabs/multi-az-observability.OperationMetricDetails.property.unit">unit</a></code> | <code>aws-cdk-lib.aws_cloudwatch.Unit</code> | The unit used for these metrics. |
| <code><a href="#@cdklabs/multi-az-observability.OperationMetricDetails.property.graphedFaultStatistics">graphedFaultStatistics</a></code> | <code>string[]</code> | The statistics for faults you want to appear on dashboards, for example, with latency metrics, you might want p50, p99, and tm99. |
| <code><a href="#@cdklabs/multi-az-observability.OperationMetricDetails.property.graphedSuccessStatistics">graphedSuccessStatistics</a></code> | <code>string[]</code> | The statistics for successes you want to appear on dashboards, for example, with latency metrics, you might want p50, p99, and tm99. |

---

##### `alarmStatistic`<sup>Required</sup> <a name="alarmStatistic" id="@cdklabs/multi-az-observability.OperationMetricDetails.property.alarmStatistic"></a>

```typescript
public readonly alarmStatistic: string;
```

- *Type:* string

The statistic used for alarms, for availability metrics this should be "Sum", for latency metrics it could something like "p99" or "p99.9".

---

##### `datapointsToAlarm`<sup>Required</sup> <a name="datapointsToAlarm" id="@cdklabs/multi-az-observability.OperationMetricDetails.property.datapointsToAlarm"></a>

```typescript
public readonly datapointsToAlarm: number;
```

- *Type:* number

The number of datapoints to alarm on for latency and availability alarms.

---

##### `evaluationPeriods`<sup>Required</sup> <a name="evaluationPeriods" id="@cdklabs/multi-az-observability.OperationMetricDetails.property.evaluationPeriods"></a>

```typescript
public readonly evaluationPeriods: number;
```

- *Type:* number

The number of evaluation periods for latency and availabiltiy alarms.

---

##### `faultAlarmThreshold`<sup>Required</sup> <a name="faultAlarmThreshold" id="@cdklabs/multi-az-observability.OperationMetricDetails.property.faultAlarmThreshold"></a>

```typescript
public readonly faultAlarmThreshold: number;
```

- *Type:* number

The threshold for alarms associated with fault metrics, for example if measuring fault rate, the threshold may be 1, meaning you would want an alarm that triggers if the fault rate goes above 1%.

---

##### `faultMetricNames`<sup>Required</sup> <a name="faultMetricNames" id="@cdklabs/multi-az-observability.OperationMetricDetails.property.faultMetricNames"></a>

```typescript
public readonly faultMetricNames: string[];
```

- *Type:* string[]

The names of fault indicating metrics.

---

##### `metricDimensions`<sup>Required</sup> <a name="metricDimensions" id="@cdklabs/multi-az-observability.OperationMetricDetails.property.metricDimensions"></a>

```typescript
public readonly metricDimensions: MetricDimensions;
```

- *Type:* <a href="#@cdklabs/multi-az-observability.MetricDimensions">MetricDimensions</a>

The metric dimensions for this operation, must be implemented as a concrete class by the user.

---

##### `metricNamespace`<sup>Required</sup> <a name="metricNamespace" id="@cdklabs/multi-az-observability.OperationMetricDetails.property.metricNamespace"></a>

```typescript
public readonly metricNamespace: string;
```

- *Type:* string

The CloudWatch metric namespace for these metrics.

---

##### `operationName`<sup>Required</sup> <a name="operationName" id="@cdklabs/multi-az-observability.OperationMetricDetails.property.operationName"></a>

```typescript
public readonly operationName: string;
```

- *Type:* string

The operation these metric details are for.

---

##### `period`<sup>Required</sup> <a name="period" id="@cdklabs/multi-az-observability.OperationMetricDetails.property.period"></a>

```typescript
public readonly period: Duration;
```

- *Type:* aws-cdk-lib.Duration

The period for the metrics.

---

##### `successAlarmThreshold`<sup>Required</sup> <a name="successAlarmThreshold" id="@cdklabs/multi-az-observability.OperationMetricDetails.property.successAlarmThreshold"></a>

```typescript
public readonly successAlarmThreshold: number;
```

- *Type:* number

The threshold for alarms associated with success metrics, for example if measuring success rate, the threshold may be 99, meaning you would want an alarm that triggers if success drops below 99%.

---

##### `successMetricNames`<sup>Required</sup> <a name="successMetricNames" id="@cdklabs/multi-az-observability.OperationMetricDetails.property.successMetricNames"></a>

```typescript
public readonly successMetricNames: string[];
```

- *Type:* string[]

The names of success indicating metrics.

---

##### `unit`<sup>Required</sup> <a name="unit" id="@cdklabs/multi-az-observability.OperationMetricDetails.property.unit"></a>

```typescript
public readonly unit: Unit;
```

- *Type:* aws-cdk-lib.aws_cloudwatch.Unit

The unit used for these metrics.

---

##### `graphedFaultStatistics`<sup>Optional</sup> <a name="graphedFaultStatistics" id="@cdklabs/multi-az-observability.OperationMetricDetails.property.graphedFaultStatistics"></a>

```typescript
public readonly graphedFaultStatistics: string[];
```

- *Type:* string[]
- *Default:* For availability metrics, this will be "Sum", for latency metrics it will be just "p99"

The statistics for faults you want to appear on dashboards, for example, with latency metrics, you might want p50, p99, and tm99.

For availability
metrics this will typically just be "Sum".

---

##### `graphedSuccessStatistics`<sup>Optional</sup> <a name="graphedSuccessStatistics" id="@cdklabs/multi-az-observability.OperationMetricDetails.property.graphedSuccessStatistics"></a>

```typescript
public readonly graphedSuccessStatistics: string[];
```

- *Type:* string[]
- *Default:* For availability metrics, this will be "Sum", for latency metrics it will be just "p99"

The statistics for successes you want to appear on dashboards, for example, with latency metrics, you might want p50, p99, and tm99.

For availability
metrics this will typically just be "Sum".

---


### Service <a name="Service" id="@cdklabs/multi-az-observability.Service"></a>

- *Implements:* <a href="#@cdklabs/multi-az-observability.IService">IService</a>

The representation of a service composed of multiple operations.

#### Initializers <a name="Initializers" id="@cdklabs/multi-az-observability.Service.Initializer"></a>

```typescript
import { Service } from '@cdklabs/multi-az-observability'

new Service(props: ServiceProps)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@cdklabs/multi-az-observability.Service.Initializer.parameter.props">props</a></code> | <code><a href="#@cdklabs/multi-az-observability.ServiceProps">ServiceProps</a></code> | *No description.* |

---

##### `props`<sup>Required</sup> <a name="props" id="@cdklabs/multi-az-observability.Service.Initializer.parameter.props"></a>

- *Type:* <a href="#@cdklabs/multi-az-observability.ServiceProps">ServiceProps</a>

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#@cdklabs/multi-az-observability.Service.addOperation">addOperation</a></code> | Adds an operation to this service and sets the operation's service property. |

---

##### `addOperation` <a name="addOperation" id="@cdklabs/multi-az-observability.Service.addOperation"></a>

```typescript
public addOperation(operation: IOperation): void
```

Adds an operation to this service and sets the operation's service property.

###### `operation`<sup>Required</sup> <a name="operation" id="@cdklabs/multi-az-observability.Service.addOperation.parameter.operation"></a>

- *Type:* <a href="#@cdklabs/multi-az-observability.IOperation">IOperation</a>

---


#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@cdklabs/multi-az-observability.Service.property.availabilityZoneNames">availabilityZoneNames</a></code> | <code>string[]</code> | A list of the Availability Zone names used by this application. |
| <code><a href="#@cdklabs/multi-az-observability.Service.property.baseUrl">baseUrl</a></code> | <code>string</code> | The base endpoint for this service, like "https://www.example.com". Operation paths will be appended to this endpoint for canary testing the service. |
| <code><a href="#@cdklabs/multi-az-observability.Service.property.defaultAvailabilityMetricDetails">defaultAvailabilityMetricDetails</a></code> | <code><a href="#@cdklabs/multi-az-observability.IServiceMetricDetails">IServiceMetricDetails</a></code> | The default settings that are used for availability metrics for all operations unless specifically overridden in an operation definition. |
| <code><a href="#@cdklabs/multi-az-observability.Service.property.defaultLatencyMetricDetails">defaultLatencyMetricDetails</a></code> | <code><a href="#@cdklabs/multi-az-observability.IServiceMetricDetails">IServiceMetricDetails</a></code> | The default settings that are used for availability metrics for all operations unless specifically overridden in an operation definition. |
| <code><a href="#@cdklabs/multi-az-observability.Service.property.faultCountThreshold">faultCountThreshold</a></code> | <code>number</code> | The fault count threshold that indicates the service is unhealthy. |
| <code><a href="#@cdklabs/multi-az-observability.Service.property.operations">operations</a></code> | <code><a href="#@cdklabs/multi-az-observability.IOperation">IOperation</a>[]</code> | The operations that are part of this service. |
| <code><a href="#@cdklabs/multi-az-observability.Service.property.period">period</a></code> | <code>aws-cdk-lib.Duration</code> | The period for which metrics for the service should be aggregated. |
| <code><a href="#@cdklabs/multi-az-observability.Service.property.serviceName">serviceName</a></code> | <code>string</code> | The name of your service. |
| <code><a href="#@cdklabs/multi-az-observability.Service.property.canaryTestProps">canaryTestProps</a></code> | <code><a href="#@cdklabs/multi-az-observability.AddCanaryTestProps">AddCanaryTestProps</a></code> | Define these settings if you want to automatically add canary tests to your operations. |
| <code><a href="#@cdklabs/multi-az-observability.Service.property.defaultContributorInsightRuleDetails">defaultContributorInsightRuleDetails</a></code> | <code><a href="#@cdklabs/multi-az-observability.IContributorInsightRuleDetails">IContributorInsightRuleDetails</a></code> | The default settings that are used for contributor insight rules. |
| <code><a href="#@cdklabs/multi-az-observability.Service.property.loadBalancer">loadBalancer</a></code> | <code>aws-cdk-lib.aws_elasticloadbalancingv2.ILoadBalancerV2</code> | The load balancer this service sits behind. |

---

##### `availabilityZoneNames`<sup>Required</sup> <a name="availabilityZoneNames" id="@cdklabs/multi-az-observability.Service.property.availabilityZoneNames"></a>

```typescript
public readonly availabilityZoneNames: string[];
```

- *Type:* string[]

A list of the Availability Zone names used by this application.

---

##### `baseUrl`<sup>Required</sup> <a name="baseUrl" id="@cdklabs/multi-az-observability.Service.property.baseUrl"></a>

```typescript
public readonly baseUrl: string;
```

- *Type:* string

The base endpoint for this service, like "https://www.example.com". Operation paths will be appended to this endpoint for canary testing the service.

---

##### `defaultAvailabilityMetricDetails`<sup>Required</sup> <a name="defaultAvailabilityMetricDetails" id="@cdklabs/multi-az-observability.Service.property.defaultAvailabilityMetricDetails"></a>

```typescript
public readonly defaultAvailabilityMetricDetails: IServiceMetricDetails;
```

- *Type:* <a href="#@cdklabs/multi-az-observability.IServiceMetricDetails">IServiceMetricDetails</a>

The default settings that are used for availability metrics for all operations unless specifically overridden in an operation definition.

---

##### `defaultLatencyMetricDetails`<sup>Required</sup> <a name="defaultLatencyMetricDetails" id="@cdklabs/multi-az-observability.Service.property.defaultLatencyMetricDetails"></a>

```typescript
public readonly defaultLatencyMetricDetails: IServiceMetricDetails;
```

- *Type:* <a href="#@cdklabs/multi-az-observability.IServiceMetricDetails">IServiceMetricDetails</a>

The default settings that are used for availability metrics for all operations unless specifically overridden in an operation definition.

---

##### `faultCountThreshold`<sup>Required</sup> <a name="faultCountThreshold" id="@cdklabs/multi-az-observability.Service.property.faultCountThreshold"></a>

```typescript
public readonly faultCountThreshold: number;
```

- *Type:* number

The fault count threshold that indicates the service is unhealthy.

This is an absolute value of faults
being produced by all critical operations in aggregate.

---

##### `operations`<sup>Required</sup> <a name="operations" id="@cdklabs/multi-az-observability.Service.property.operations"></a>

```typescript
public readonly operations: IOperation[];
```

- *Type:* <a href="#@cdklabs/multi-az-observability.IOperation">IOperation</a>[]

The operations that are part of this service.

---

##### `period`<sup>Required</sup> <a name="period" id="@cdklabs/multi-az-observability.Service.property.period"></a>

```typescript
public readonly period: Duration;
```

- *Type:* aws-cdk-lib.Duration

The period for which metrics for the service should be aggregated.

---

##### `serviceName`<sup>Required</sup> <a name="serviceName" id="@cdklabs/multi-az-observability.Service.property.serviceName"></a>

```typescript
public readonly serviceName: string;
```

- *Type:* string

The name of your service.

---

##### `canaryTestProps`<sup>Optional</sup> <a name="canaryTestProps" id="@cdklabs/multi-az-observability.Service.property.canaryTestProps"></a>

```typescript
public readonly canaryTestProps: AddCanaryTestProps;
```

- *Type:* <a href="#@cdklabs/multi-az-observability.AddCanaryTestProps">AddCanaryTestProps</a>
- *Default:* Automatic canary tests will not be created for operations in this service.

Define these settings if you want to automatically add canary tests to your operations.

Operations can individually opt out
of canary test creation if you define this setting.

---

##### `defaultContributorInsightRuleDetails`<sup>Optional</sup> <a name="defaultContributorInsightRuleDetails" id="@cdklabs/multi-az-observability.Service.property.defaultContributorInsightRuleDetails"></a>

```typescript
public readonly defaultContributorInsightRuleDetails: IContributorInsightRuleDetails;
```

- *Type:* <a href="#@cdklabs/multi-az-observability.IContributorInsightRuleDetails">IContributorInsightRuleDetails</a>
- *Default:* No defaults are provided and must be specified per operation

The default settings that are used for contributor insight rules.

---

##### `loadBalancer`<sup>Optional</sup> <a name="loadBalancer" id="@cdklabs/multi-az-observability.Service.property.loadBalancer"></a>

```typescript
public readonly loadBalancer: ILoadBalancerV2;
```

- *Type:* aws-cdk-lib.aws_elasticloadbalancingv2.ILoadBalancerV2
- *Default:* No load balancer metrics will be included in dashboards and its ARN will not be added to top level AZ alarm descriptions.

The load balancer this service sits behind.

---


### ServiceMetricDetails <a name="ServiceMetricDetails" id="@cdklabs/multi-az-observability.ServiceMetricDetails"></a>

- *Implements:* <a href="#@cdklabs/multi-az-observability.IServiceMetricDetails">IServiceMetricDetails</a>

Default metric details for a service.

#### Initializers <a name="Initializers" id="@cdklabs/multi-az-observability.ServiceMetricDetails.Initializer"></a>

```typescript
import { ServiceMetricDetails } from '@cdklabs/multi-az-observability'

new ServiceMetricDetails(props: ServiceMetricDetailsProps)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@cdklabs/multi-az-observability.ServiceMetricDetails.Initializer.parameter.props">props</a></code> | <code><a href="#@cdklabs/multi-az-observability.ServiceMetricDetailsProps">ServiceMetricDetailsProps</a></code> | *No description.* |

---

##### `props`<sup>Required</sup> <a name="props" id="@cdklabs/multi-az-observability.ServiceMetricDetails.Initializer.parameter.props"></a>

- *Type:* <a href="#@cdklabs/multi-az-observability.ServiceMetricDetailsProps">ServiceMetricDetailsProps</a>

---



#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@cdklabs/multi-az-observability.ServiceMetricDetails.property.alarmStatistic">alarmStatistic</a></code> | <code>string</code> | The statistic used for alarms, for availability metrics this should be "Sum", for latency metrics it could something like "p99" or "p99.9". |
| <code><a href="#@cdklabs/multi-az-observability.ServiceMetricDetails.property.datapointsToAlarm">datapointsToAlarm</a></code> | <code>number</code> | The number of datapoints to alarm on for latency and availability alarms. |
| <code><a href="#@cdklabs/multi-az-observability.ServiceMetricDetails.property.evaluationPeriods">evaluationPeriods</a></code> | <code>number</code> | The number of evaluation periods for latency and availabiltiy alarms. |
| <code><a href="#@cdklabs/multi-az-observability.ServiceMetricDetails.property.faultAlarmThreshold">faultAlarmThreshold</a></code> | <code>number</code> | The threshold for alarms associated with fault metrics, for example if measuring fault rate, the threshold may be 1, meaning you would want an alarm that triggers if the fault rate goes above 1%. |
| <code><a href="#@cdklabs/multi-az-observability.ServiceMetricDetails.property.faultMetricNames">faultMetricNames</a></code> | <code>string[]</code> | The names of fault indicating metrics. |
| <code><a href="#@cdklabs/multi-az-observability.ServiceMetricDetails.property.metricNamespace">metricNamespace</a></code> | <code>string</code> | The CloudWatch metric namespace for these metrics. |
| <code><a href="#@cdklabs/multi-az-observability.ServiceMetricDetails.property.period">period</a></code> | <code>aws-cdk-lib.Duration</code> | The period for the metrics. |
| <code><a href="#@cdklabs/multi-az-observability.ServiceMetricDetails.property.successAlarmThreshold">successAlarmThreshold</a></code> | <code>number</code> | The threshold for alarms associated with success metrics, for example if measuring success rate, the threshold may be 99, meaning you would want an alarm that triggers if success drops below 99%. |
| <code><a href="#@cdklabs/multi-az-observability.ServiceMetricDetails.property.successMetricNames">successMetricNames</a></code> | <code>string[]</code> | The names of success indicating metrics. |
| <code><a href="#@cdklabs/multi-az-observability.ServiceMetricDetails.property.unit">unit</a></code> | <code>aws-cdk-lib.aws_cloudwatch.Unit</code> | The unit used for these metrics. |
| <code><a href="#@cdklabs/multi-az-observability.ServiceMetricDetails.property.graphedFaultStatistics">graphedFaultStatistics</a></code> | <code>string[]</code> | The statistics for faults you want to appear on dashboards, for example, with latency metrics, you might want p50, p99, and tm99. |
| <code><a href="#@cdklabs/multi-az-observability.ServiceMetricDetails.property.graphedSuccessStatistics">graphedSuccessStatistics</a></code> | <code>string[]</code> | The statistics for successes you want to appear on dashboards, for example, with latency metrics, you might want p50, p99, and tm99. |

---

##### `alarmStatistic`<sup>Required</sup> <a name="alarmStatistic" id="@cdklabs/multi-az-observability.ServiceMetricDetails.property.alarmStatistic"></a>

```typescript
public readonly alarmStatistic: string;
```

- *Type:* string

The statistic used for alarms, for availability metrics this should be "Sum", for latency metrics it could something like "p99" or "p99.9".

---

##### `datapointsToAlarm`<sup>Required</sup> <a name="datapointsToAlarm" id="@cdklabs/multi-az-observability.ServiceMetricDetails.property.datapointsToAlarm"></a>

```typescript
public readonly datapointsToAlarm: number;
```

- *Type:* number

The number of datapoints to alarm on for latency and availability alarms.

---

##### `evaluationPeriods`<sup>Required</sup> <a name="evaluationPeriods" id="@cdklabs/multi-az-observability.ServiceMetricDetails.property.evaluationPeriods"></a>

```typescript
public readonly evaluationPeriods: number;
```

- *Type:* number

The number of evaluation periods for latency and availabiltiy alarms.

---

##### `faultAlarmThreshold`<sup>Required</sup> <a name="faultAlarmThreshold" id="@cdklabs/multi-az-observability.ServiceMetricDetails.property.faultAlarmThreshold"></a>

```typescript
public readonly faultAlarmThreshold: number;
```

- *Type:* number

The threshold for alarms associated with fault metrics, for example if measuring fault rate, the threshold may be 1, meaning you would want an alarm that triggers if the fault rate goes above 1%.

---

##### `faultMetricNames`<sup>Required</sup> <a name="faultMetricNames" id="@cdklabs/multi-az-observability.ServiceMetricDetails.property.faultMetricNames"></a>

```typescript
public readonly faultMetricNames: string[];
```

- *Type:* string[]

The names of fault indicating metrics.

---

##### `metricNamespace`<sup>Required</sup> <a name="metricNamespace" id="@cdklabs/multi-az-observability.ServiceMetricDetails.property.metricNamespace"></a>

```typescript
public readonly metricNamespace: string;
```

- *Type:* string

The CloudWatch metric namespace for these metrics.

---

##### `period`<sup>Required</sup> <a name="period" id="@cdklabs/multi-az-observability.ServiceMetricDetails.property.period"></a>

```typescript
public readonly period: Duration;
```

- *Type:* aws-cdk-lib.Duration

The period for the metrics.

---

##### `successAlarmThreshold`<sup>Required</sup> <a name="successAlarmThreshold" id="@cdklabs/multi-az-observability.ServiceMetricDetails.property.successAlarmThreshold"></a>

```typescript
public readonly successAlarmThreshold: number;
```

- *Type:* number

The threshold for alarms associated with success metrics, for example if measuring success rate, the threshold may be 99, meaning you would want an alarm that triggers if success drops below 99%.

---

##### `successMetricNames`<sup>Required</sup> <a name="successMetricNames" id="@cdklabs/multi-az-observability.ServiceMetricDetails.property.successMetricNames"></a>

```typescript
public readonly successMetricNames: string[];
```

- *Type:* string[]

The names of success indicating metrics.

---

##### `unit`<sup>Required</sup> <a name="unit" id="@cdklabs/multi-az-observability.ServiceMetricDetails.property.unit"></a>

```typescript
public readonly unit: Unit;
```

- *Type:* aws-cdk-lib.aws_cloudwatch.Unit

The unit used for these metrics.

---

##### `graphedFaultStatistics`<sup>Optional</sup> <a name="graphedFaultStatistics" id="@cdklabs/multi-az-observability.ServiceMetricDetails.property.graphedFaultStatistics"></a>

```typescript
public readonly graphedFaultStatistics: string[];
```

- *Type:* string[]
- *Default:* For availability metrics, this will be "Sum", for latency metrics it will be just "p99"

The statistics for faults you want to appear on dashboards, for example, with latency metrics, you might want p50, p99, and tm99.

For availability
metrics this will typically just be "Sum".

---

##### `graphedSuccessStatistics`<sup>Optional</sup> <a name="graphedSuccessStatistics" id="@cdklabs/multi-az-observability.ServiceMetricDetails.property.graphedSuccessStatistics"></a>

```typescript
public readonly graphedSuccessStatistics: string[];
```

- *Type:* string[]
- *Default:* For availability metrics, this will be "Sum", for latency metrics it will be just "p99"

The statistics for successes you want to appear on dashboards, for example, with latency metrics, you might want p50, p99, and tm99.

For availability
metrics this will typically just be "Sum".

---


## Protocols <a name="Protocols" id="Protocols"></a>

### IAvailabilityZoneMapper <a name="IAvailabilityZoneMapper" id="@cdklabs/multi-az-observability.IAvailabilityZoneMapper"></a>

- *Extends:* constructs.IConstruct

- *Implemented By:* <a href="#@cdklabs/multi-az-observability.AvailabilityZoneMapper">AvailabilityZoneMapper</a>, <a href="#@cdklabs/multi-az-observability.IAvailabilityZoneMapper">IAvailabilityZoneMapper</a>

A wrapper for the Availability Zone mapper construct that allows you to translate Availability Zone names to Availability Zone Ids and vice a versa using the mapping in the AWS account where this is deployed.

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#@cdklabs/multi-az-observability.IAvailabilityZoneMapper.allAvailabilityZoneIdsAsArray">allAvailabilityZoneIdsAsArray</a></code> | Returns a reference that can be cast to a string array with all of the Availability Zone Ids. |
| <code><a href="#@cdklabs/multi-az-observability.IAvailabilityZoneMapper.allAvailabilityZoneIdsAsCommaDelimitedList">allAvailabilityZoneIdsAsCommaDelimitedList</a></code> | Returns a comma delimited list of Availability Zone Ids for the supplied Availability Zone names. |
| <code><a href="#@cdklabs/multi-az-observability.IAvailabilityZoneMapper.allAvailabilityZoneNamesAsCommaDelimitedList">allAvailabilityZoneNamesAsCommaDelimitedList</a></code> | Gets all of the Availability Zone names in this Region as a comma delimited list. |
| <code><a href="#@cdklabs/multi-az-observability.IAvailabilityZoneMapper.availabilityZoneId">availabilityZoneId</a></code> | Gets the Availability Zone Id for the given Availability Zone Name in this account. |
| <code><a href="#@cdklabs/multi-az-observability.IAvailabilityZoneMapper.availabilityZoneIdFromAvailabilityZoneLetter">availabilityZoneIdFromAvailabilityZoneLetter</a></code> | Given a letter like "f" or "a", returns the Availability Zone Id for that Availability Zone name in this account. |
| <code><a href="#@cdklabs/multi-az-observability.IAvailabilityZoneMapper.availabilityZoneIdsAsArray">availabilityZoneIdsAsArray</a></code> | Returns an array for Availability Zone Ids for the supplied Availability Zone names, they are returned in the same order the names were provided. |
| <code><a href="#@cdklabs/multi-az-observability.IAvailabilityZoneMapper.availabilityZoneIdsAsCommaDelimitedList">availabilityZoneIdsAsCommaDelimitedList</a></code> | Returns a comma delimited list of Availability Zone Ids for the supplied Availability Zone names. |
| <code><a href="#@cdklabs/multi-az-observability.IAvailabilityZoneMapper.availabilityZoneName">availabilityZoneName</a></code> | Gets the Availability Zone Name for the given Availability Zone Id in this account. |
| <code><a href="#@cdklabs/multi-az-observability.IAvailabilityZoneMapper.regionPrefixForAvailabilityZoneIds">regionPrefixForAvailabilityZoneIds</a></code> | Gets the prefix for the region used with Availability Zone Ids, for example in us-east-1, this returns "use1". |

---

##### `allAvailabilityZoneIdsAsArray` <a name="allAvailabilityZoneIdsAsArray" id="@cdklabs/multi-az-observability.IAvailabilityZoneMapper.allAvailabilityZoneIdsAsArray"></a>

```typescript
public allAvailabilityZoneIdsAsArray(): Reference
```

Returns a reference that can be cast to a string array with all of the Availability Zone Ids.

##### `allAvailabilityZoneIdsAsCommaDelimitedList` <a name="allAvailabilityZoneIdsAsCommaDelimitedList" id="@cdklabs/multi-az-observability.IAvailabilityZoneMapper.allAvailabilityZoneIdsAsCommaDelimitedList"></a>

```typescript
public allAvailabilityZoneIdsAsCommaDelimitedList(): string
```

Returns a comma delimited list of Availability Zone Ids for the supplied Availability Zone names.

You can use this string with Fn.Select(x, Fn.Split(",", azs)) to
get a specific Availability Zone Id

##### `allAvailabilityZoneNamesAsCommaDelimitedList` <a name="allAvailabilityZoneNamesAsCommaDelimitedList" id="@cdklabs/multi-az-observability.IAvailabilityZoneMapper.allAvailabilityZoneNamesAsCommaDelimitedList"></a>

```typescript
public allAvailabilityZoneNamesAsCommaDelimitedList(): string
```

Gets all of the Availability Zone names in this Region as a comma delimited list.

You can use this string with Fn.Select(x, Fn.Split(",", azs)) to
get a specific Availability Zone Name

##### `availabilityZoneId` <a name="availabilityZoneId" id="@cdklabs/multi-az-observability.IAvailabilityZoneMapper.availabilityZoneId"></a>

```typescript
public availabilityZoneId(availabilityZoneName: string): string
```

Gets the Availability Zone Id for the given Availability Zone Name in this account.

###### `availabilityZoneName`<sup>Required</sup> <a name="availabilityZoneName" id="@cdklabs/multi-az-observability.IAvailabilityZoneMapper.availabilityZoneId.parameter.availabilityZoneName"></a>

- *Type:* string

---

##### `availabilityZoneIdFromAvailabilityZoneLetter` <a name="availabilityZoneIdFromAvailabilityZoneLetter" id="@cdklabs/multi-az-observability.IAvailabilityZoneMapper.availabilityZoneIdFromAvailabilityZoneLetter"></a>

```typescript
public availabilityZoneIdFromAvailabilityZoneLetter(letter: string): string
```

Given a letter like "f" or "a", returns the Availability Zone Id for that Availability Zone name in this account.

###### `letter`<sup>Required</sup> <a name="letter" id="@cdklabs/multi-az-observability.IAvailabilityZoneMapper.availabilityZoneIdFromAvailabilityZoneLetter.parameter.letter"></a>

- *Type:* string

---

##### `availabilityZoneIdsAsArray` <a name="availabilityZoneIdsAsArray" id="@cdklabs/multi-az-observability.IAvailabilityZoneMapper.availabilityZoneIdsAsArray"></a>

```typescript
public availabilityZoneIdsAsArray(availabilityZoneNames: string[]): string[]
```

Returns an array for Availability Zone Ids for the supplied Availability Zone names, they are returned in the same order the names were provided.

###### `availabilityZoneNames`<sup>Required</sup> <a name="availabilityZoneNames" id="@cdklabs/multi-az-observability.IAvailabilityZoneMapper.availabilityZoneIdsAsArray.parameter.availabilityZoneNames"></a>

- *Type:* string[]

---

##### `availabilityZoneIdsAsCommaDelimitedList` <a name="availabilityZoneIdsAsCommaDelimitedList" id="@cdklabs/multi-az-observability.IAvailabilityZoneMapper.availabilityZoneIdsAsCommaDelimitedList"></a>

```typescript
public availabilityZoneIdsAsCommaDelimitedList(availabilityZoneNames: string[]): string
```

Returns a comma delimited list of Availability Zone Ids for the supplied Availability Zone names.

You can use this string with Fn.Select(x, Fn.Split(",", azs)) to
get a specific Availability Zone Id

###### `availabilityZoneNames`<sup>Required</sup> <a name="availabilityZoneNames" id="@cdklabs/multi-az-observability.IAvailabilityZoneMapper.availabilityZoneIdsAsCommaDelimitedList.parameter.availabilityZoneNames"></a>

- *Type:* string[]

---

##### `availabilityZoneName` <a name="availabilityZoneName" id="@cdklabs/multi-az-observability.IAvailabilityZoneMapper.availabilityZoneName"></a>

```typescript
public availabilityZoneName(availabilityZoneId: string): string
```

Gets the Availability Zone Name for the given Availability Zone Id in this account.

###### `availabilityZoneId`<sup>Required</sup> <a name="availabilityZoneId" id="@cdklabs/multi-az-observability.IAvailabilityZoneMapper.availabilityZoneName.parameter.availabilityZoneId"></a>

- *Type:* string

---

##### `regionPrefixForAvailabilityZoneIds` <a name="regionPrefixForAvailabilityZoneIds" id="@cdklabs/multi-az-observability.IAvailabilityZoneMapper.regionPrefixForAvailabilityZoneIds"></a>

```typescript
public regionPrefixForAvailabilityZoneIds(): string
```

Gets the prefix for the region used with Availability Zone Ids, for example in us-east-1, this returns "use1".

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@cdklabs/multi-az-observability.IAvailabilityZoneMapper.property.node">node</a></code> | <code>constructs.Node</code> | The tree node. |
| <code><a href="#@cdklabs/multi-az-observability.IAvailabilityZoneMapper.property.function">function</a></code> | <code>aws-cdk-lib.aws_lambda.IFunction</code> | The function that does the mapping. |
| <code><a href="#@cdklabs/multi-az-observability.IAvailabilityZoneMapper.property.logGroup">logGroup</a></code> | <code>aws-cdk-lib.aws_logs.ILogGroup</code> | The log group for the function's logs. |
| <code><a href="#@cdklabs/multi-az-observability.IAvailabilityZoneMapper.property.mapper">mapper</a></code> | <code>aws-cdk-lib.CustomResource</code> | The custom resource that can be referenced to use Fn::GetAtt functions on to retrieve availability zone names and ids. |

---

##### `node`<sup>Required</sup> <a name="node" id="@cdklabs/multi-az-observability.IAvailabilityZoneMapper.property.node"></a>

```typescript
public readonly node: Node;
```

- *Type:* constructs.Node

The tree node.

---

##### `function`<sup>Required</sup> <a name="function" id="@cdklabs/multi-az-observability.IAvailabilityZoneMapper.property.function"></a>

```typescript
public readonly function: IFunction;
```

- *Type:* aws-cdk-lib.aws_lambda.IFunction

The function that does the mapping.

---

##### `logGroup`<sup>Required</sup> <a name="logGroup" id="@cdklabs/multi-az-observability.IAvailabilityZoneMapper.property.logGroup"></a>

```typescript
public readonly logGroup: ILogGroup;
```

- *Type:* aws-cdk-lib.aws_logs.ILogGroup

The log group for the function's logs.

---

##### `mapper`<sup>Required</sup> <a name="mapper" id="@cdklabs/multi-az-observability.IAvailabilityZoneMapper.property.mapper"></a>

```typescript
public readonly mapper: CustomResource;
```

- *Type:* aws-cdk-lib.CustomResource

The custom resource that can be referenced to use Fn::GetAtt functions on to retrieve availability zone names and ids.

---

### IBasicServiceMultiAZObservability <a name="IBasicServiceMultiAZObservability" id="@cdklabs/multi-az-observability.IBasicServiceMultiAZObservability"></a>

- *Extends:* constructs.IConstruct

- *Implemented By:* <a href="#@cdklabs/multi-az-observability.BasicServiceMultiAZObservability">BasicServiceMultiAZObservability</a>, <a href="#@cdklabs/multi-az-observability.IBasicServiceMultiAZObservability">IBasicServiceMultiAZObservability</a>

Properties of a basic service.


#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@cdklabs/multi-az-observability.IBasicServiceMultiAZObservability.property.node">node</a></code> | <code>constructs.Node</code> | The tree node. |
| <code><a href="#@cdklabs/multi-az-observability.IBasicServiceMultiAZObservability.property.aggregateZonalIsolatedImpactAlarms">aggregateZonalIsolatedImpactAlarms</a></code> | <code>{[ key: string ]: aws-cdk-lib.aws_cloudwatch.IAlarm}</code> | The alarms indicating if an AZ has isolated impact from either ALB or NAT GW metrics. |
| <code><a href="#@cdklabs/multi-az-observability.IBasicServiceMultiAZObservability.property.serviceName">serviceName</a></code> | <code>string</code> | The name of the service. |
| <code><a href="#@cdklabs/multi-az-observability.IBasicServiceMultiAZObservability.property.albZonalIsolatedImpactAlarms">albZonalIsolatedImpactAlarms</a></code> | <code>{[ key: string ]: aws-cdk-lib.aws_cloudwatch.IAlarm}</code> | The alarms indicating if an AZ is an outlier for ALB faults and has isolated impact. |
| <code><a href="#@cdklabs/multi-az-observability.IBasicServiceMultiAZObservability.property.applicationLoadBalancers">applicationLoadBalancers</a></code> | <code>aws-cdk-lib.aws_elasticloadbalancingv2.IApplicationLoadBalancer[]</code> | The application load balancers being used by the service. |
| <code><a href="#@cdklabs/multi-az-observability.IBasicServiceMultiAZObservability.property.natGateways">natGateways</a></code> | <code>{[ key: string ]: aws-cdk-lib.aws_ec2.CfnNatGateway[]}</code> | The NAT Gateways being used in the service, each set of NAT Gateways are keyed by their Availability Zone Id. |
| <code><a href="#@cdklabs/multi-az-observability.IBasicServiceMultiAZObservability.property.natGWZonalIsolatedImpactAlarms">natGWZonalIsolatedImpactAlarms</a></code> | <code>{[ key: string ]: aws-cdk-lib.aws_cloudwatch.IAlarm}</code> | The alarms indicating if an AZ is an outlier for NAT GW packet loss and has isolated impact. |

---

##### `node`<sup>Required</sup> <a name="node" id="@cdklabs/multi-az-observability.IBasicServiceMultiAZObservability.property.node"></a>

```typescript
public readonly node: Node;
```

- *Type:* constructs.Node

The tree node.

---

##### `aggregateZonalIsolatedImpactAlarms`<sup>Required</sup> <a name="aggregateZonalIsolatedImpactAlarms" id="@cdklabs/multi-az-observability.IBasicServiceMultiAZObservability.property.aggregateZonalIsolatedImpactAlarms"></a>

```typescript
public readonly aggregateZonalIsolatedImpactAlarms: {[ key: string ]: IAlarm};
```

- *Type:* {[ key: string ]: aws-cdk-lib.aws_cloudwatch.IAlarm}

The alarms indicating if an AZ has isolated impact from either ALB or NAT GW metrics.

---

##### `serviceName`<sup>Required</sup> <a name="serviceName" id="@cdklabs/multi-az-observability.IBasicServiceMultiAZObservability.property.serviceName"></a>

```typescript
public readonly serviceName: string;
```

- *Type:* string

The name of the service.

---

##### `albZonalIsolatedImpactAlarms`<sup>Optional</sup> <a name="albZonalIsolatedImpactAlarms" id="@cdklabs/multi-az-observability.IBasicServiceMultiAZObservability.property.albZonalIsolatedImpactAlarms"></a>

```typescript
public readonly albZonalIsolatedImpactAlarms: {[ key: string ]: IAlarm};
```

- *Type:* {[ key: string ]: aws-cdk-lib.aws_cloudwatch.IAlarm}

The alarms indicating if an AZ is an outlier for ALB faults and has isolated impact.

---

##### `applicationLoadBalancers`<sup>Optional</sup> <a name="applicationLoadBalancers" id="@cdklabs/multi-az-observability.IBasicServiceMultiAZObservability.property.applicationLoadBalancers"></a>

```typescript
public readonly applicationLoadBalancers: IApplicationLoadBalancer[];
```

- *Type:* aws-cdk-lib.aws_elasticloadbalancingv2.IApplicationLoadBalancer[]

The application load balancers being used by the service.

---

##### `natGateways`<sup>Optional</sup> <a name="natGateways" id="@cdklabs/multi-az-observability.IBasicServiceMultiAZObservability.property.natGateways"></a>

```typescript
public readonly natGateways: {[ key: string ]: CfnNatGateway[]};
```

- *Type:* {[ key: string ]: aws-cdk-lib.aws_ec2.CfnNatGateway[]}

The NAT Gateways being used in the service, each set of NAT Gateways are keyed by their Availability Zone Id.

---

##### `natGWZonalIsolatedImpactAlarms`<sup>Optional</sup> <a name="natGWZonalIsolatedImpactAlarms" id="@cdklabs/multi-az-observability.IBasicServiceMultiAZObservability.property.natGWZonalIsolatedImpactAlarms"></a>

```typescript
public readonly natGWZonalIsolatedImpactAlarms: {[ key: string ]: IAlarm};
```

- *Type:* {[ key: string ]: aws-cdk-lib.aws_cloudwatch.IAlarm}

The alarms indicating if an AZ is an outlier for NAT GW packet loss and has isolated impact.

---

### ICanaryMetrics <a name="ICanaryMetrics" id="@cdklabs/multi-az-observability.ICanaryMetrics"></a>

- *Implemented By:* <a href="#@cdklabs/multi-az-observability.CanaryMetrics">CanaryMetrics</a>, <a href="#@cdklabs/multi-az-observability.ICanaryMetrics">ICanaryMetrics</a>

The metric definitions for metric produced by the canary.


#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@cdklabs/multi-az-observability.ICanaryMetrics.property.canaryAvailabilityMetricDetails">canaryAvailabilityMetricDetails</a></code> | <code><a href="#@cdklabs/multi-az-observability.IOperationMetricDetails">IOperationMetricDetails</a></code> | The canary availability metric details. |
| <code><a href="#@cdklabs/multi-az-observability.ICanaryMetrics.property.canaryLatencyMetricDetails">canaryLatencyMetricDetails</a></code> | <code><a href="#@cdklabs/multi-az-observability.IOperationMetricDetails">IOperationMetricDetails</a></code> | The canary latency metric details. |

---

##### `canaryAvailabilityMetricDetails`<sup>Required</sup> <a name="canaryAvailabilityMetricDetails" id="@cdklabs/multi-az-observability.ICanaryMetrics.property.canaryAvailabilityMetricDetails"></a>

```typescript
public readonly canaryAvailabilityMetricDetails: IOperationMetricDetails;
```

- *Type:* <a href="#@cdklabs/multi-az-observability.IOperationMetricDetails">IOperationMetricDetails</a>

The canary availability metric details.

---

##### `canaryLatencyMetricDetails`<sup>Required</sup> <a name="canaryLatencyMetricDetails" id="@cdklabs/multi-az-observability.ICanaryMetrics.property.canaryLatencyMetricDetails"></a>

```typescript
public readonly canaryLatencyMetricDetails: IOperationMetricDetails;
```

- *Type:* <a href="#@cdklabs/multi-az-observability.IOperationMetricDetails">IOperationMetricDetails</a>

The canary latency metric details.

---

### ICanaryTestMetricsOverride <a name="ICanaryTestMetricsOverride" id="@cdklabs/multi-az-observability.ICanaryTestMetricsOverride"></a>

- *Implemented By:* <a href="#@cdklabs/multi-az-observability.CanaryTestMetricsOverride">CanaryTestMetricsOverride</a>, <a href="#@cdklabs/multi-az-observability.ICanaryTestMetricsOverride">ICanaryTestMetricsOverride</a>

Provides overrides for the default metric settings used for the automatically created canary tests.


#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@cdklabs/multi-az-observability.ICanaryTestMetricsOverride.property.alarmStatistic">alarmStatistic</a></code> | <code>string</code> | The statistic used for alarms, for availability metrics this should be "Sum", for latency metrics it could something like "p99" or "p99.9". |
| <code><a href="#@cdklabs/multi-az-observability.ICanaryTestMetricsOverride.property.datapointsToAlarm">datapointsToAlarm</a></code> | <code>number</code> | The number of datapoints to alarm on for latency and availability alarms. |
| <code><a href="#@cdklabs/multi-az-observability.ICanaryTestMetricsOverride.property.evaluationPeriods">evaluationPeriods</a></code> | <code>number</code> | The number of evaluation periods for latency and availabiltiy alarms. |
| <code><a href="#@cdklabs/multi-az-observability.ICanaryTestMetricsOverride.property.faultAlarmThreshold">faultAlarmThreshold</a></code> | <code>number</code> | The threshold for alarms associated with fault metrics, for example if measuring fault rate, the threshold may be 1, meaning you would want an alarm that triggers if the fault rate goes above 1%. |
| <code><a href="#@cdklabs/multi-az-observability.ICanaryTestMetricsOverride.property.period">period</a></code> | <code>aws-cdk-lib.Duration</code> | The period for the metrics. |
| <code><a href="#@cdklabs/multi-az-observability.ICanaryTestMetricsOverride.property.successAlarmThreshold">successAlarmThreshold</a></code> | <code>number</code> | The threshold for alarms associated with success metrics, for example if measuring success rate, the threshold may be 99, meaning you would want an alarm that triggers if success drops below 99%. |

---

##### `alarmStatistic`<sup>Optional</sup> <a name="alarmStatistic" id="@cdklabs/multi-az-observability.ICanaryTestMetricsOverride.property.alarmStatistic"></a>

```typescript
public readonly alarmStatistic: string;
```

- *Type:* string

The statistic used for alarms, for availability metrics this should be "Sum", for latency metrics it could something like "p99" or "p99.9".

---

##### `datapointsToAlarm`<sup>Optional</sup> <a name="datapointsToAlarm" id="@cdklabs/multi-az-observability.ICanaryTestMetricsOverride.property.datapointsToAlarm"></a>

```typescript
public readonly datapointsToAlarm: number;
```

- *Type:* number

The number of datapoints to alarm on for latency and availability alarms.

---

##### `evaluationPeriods`<sup>Optional</sup> <a name="evaluationPeriods" id="@cdklabs/multi-az-observability.ICanaryTestMetricsOverride.property.evaluationPeriods"></a>

```typescript
public readonly evaluationPeriods: number;
```

- *Type:* number

The number of evaluation periods for latency and availabiltiy alarms.

---

##### `faultAlarmThreshold`<sup>Optional</sup> <a name="faultAlarmThreshold" id="@cdklabs/multi-az-observability.ICanaryTestMetricsOverride.property.faultAlarmThreshold"></a>

```typescript
public readonly faultAlarmThreshold: number;
```

- *Type:* number

The threshold for alarms associated with fault metrics, for example if measuring fault rate, the threshold may be 1, meaning you would want an alarm that triggers if the fault rate goes above 1%.

---

##### `period`<sup>Optional</sup> <a name="period" id="@cdklabs/multi-az-observability.ICanaryTestMetricsOverride.property.period"></a>

```typescript
public readonly period: Duration;
```

- *Type:* aws-cdk-lib.Duration

The period for the metrics.

---

##### `successAlarmThreshold`<sup>Optional</sup> <a name="successAlarmThreshold" id="@cdklabs/multi-az-observability.ICanaryTestMetricsOverride.property.successAlarmThreshold"></a>

```typescript
public readonly successAlarmThreshold: number;
```

- *Type:* number

The threshold for alarms associated with success metrics, for example if measuring success rate, the threshold may be 99, meaning you would want an alarm that triggers if success drops below 99%.

---

### IContributorInsightRuleDetails <a name="IContributorInsightRuleDetails" id="@cdklabs/multi-az-observability.IContributorInsightRuleDetails"></a>

- *Implemented By:* <a href="#@cdklabs/multi-az-observability.ContributorInsightRuleDetails">ContributorInsightRuleDetails</a>, <a href="#@cdklabs/multi-az-observability.IContributorInsightRuleDetails">IContributorInsightRuleDetails</a>

Details for setting up Contributor Insight rules.


#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@cdklabs/multi-az-observability.IContributorInsightRuleDetails.property.availabilityZoneIdJsonPath">availabilityZoneIdJsonPath</a></code> | <code>string</code> | The path in the log files to the field that identifies the Availability Zone Id that the request was handled in, for example { "AZ-ID": "use1-az1" } would have a path of $.AZ-ID. |
| <code><a href="#@cdklabs/multi-az-observability.IContributorInsightRuleDetails.property.faultMetricJsonPath">faultMetricJsonPath</a></code> | <code>string</code> | The path in the log files to the field that identifies if the response resulted in a fault, for example { "Fault" : 1 } would have a path of $.Fault. |
| <code><a href="#@cdklabs/multi-az-observability.IContributorInsightRuleDetails.property.instanceIdJsonPath">instanceIdJsonPath</a></code> | <code>string</code> | The JSON path to the instance id field in the log files, only required for server-side rules. |
| <code><a href="#@cdklabs/multi-az-observability.IContributorInsightRuleDetails.property.logGroups">logGroups</a></code> | <code>aws-cdk-lib.aws_logs.ILogGroup[]</code> | The log groups where CloudWatch logs for the operation are located. |
| <code><a href="#@cdklabs/multi-az-observability.IContributorInsightRuleDetails.property.operationNameJsonPath">operationNameJsonPath</a></code> | <code>string</code> | The path in the log files to the field that identifies the operation the log file is for. |
| <code><a href="#@cdklabs/multi-az-observability.IContributorInsightRuleDetails.property.successLatencyMetricJsonPath">successLatencyMetricJsonPath</a></code> | <code>string</code> | The path in the log files to the field that indicates the latency for the response. |

---

##### `availabilityZoneIdJsonPath`<sup>Required</sup> <a name="availabilityZoneIdJsonPath" id="@cdklabs/multi-az-observability.IContributorInsightRuleDetails.property.availabilityZoneIdJsonPath"></a>

```typescript
public readonly availabilityZoneIdJsonPath: string;
```

- *Type:* string

The path in the log files to the field that identifies the Availability Zone Id that the request was handled in, for example { "AZ-ID": "use1-az1" } would have a path of $.AZ-ID.

---

##### `faultMetricJsonPath`<sup>Required</sup> <a name="faultMetricJsonPath" id="@cdklabs/multi-az-observability.IContributorInsightRuleDetails.property.faultMetricJsonPath"></a>

```typescript
public readonly faultMetricJsonPath: string;
```

- *Type:* string

The path in the log files to the field that identifies if the response resulted in a fault, for example { "Fault" : 1 } would have a path of $.Fault.

---

##### `instanceIdJsonPath`<sup>Required</sup> <a name="instanceIdJsonPath" id="@cdklabs/multi-az-observability.IContributorInsightRuleDetails.property.instanceIdJsonPath"></a>

```typescript
public readonly instanceIdJsonPath: string;
```

- *Type:* string

The JSON path to the instance id field in the log files, only required for server-side rules.

---

##### `logGroups`<sup>Required</sup> <a name="logGroups" id="@cdklabs/multi-az-observability.IContributorInsightRuleDetails.property.logGroups"></a>

```typescript
public readonly logGroups: ILogGroup[];
```

- *Type:* aws-cdk-lib.aws_logs.ILogGroup[]

The log groups where CloudWatch logs for the operation are located.

If
this is not provided, Contributor Insight rules cannot be created.

---

##### `operationNameJsonPath`<sup>Required</sup> <a name="operationNameJsonPath" id="@cdklabs/multi-az-observability.IContributorInsightRuleDetails.property.operationNameJsonPath"></a>

```typescript
public readonly operationNameJsonPath: string;
```

- *Type:* string

The path in the log files to the field that identifies the operation the log file is for.

---

##### `successLatencyMetricJsonPath`<sup>Required</sup> <a name="successLatencyMetricJsonPath" id="@cdklabs/multi-az-observability.IContributorInsightRuleDetails.property.successLatencyMetricJsonPath"></a>

```typescript
public readonly successLatencyMetricJsonPath: string;
```

- *Type:* string

The path in the log files to the field that indicates the latency for the response.

This could either be success latency or fault
latency depending on the alarms and rules you are creating.

---

### IInstrumentedServiceMultiAZObservability <a name="IInstrumentedServiceMultiAZObservability" id="@cdklabs/multi-az-observability.IInstrumentedServiceMultiAZObservability"></a>

- *Extends:* constructs.IConstruct

- *Implemented By:* <a href="#@cdklabs/multi-az-observability.InstrumentedServiceMultiAZObservability">InstrumentedServiceMultiAZObservability</a>, <a href="#@cdklabs/multi-az-observability.IInstrumentedServiceMultiAZObservability">IInstrumentedServiceMultiAZObservability</a>

Observability for an instrumented service.


#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@cdklabs/multi-az-observability.IInstrumentedServiceMultiAZObservability.property.node">node</a></code> | <code>constructs.Node</code> | The tree node. |
| <code><a href="#@cdklabs/multi-az-observability.IInstrumentedServiceMultiAZObservability.property.perOperationZonalImpactAlarms">perOperationZonalImpactAlarms</a></code> | <code>{[ key: string ]: {[ key: string ]: aws-cdk-lib.aws_cloudwatch.IAlarm}}</code> | Index into the dictionary by operation name, then by Availability Zone Id to get the alarms that indicate an AZ shows isolated impact from availability or latency as seen by either the server-side or canary. |
| <code><a href="#@cdklabs/multi-az-observability.IInstrumentedServiceMultiAZObservability.property.serviceAlarms">serviceAlarms</a></code> | <code><a href="#@cdklabs/multi-az-observability.IServiceAlarmsAndRules">IServiceAlarmsAndRules</a></code> | The alarms and rules for the overall service. |
| <code><a href="#@cdklabs/multi-az-observability.IInstrumentedServiceMultiAZObservability.property.canaryLogGroup">canaryLogGroup</a></code> | <code>aws-cdk-lib.aws_logs.ILogGroup</code> | If the service is configured to have canary tests created, this will be the log group where the canary's logs are stored. |
| <code><a href="#@cdklabs/multi-az-observability.IInstrumentedServiceMultiAZObservability.property.operationDashboards">operationDashboards</a></code> | <code>aws-cdk-lib.aws_cloudwatch.Dashboard[]</code> | The dashboards for each operation. |
| <code><a href="#@cdklabs/multi-az-observability.IInstrumentedServiceMultiAZObservability.property.serviceDashboard">serviceDashboard</a></code> | <code>aws-cdk-lib.aws_cloudwatch.Dashboard</code> | The service level dashboard. |

---

##### `node`<sup>Required</sup> <a name="node" id="@cdklabs/multi-az-observability.IInstrumentedServiceMultiAZObservability.property.node"></a>

```typescript
public readonly node: Node;
```

- *Type:* constructs.Node

The tree node.

---

##### `perOperationZonalImpactAlarms`<sup>Required</sup> <a name="perOperationZonalImpactAlarms" id="@cdklabs/multi-az-observability.IInstrumentedServiceMultiAZObservability.property.perOperationZonalImpactAlarms"></a>

```typescript
public readonly perOperationZonalImpactAlarms: {[ key: string ]: {[ key: string ]: IAlarm}};
```

- *Type:* {[ key: string ]: {[ key: string ]: aws-cdk-lib.aws_cloudwatch.IAlarm}}

Index into the dictionary by operation name, then by Availability Zone Id to get the alarms that indicate an AZ shows isolated impact from availability or latency as seen by either the server-side or canary.

These are the alarms
you would want to use to trigger automation to evacuate an AZ.

---

##### `serviceAlarms`<sup>Required</sup> <a name="serviceAlarms" id="@cdklabs/multi-az-observability.IInstrumentedServiceMultiAZObservability.property.serviceAlarms"></a>

```typescript
public readonly serviceAlarms: IServiceAlarmsAndRules;
```

- *Type:* <a href="#@cdklabs/multi-az-observability.IServiceAlarmsAndRules">IServiceAlarmsAndRules</a>

The alarms and rules for the overall service.

---

##### `canaryLogGroup`<sup>Optional</sup> <a name="canaryLogGroup" id="@cdklabs/multi-az-observability.IInstrumentedServiceMultiAZObservability.property.canaryLogGroup"></a>

```typescript
public readonly canaryLogGroup: ILogGroup;
```

- *Type:* aws-cdk-lib.aws_logs.ILogGroup
- *Default:* No log group is created if the canary is not requested.

If the service is configured to have canary tests created, this will be the log group where the canary's logs are stored.

---

##### `operationDashboards`<sup>Optional</sup> <a name="operationDashboards" id="@cdklabs/multi-az-observability.IInstrumentedServiceMultiAZObservability.property.operationDashboards"></a>

```typescript
public readonly operationDashboards: Dashboard[];
```

- *Type:* aws-cdk-lib.aws_cloudwatch.Dashboard[]

The dashboards for each operation.

---

##### `serviceDashboard`<sup>Optional</sup> <a name="serviceDashboard" id="@cdklabs/multi-az-observability.IInstrumentedServiceMultiAZObservability.property.serviceDashboard"></a>

```typescript
public readonly serviceDashboard: Dashboard;
```

- *Type:* aws-cdk-lib.aws_cloudwatch.Dashboard

The service level dashboard.

---

### IOperation <a name="IOperation" id="@cdklabs/multi-az-observability.IOperation"></a>

- *Implemented By:* <a href="#@cdklabs/multi-az-observability.Operation">Operation</a>, <a href="#@cdklabs/multi-az-observability.IOperation">IOperation</a>

Represents an operation in a service.


#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@cdklabs/multi-az-observability.IOperation.property.critical">critical</a></code> | <code>boolean</code> | Indicates this is a critical operation for the service and will be included in service level metrics and dashboards. |
| <code><a href="#@cdklabs/multi-az-observability.IOperation.property.httpMethods">httpMethods</a></code> | <code>string[]</code> | The http methods supported by the operation. |
| <code><a href="#@cdklabs/multi-az-observability.IOperation.property.operationName">operationName</a></code> | <code>string</code> | The name of the operation. |
| <code><a href="#@cdklabs/multi-az-observability.IOperation.property.path">path</a></code> | <code>string</code> | The HTTP path for the operation for canaries to run against, something like "/products/list". |
| <code><a href="#@cdklabs/multi-az-observability.IOperation.property.serverSideAvailabilityMetricDetails">serverSideAvailabilityMetricDetails</a></code> | <code><a href="#@cdklabs/multi-az-observability.IOperationMetricDetails">IOperationMetricDetails</a></code> | The server side availability metric details. |
| <code><a href="#@cdklabs/multi-az-observability.IOperation.property.serverSideLatencyMetricDetails">serverSideLatencyMetricDetails</a></code> | <code><a href="#@cdklabs/multi-az-observability.IOperationMetricDetails">IOperationMetricDetails</a></code> | The server side latency metric details. |
| <code><a href="#@cdklabs/multi-az-observability.IOperation.property.service">service</a></code> | <code><a href="#@cdklabs/multi-az-observability.IService">IService</a></code> | The service the operation is associated with. |
| <code><a href="#@cdklabs/multi-az-observability.IOperation.property.canaryMetricDetails">canaryMetricDetails</a></code> | <code><a href="#@cdklabs/multi-az-observability.ICanaryMetrics">ICanaryMetrics</a></code> | Optional metric details if the service has an existing canary. |
| <code><a href="#@cdklabs/multi-az-observability.IOperation.property.canaryTestAvailabilityMetricsOverride">canaryTestAvailabilityMetricsOverride</a></code> | <code><a href="#@cdklabs/multi-az-observability.ICanaryTestMetricsOverride">ICanaryTestMetricsOverride</a></code> | The override values for automatically created canary tests so you can use values other than the service defaults to define the thresholds for availability. |
| <code><a href="#@cdklabs/multi-az-observability.IOperation.property.canaryTestLatencyMetricsOverride">canaryTestLatencyMetricsOverride</a></code> | <code><a href="#@cdklabs/multi-az-observability.ICanaryTestMetricsOverride">ICanaryTestMetricsOverride</a></code> | The override values for automatically created canary tests so you can use values other than the service defaults to define the thresholds for latency. |
| <code><a href="#@cdklabs/multi-az-observability.IOperation.property.canaryTestProps">canaryTestProps</a></code> | <code><a href="#@cdklabs/multi-az-observability.AddCanaryTestProps">AddCanaryTestProps</a></code> | If they have been added, the properties for creating new canary tests on this operation. |
| <code><a href="#@cdklabs/multi-az-observability.IOperation.property.optOutOfServiceCreatedCanary">optOutOfServiceCreatedCanary</a></code> | <code>boolean</code> | Set to true if you have defined CanaryTestProps for your service, which applies to all operations, but you want to opt out of creating the canary test for this operation. |
| <code><a href="#@cdklabs/multi-az-observability.IOperation.property.serverSideContributorInsightRuleDetails">serverSideContributorInsightRuleDetails</a></code> | <code><a href="#@cdklabs/multi-az-observability.IContributorInsightRuleDetails">IContributorInsightRuleDetails</a></code> | The server side details for contributor insights rules. |

---

##### `critical`<sup>Required</sup> <a name="critical" id="@cdklabs/multi-az-observability.IOperation.property.critical"></a>

```typescript
public readonly critical: boolean;
```

- *Type:* boolean

Indicates this is a critical operation for the service and will be included in service level metrics and dashboards.

---

##### `httpMethods`<sup>Required</sup> <a name="httpMethods" id="@cdklabs/multi-az-observability.IOperation.property.httpMethods"></a>

```typescript
public readonly httpMethods: string[];
```

- *Type:* string[]

The http methods supported by the operation.

---

##### `operationName`<sup>Required</sup> <a name="operationName" id="@cdklabs/multi-az-observability.IOperation.property.operationName"></a>

```typescript
public readonly operationName: string;
```

- *Type:* string

The name of the operation.

---

##### `path`<sup>Required</sup> <a name="path" id="@cdklabs/multi-az-observability.IOperation.property.path"></a>

```typescript
public readonly path: string;
```

- *Type:* string

The HTTP path for the operation for canaries to run against, something like "/products/list".

---

##### `serverSideAvailabilityMetricDetails`<sup>Required</sup> <a name="serverSideAvailabilityMetricDetails" id="@cdklabs/multi-az-observability.IOperation.property.serverSideAvailabilityMetricDetails"></a>

```typescript
public readonly serverSideAvailabilityMetricDetails: IOperationMetricDetails;
```

- *Type:* <a href="#@cdklabs/multi-az-observability.IOperationMetricDetails">IOperationMetricDetails</a>

The server side availability metric details.

---

##### `serverSideLatencyMetricDetails`<sup>Required</sup> <a name="serverSideLatencyMetricDetails" id="@cdklabs/multi-az-observability.IOperation.property.serverSideLatencyMetricDetails"></a>

```typescript
public readonly serverSideLatencyMetricDetails: IOperationMetricDetails;
```

- *Type:* <a href="#@cdklabs/multi-az-observability.IOperationMetricDetails">IOperationMetricDetails</a>

The server side latency metric details.

---

##### `service`<sup>Required</sup> <a name="service" id="@cdklabs/multi-az-observability.IOperation.property.service"></a>

```typescript
public readonly service: IService;
```

- *Type:* <a href="#@cdklabs/multi-az-observability.IService">IService</a>

The service the operation is associated with.

---

##### `canaryMetricDetails`<sup>Optional</sup> <a name="canaryMetricDetails" id="@cdklabs/multi-az-observability.IOperation.property.canaryMetricDetails"></a>

```typescript
public readonly canaryMetricDetails: ICanaryMetrics;
```

- *Type:* <a href="#@cdklabs/multi-az-observability.ICanaryMetrics">ICanaryMetrics</a>

Optional metric details if the service has an existing canary.

---

##### `canaryTestAvailabilityMetricsOverride`<sup>Optional</sup> <a name="canaryTestAvailabilityMetricsOverride" id="@cdklabs/multi-az-observability.IOperation.property.canaryTestAvailabilityMetricsOverride"></a>

```typescript
public readonly canaryTestAvailabilityMetricsOverride: ICanaryTestMetricsOverride;
```

- *Type:* <a href="#@cdklabs/multi-az-observability.ICanaryTestMetricsOverride">ICanaryTestMetricsOverride</a>

The override values for automatically created canary tests so you can use values other than the service defaults to define the thresholds for availability.

---

##### `canaryTestLatencyMetricsOverride`<sup>Optional</sup> <a name="canaryTestLatencyMetricsOverride" id="@cdklabs/multi-az-observability.IOperation.property.canaryTestLatencyMetricsOverride"></a>

```typescript
public readonly canaryTestLatencyMetricsOverride: ICanaryTestMetricsOverride;
```

- *Type:* <a href="#@cdklabs/multi-az-observability.ICanaryTestMetricsOverride">ICanaryTestMetricsOverride</a>

The override values for automatically created canary tests so you can use values other than the service defaults to define the thresholds for latency.

---

##### `canaryTestProps`<sup>Optional</sup> <a name="canaryTestProps" id="@cdklabs/multi-az-observability.IOperation.property.canaryTestProps"></a>

```typescript
public readonly canaryTestProps: AddCanaryTestProps;
```

- *Type:* <a href="#@cdklabs/multi-az-observability.AddCanaryTestProps">AddCanaryTestProps</a>

If they have been added, the properties for creating new canary tests on this operation.

---

##### `optOutOfServiceCreatedCanary`<sup>Optional</sup> <a name="optOutOfServiceCreatedCanary" id="@cdklabs/multi-az-observability.IOperation.property.optOutOfServiceCreatedCanary"></a>

```typescript
public readonly optOutOfServiceCreatedCanary: boolean;
```

- *Type:* boolean
- *Default:* The operation is not opted out

Set to true if you have defined CanaryTestProps for your service, which applies to all operations, but you want to opt out of creating the canary test for this operation.

---

##### `serverSideContributorInsightRuleDetails`<sup>Optional</sup> <a name="serverSideContributorInsightRuleDetails" id="@cdklabs/multi-az-observability.IOperation.property.serverSideContributorInsightRuleDetails"></a>

```typescript
public readonly serverSideContributorInsightRuleDetails: IContributorInsightRuleDetails;
```

- *Type:* <a href="#@cdklabs/multi-az-observability.IContributorInsightRuleDetails">IContributorInsightRuleDetails</a>

The server side details for contributor insights rules.

---

### IOperationMetricDetails <a name="IOperationMetricDetails" id="@cdklabs/multi-az-observability.IOperationMetricDetails"></a>

- *Implemented By:* <a href="#@cdklabs/multi-az-observability.OperationMetricDetails">OperationMetricDetails</a>, <a href="#@cdklabs/multi-az-observability.IOperationMetricDetails">IOperationMetricDetails</a>

Details for operation metrics in one perspective, such as server side latency.


#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@cdklabs/multi-az-observability.IOperationMetricDetails.property.alarmStatistic">alarmStatistic</a></code> | <code>string</code> | The statistic used for alarms, for availability metrics this should be "Sum", for latency metrics it could something like "p99" or "p99.9". |
| <code><a href="#@cdklabs/multi-az-observability.IOperationMetricDetails.property.datapointsToAlarm">datapointsToAlarm</a></code> | <code>number</code> | The number of datapoints to alarm on for latency and availability alarms. |
| <code><a href="#@cdklabs/multi-az-observability.IOperationMetricDetails.property.evaluationPeriods">evaluationPeriods</a></code> | <code>number</code> | The number of evaluation periods for latency and availabiltiy alarms. |
| <code><a href="#@cdklabs/multi-az-observability.IOperationMetricDetails.property.faultAlarmThreshold">faultAlarmThreshold</a></code> | <code>number</code> | The threshold for alarms associated with fault metrics, for example if measuring fault rate, the threshold may be 1, meaning you would want an alarm that triggers if the fault rate goes above 1%. |
| <code><a href="#@cdklabs/multi-az-observability.IOperationMetricDetails.property.faultMetricNames">faultMetricNames</a></code> | <code>string[]</code> | The names of fault indicating metrics. |
| <code><a href="#@cdklabs/multi-az-observability.IOperationMetricDetails.property.metricDimensions">metricDimensions</a></code> | <code><a href="#@cdklabs/multi-az-observability.MetricDimensions">MetricDimensions</a></code> | The metric dimensions for this operation, must be implemented as a concrete class by the user. |
| <code><a href="#@cdklabs/multi-az-observability.IOperationMetricDetails.property.metricNamespace">metricNamespace</a></code> | <code>string</code> | The CloudWatch metric namespace for these metrics. |
| <code><a href="#@cdklabs/multi-az-observability.IOperationMetricDetails.property.operationName">operationName</a></code> | <code>string</code> | The operation these metric details are for. |
| <code><a href="#@cdklabs/multi-az-observability.IOperationMetricDetails.property.period">period</a></code> | <code>aws-cdk-lib.Duration</code> | The period for the metrics. |
| <code><a href="#@cdklabs/multi-az-observability.IOperationMetricDetails.property.successAlarmThreshold">successAlarmThreshold</a></code> | <code>number</code> | The threshold for alarms associated with success metrics, for example if measuring success rate, the threshold may be 99, meaning you would want an alarm that triggers if success drops below 99%. |
| <code><a href="#@cdklabs/multi-az-observability.IOperationMetricDetails.property.successMetricNames">successMetricNames</a></code> | <code>string[]</code> | The names of success indicating metrics. |
| <code><a href="#@cdklabs/multi-az-observability.IOperationMetricDetails.property.unit">unit</a></code> | <code>aws-cdk-lib.aws_cloudwatch.Unit</code> | The unit used for these metrics. |
| <code><a href="#@cdklabs/multi-az-observability.IOperationMetricDetails.property.graphedFaultStatistics">graphedFaultStatistics</a></code> | <code>string[]</code> | The statistics for faults you want to appear on dashboards, for example, with latency metrics, you might want p50, p99, and tm99. |
| <code><a href="#@cdklabs/multi-az-observability.IOperationMetricDetails.property.graphedSuccessStatistics">graphedSuccessStatistics</a></code> | <code>string[]</code> | The statistics for successes you want to appear on dashboards, for example, with latency metrics, you might want p50, p99, and tm99. |

---

##### `alarmStatistic`<sup>Required</sup> <a name="alarmStatistic" id="@cdklabs/multi-az-observability.IOperationMetricDetails.property.alarmStatistic"></a>

```typescript
public readonly alarmStatistic: string;
```

- *Type:* string

The statistic used for alarms, for availability metrics this should be "Sum", for latency metrics it could something like "p99" or "p99.9".

---

##### `datapointsToAlarm`<sup>Required</sup> <a name="datapointsToAlarm" id="@cdklabs/multi-az-observability.IOperationMetricDetails.property.datapointsToAlarm"></a>

```typescript
public readonly datapointsToAlarm: number;
```

- *Type:* number

The number of datapoints to alarm on for latency and availability alarms.

---

##### `evaluationPeriods`<sup>Required</sup> <a name="evaluationPeriods" id="@cdklabs/multi-az-observability.IOperationMetricDetails.property.evaluationPeriods"></a>

```typescript
public readonly evaluationPeriods: number;
```

- *Type:* number

The number of evaluation periods for latency and availabiltiy alarms.

---

##### `faultAlarmThreshold`<sup>Required</sup> <a name="faultAlarmThreshold" id="@cdklabs/multi-az-observability.IOperationMetricDetails.property.faultAlarmThreshold"></a>

```typescript
public readonly faultAlarmThreshold: number;
```

- *Type:* number

The threshold for alarms associated with fault metrics, for example if measuring fault rate, the threshold may be 1, meaning you would want an alarm that triggers if the fault rate goes above 1%.

---

##### `faultMetricNames`<sup>Required</sup> <a name="faultMetricNames" id="@cdklabs/multi-az-observability.IOperationMetricDetails.property.faultMetricNames"></a>

```typescript
public readonly faultMetricNames: string[];
```

- *Type:* string[]

The names of fault indicating metrics.

---

##### `metricDimensions`<sup>Required</sup> <a name="metricDimensions" id="@cdklabs/multi-az-observability.IOperationMetricDetails.property.metricDimensions"></a>

```typescript
public readonly metricDimensions: MetricDimensions;
```

- *Type:* <a href="#@cdklabs/multi-az-observability.MetricDimensions">MetricDimensions</a>

The metric dimensions for this operation, must be implemented as a concrete class by the user.

---

##### `metricNamespace`<sup>Required</sup> <a name="metricNamespace" id="@cdklabs/multi-az-observability.IOperationMetricDetails.property.metricNamespace"></a>

```typescript
public readonly metricNamespace: string;
```

- *Type:* string

The CloudWatch metric namespace for these metrics.

---

##### `operationName`<sup>Required</sup> <a name="operationName" id="@cdklabs/multi-az-observability.IOperationMetricDetails.property.operationName"></a>

```typescript
public readonly operationName: string;
```

- *Type:* string

The operation these metric details are for.

---

##### `period`<sup>Required</sup> <a name="period" id="@cdklabs/multi-az-observability.IOperationMetricDetails.property.period"></a>

```typescript
public readonly period: Duration;
```

- *Type:* aws-cdk-lib.Duration

The period for the metrics.

---

##### `successAlarmThreshold`<sup>Required</sup> <a name="successAlarmThreshold" id="@cdklabs/multi-az-observability.IOperationMetricDetails.property.successAlarmThreshold"></a>

```typescript
public readonly successAlarmThreshold: number;
```

- *Type:* number

The threshold for alarms associated with success metrics, for example if measuring success rate, the threshold may be 99, meaning you would want an alarm that triggers if success drops below 99%.

---

##### `successMetricNames`<sup>Required</sup> <a name="successMetricNames" id="@cdklabs/multi-az-observability.IOperationMetricDetails.property.successMetricNames"></a>

```typescript
public readonly successMetricNames: string[];
```

- *Type:* string[]

The names of success indicating metrics.

---

##### `unit`<sup>Required</sup> <a name="unit" id="@cdklabs/multi-az-observability.IOperationMetricDetails.property.unit"></a>

```typescript
public readonly unit: Unit;
```

- *Type:* aws-cdk-lib.aws_cloudwatch.Unit

The unit used for these metrics.

---

##### `graphedFaultStatistics`<sup>Optional</sup> <a name="graphedFaultStatistics" id="@cdklabs/multi-az-observability.IOperationMetricDetails.property.graphedFaultStatistics"></a>

```typescript
public readonly graphedFaultStatistics: string[];
```

- *Type:* string[]
- *Default:* For availability metrics, this will be "Sum", for latency metrics it will be just "p99"

The statistics for faults you want to appear on dashboards, for example, with latency metrics, you might want p50, p99, and tm99.

For availability
metrics this will typically just be "Sum".

---

##### `graphedSuccessStatistics`<sup>Optional</sup> <a name="graphedSuccessStatistics" id="@cdklabs/multi-az-observability.IOperationMetricDetails.property.graphedSuccessStatistics"></a>

```typescript
public readonly graphedSuccessStatistics: string[];
```

- *Type:* string[]
- *Default:* For availability metrics, this will be "Sum", for latency metrics it will be just "p99"

The statistics for successes you want to appear on dashboards, for example, with latency metrics, you might want p50, p99, and tm99.

For availability
metrics this will typically just be "Sum".

---

### IService <a name="IService" id="@cdklabs/multi-az-observability.IService"></a>

- *Implemented By:* <a href="#@cdklabs/multi-az-observability.Service">Service</a>, <a href="#@cdklabs/multi-az-observability.IService">IService</a>

Represents a complete service composed of one or more operations.

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#@cdklabs/multi-az-observability.IService.addOperation">addOperation</a></code> | Adds an operation to this service. |

---

##### `addOperation` <a name="addOperation" id="@cdklabs/multi-az-observability.IService.addOperation"></a>

```typescript
public addOperation(operation: IOperation): void
```

Adds an operation to this service.

###### `operation`<sup>Required</sup> <a name="operation" id="@cdklabs/multi-az-observability.IService.addOperation.parameter.operation"></a>

- *Type:* <a href="#@cdklabs/multi-az-observability.IOperation">IOperation</a>

---

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@cdklabs/multi-az-observability.IService.property.availabilityZoneNames">availabilityZoneNames</a></code> | <code>string[]</code> | A list of the Availability Zone names used by this application. |
| <code><a href="#@cdklabs/multi-az-observability.IService.property.baseUrl">baseUrl</a></code> | <code>string</code> | The base endpoint for this service, like "https://www.example.com". Operation paths will be appended to this endpoint for canary testing the service. |
| <code><a href="#@cdklabs/multi-az-observability.IService.property.defaultAvailabilityMetricDetails">defaultAvailabilityMetricDetails</a></code> | <code><a href="#@cdklabs/multi-az-observability.IServiceMetricDetails">IServiceMetricDetails</a></code> | The default settings that are used for availability metrics for all operations unless specifically overridden in an operation definition. |
| <code><a href="#@cdklabs/multi-az-observability.IService.property.defaultLatencyMetricDetails">defaultLatencyMetricDetails</a></code> | <code><a href="#@cdklabs/multi-az-observability.IServiceMetricDetails">IServiceMetricDetails</a></code> | The default settings that are used for availability metrics for all operations unless specifically overridden in an operation definition. |
| <code><a href="#@cdklabs/multi-az-observability.IService.property.faultCountThreshold">faultCountThreshold</a></code> | <code>number</code> | The fault count threshold that indicates the service is unhealthy. |
| <code><a href="#@cdklabs/multi-az-observability.IService.property.operations">operations</a></code> | <code><a href="#@cdklabs/multi-az-observability.IOperation">IOperation</a>[]</code> | The operations that are part of this service. |
| <code><a href="#@cdklabs/multi-az-observability.IService.property.period">period</a></code> | <code>aws-cdk-lib.Duration</code> | The period for which metrics for the service should be aggregated. |
| <code><a href="#@cdklabs/multi-az-observability.IService.property.serviceName">serviceName</a></code> | <code>string</code> | The name of your service. |
| <code><a href="#@cdklabs/multi-az-observability.IService.property.canaryTestProps">canaryTestProps</a></code> | <code><a href="#@cdklabs/multi-az-observability.AddCanaryTestProps">AddCanaryTestProps</a></code> | Define these settings if you want to automatically add canary tests to your operations. |
| <code><a href="#@cdklabs/multi-az-observability.IService.property.defaultContributorInsightRuleDetails">defaultContributorInsightRuleDetails</a></code> | <code><a href="#@cdklabs/multi-az-observability.IContributorInsightRuleDetails">IContributorInsightRuleDetails</a></code> | The default settings that are used for contributor insight rules. |
| <code><a href="#@cdklabs/multi-az-observability.IService.property.loadBalancer">loadBalancer</a></code> | <code>aws-cdk-lib.aws_elasticloadbalancingv2.ILoadBalancerV2</code> | The load balancer this service sits behind. |

---

##### `availabilityZoneNames`<sup>Required</sup> <a name="availabilityZoneNames" id="@cdklabs/multi-az-observability.IService.property.availabilityZoneNames"></a>

```typescript
public readonly availabilityZoneNames: string[];
```

- *Type:* string[]

A list of the Availability Zone names used by this application.

---

##### `baseUrl`<sup>Required</sup> <a name="baseUrl" id="@cdklabs/multi-az-observability.IService.property.baseUrl"></a>

```typescript
public readonly baseUrl: string;
```

- *Type:* string

The base endpoint for this service, like "https://www.example.com". Operation paths will be appended to this endpoint for canary testing the service.

---

##### `defaultAvailabilityMetricDetails`<sup>Required</sup> <a name="defaultAvailabilityMetricDetails" id="@cdklabs/multi-az-observability.IService.property.defaultAvailabilityMetricDetails"></a>

```typescript
public readonly defaultAvailabilityMetricDetails: IServiceMetricDetails;
```

- *Type:* <a href="#@cdklabs/multi-az-observability.IServiceMetricDetails">IServiceMetricDetails</a>

The default settings that are used for availability metrics for all operations unless specifically overridden in an operation definition.

---

##### `defaultLatencyMetricDetails`<sup>Required</sup> <a name="defaultLatencyMetricDetails" id="@cdklabs/multi-az-observability.IService.property.defaultLatencyMetricDetails"></a>

```typescript
public readonly defaultLatencyMetricDetails: IServiceMetricDetails;
```

- *Type:* <a href="#@cdklabs/multi-az-observability.IServiceMetricDetails">IServiceMetricDetails</a>

The default settings that are used for availability metrics for all operations unless specifically overridden in an operation definition.

---

##### `faultCountThreshold`<sup>Required</sup> <a name="faultCountThreshold" id="@cdklabs/multi-az-observability.IService.property.faultCountThreshold"></a>

```typescript
public readonly faultCountThreshold: number;
```

- *Type:* number

The fault count threshold that indicates the service is unhealthy.

This is an absolute value of faults
being produced by all critical operations in aggregate.

---

##### `operations`<sup>Required</sup> <a name="operations" id="@cdklabs/multi-az-observability.IService.property.operations"></a>

```typescript
public readonly operations: IOperation[];
```

- *Type:* <a href="#@cdklabs/multi-az-observability.IOperation">IOperation</a>[]

The operations that are part of this service.

---

##### `period`<sup>Required</sup> <a name="period" id="@cdklabs/multi-az-observability.IService.property.period"></a>

```typescript
public readonly period: Duration;
```

- *Type:* aws-cdk-lib.Duration

The period for which metrics for the service should be aggregated.

---

##### `serviceName`<sup>Required</sup> <a name="serviceName" id="@cdklabs/multi-az-observability.IService.property.serviceName"></a>

```typescript
public readonly serviceName: string;
```

- *Type:* string

The name of your service.

---

##### `canaryTestProps`<sup>Optional</sup> <a name="canaryTestProps" id="@cdklabs/multi-az-observability.IService.property.canaryTestProps"></a>

```typescript
public readonly canaryTestProps: AddCanaryTestProps;
```

- *Type:* <a href="#@cdklabs/multi-az-observability.AddCanaryTestProps">AddCanaryTestProps</a>
- *Default:* Automatic canary tests will not be created for operations in this service.

Define these settings if you want to automatically add canary tests to your operations.

Operations can individually opt out
of canary test creation if you define this setting.

---

##### `defaultContributorInsightRuleDetails`<sup>Optional</sup> <a name="defaultContributorInsightRuleDetails" id="@cdklabs/multi-az-observability.IService.property.defaultContributorInsightRuleDetails"></a>

```typescript
public readonly defaultContributorInsightRuleDetails: IContributorInsightRuleDetails;
```

- *Type:* <a href="#@cdklabs/multi-az-observability.IContributorInsightRuleDetails">IContributorInsightRuleDetails</a>
- *Default:* No defaults are provided and must be specified per operation

The default settings that are used for contributor insight rules.

---

##### `loadBalancer`<sup>Optional</sup> <a name="loadBalancer" id="@cdklabs/multi-az-observability.IService.property.loadBalancer"></a>

```typescript
public readonly loadBalancer: ILoadBalancerV2;
```

- *Type:* aws-cdk-lib.aws_elasticloadbalancingv2.ILoadBalancerV2
- *Default:* No load balancer metrics are included in dashboards and its ARN is not added to top level AZ alarm descriptions.

The load balancer this service sits behind.

---

### IServiceAlarmsAndRules <a name="IServiceAlarmsAndRules" id="@cdklabs/multi-az-observability.IServiceAlarmsAndRules"></a>

- *Implemented By:* <a href="#@cdklabs/multi-az-observability.IServiceAlarmsAndRules">IServiceAlarmsAndRules</a>

Service level alarms and rules using critical operations.


#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@cdklabs/multi-az-observability.IServiceAlarmsAndRules.property.regionalAvailabilityOrLatencyServerSideAlarm">regionalAvailabilityOrLatencyServerSideAlarm</a></code> | <code>aws-cdk-lib.aws_cloudwatch.IAlarm</code> | An alarm for regional availability or latency impact of any critical operation as measured by the server-side. |
| <code><a href="#@cdklabs/multi-az-observability.IServiceAlarmsAndRules.property.regionalAvailabilityServerSideAlarm">regionalAvailabilityServerSideAlarm</a></code> | <code>aws-cdk-lib.aws_cloudwatch.IAlarm</code> | An alarm for regional availability impact of any critical operation as measured by the server-side. |
| <code><a href="#@cdklabs/multi-az-observability.IServiceAlarmsAndRules.property.regionalFaultCountServerSideAlarm">regionalFaultCountServerSideAlarm</a></code> | <code>aws-cdk-lib.aws_cloudwatch.IAlarm</code> | An alarm for fault count exceeding a regional threshold for all critical operations. |
| <code><a href="#@cdklabs/multi-az-observability.IServiceAlarmsAndRules.property.service">service</a></code> | <code><a href="#@cdklabs/multi-az-observability.IService">IService</a></code> | The service these alarms and rules are for. |
| <code><a href="#@cdklabs/multi-az-observability.IServiceAlarmsAndRules.property.zonalAggregateIsolatedImpactAlarms">zonalAggregateIsolatedImpactAlarms</a></code> | <code>aws-cdk-lib.aws_cloudwatch.IAlarm[]</code> | The zonal aggregate isolated impact alarms. |
| <code><a href="#@cdklabs/multi-az-observability.IServiceAlarmsAndRules.property.zonalServerSideIsolatedImpactAlarms">zonalServerSideIsolatedImpactAlarms</a></code> | <code>aws-cdk-lib.aws_cloudwatch.IAlarm[]</code> | The zonal server-side isolated impact alarms. |
| <code><a href="#@cdklabs/multi-az-observability.IServiceAlarmsAndRules.property.regionalAvailabilityCanaryAlarm">regionalAvailabilityCanaryAlarm</a></code> | <code>aws-cdk-lib.aws_cloudwatch.IAlarm</code> | An alarm for regional availability impact of any critical operation as measured by the canary. |
| <code><a href="#@cdklabs/multi-az-observability.IServiceAlarmsAndRules.property.regionalAvailabilityOrLatencyCanaryAlarm">regionalAvailabilityOrLatencyCanaryAlarm</a></code> | <code>aws-cdk-lib.aws_cloudwatch.IAlarm</code> | An alarm for regional availability or latency impact of any critical operation as measured by the canary. |

---

##### `regionalAvailabilityOrLatencyServerSideAlarm`<sup>Required</sup> <a name="regionalAvailabilityOrLatencyServerSideAlarm" id="@cdklabs/multi-az-observability.IServiceAlarmsAndRules.property.regionalAvailabilityOrLatencyServerSideAlarm"></a>

```typescript
public readonly regionalAvailabilityOrLatencyServerSideAlarm: IAlarm;
```

- *Type:* aws-cdk-lib.aws_cloudwatch.IAlarm

An alarm for regional availability or latency impact of any critical operation as measured by the server-side.

---

##### `regionalAvailabilityServerSideAlarm`<sup>Required</sup> <a name="regionalAvailabilityServerSideAlarm" id="@cdklabs/multi-az-observability.IServiceAlarmsAndRules.property.regionalAvailabilityServerSideAlarm"></a>

```typescript
public readonly regionalAvailabilityServerSideAlarm: IAlarm;
```

- *Type:* aws-cdk-lib.aws_cloudwatch.IAlarm

An alarm for regional availability impact of any critical operation as measured by the server-side.

---

##### `regionalFaultCountServerSideAlarm`<sup>Required</sup> <a name="regionalFaultCountServerSideAlarm" id="@cdklabs/multi-az-observability.IServiceAlarmsAndRules.property.regionalFaultCountServerSideAlarm"></a>

```typescript
public readonly regionalFaultCountServerSideAlarm: IAlarm;
```

- *Type:* aws-cdk-lib.aws_cloudwatch.IAlarm

An alarm for fault count exceeding a regional threshold for all critical operations.

---

##### `service`<sup>Required</sup> <a name="service" id="@cdklabs/multi-az-observability.IServiceAlarmsAndRules.property.service"></a>

```typescript
public readonly service: IService;
```

- *Type:* <a href="#@cdklabs/multi-az-observability.IService">IService</a>

The service these alarms and rules are for.

---

##### `zonalAggregateIsolatedImpactAlarms`<sup>Required</sup> <a name="zonalAggregateIsolatedImpactAlarms" id="@cdklabs/multi-az-observability.IServiceAlarmsAndRules.property.zonalAggregateIsolatedImpactAlarms"></a>

```typescript
public readonly zonalAggregateIsolatedImpactAlarms: IAlarm[];
```

- *Type:* aws-cdk-lib.aws_cloudwatch.IAlarm[]

The zonal aggregate isolated impact alarms.

There is 1 alarm per AZ that
triggers for availability or latency impact to any critical operation in that AZ
that indicates it has isolated impact as measured by canaries or server-side.

---

##### `zonalServerSideIsolatedImpactAlarms`<sup>Required</sup> <a name="zonalServerSideIsolatedImpactAlarms" id="@cdklabs/multi-az-observability.IServiceAlarmsAndRules.property.zonalServerSideIsolatedImpactAlarms"></a>

```typescript
public readonly zonalServerSideIsolatedImpactAlarms: IAlarm[];
```

- *Type:* aws-cdk-lib.aws_cloudwatch.IAlarm[]

The zonal server-side isolated impact alarms.

There is 1 alarm per AZ that triggers
on availability or atency impact to any critical operation in that AZ. These are useful
for deployment monitoring to not inadvertently fail when a canary can't contact an AZ
during a deployment.

---

##### `regionalAvailabilityCanaryAlarm`<sup>Optional</sup> <a name="regionalAvailabilityCanaryAlarm" id="@cdklabs/multi-az-observability.IServiceAlarmsAndRules.property.regionalAvailabilityCanaryAlarm"></a>

```typescript
public readonly regionalAvailabilityCanaryAlarm: IAlarm;
```

- *Type:* aws-cdk-lib.aws_cloudwatch.IAlarm

An alarm for regional availability impact of any critical operation as measured by the canary.

---

##### `regionalAvailabilityOrLatencyCanaryAlarm`<sup>Optional</sup> <a name="regionalAvailabilityOrLatencyCanaryAlarm" id="@cdklabs/multi-az-observability.IServiceAlarmsAndRules.property.regionalAvailabilityOrLatencyCanaryAlarm"></a>

```typescript
public readonly regionalAvailabilityOrLatencyCanaryAlarm: IAlarm;
```

- *Type:* aws-cdk-lib.aws_cloudwatch.IAlarm

An alarm for regional availability or latency impact of any critical operation as measured by the canary.

---

### IServiceMetricDetails <a name="IServiceMetricDetails" id="@cdklabs/multi-az-observability.IServiceMetricDetails"></a>

- *Implemented By:* <a href="#@cdklabs/multi-az-observability.ServiceMetricDetails">ServiceMetricDetails</a>, <a href="#@cdklabs/multi-az-observability.IServiceMetricDetails">IServiceMetricDetails</a>

Details for the defaults used in a service for metrics in one perspective, such as server side latency.


#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@cdklabs/multi-az-observability.IServiceMetricDetails.property.alarmStatistic">alarmStatistic</a></code> | <code>string</code> | The statistic used for alarms, for availability metrics this should be "Sum", for latency metrics it could something like "p99" or "p99.9". |
| <code><a href="#@cdklabs/multi-az-observability.IServiceMetricDetails.property.datapointsToAlarm">datapointsToAlarm</a></code> | <code>number</code> | The number of datapoints to alarm on for latency and availability alarms. |
| <code><a href="#@cdklabs/multi-az-observability.IServiceMetricDetails.property.evaluationPeriods">evaluationPeriods</a></code> | <code>number</code> | The number of evaluation periods for latency and availabiltiy alarms. |
| <code><a href="#@cdklabs/multi-az-observability.IServiceMetricDetails.property.faultAlarmThreshold">faultAlarmThreshold</a></code> | <code>number</code> | The threshold for alarms associated with fault metrics, for example if measuring fault rate, the threshold may be 1, meaning you would want an alarm that triggers if the fault rate goes above 1%. |
| <code><a href="#@cdklabs/multi-az-observability.IServiceMetricDetails.property.faultMetricNames">faultMetricNames</a></code> | <code>string[]</code> | The names of fault indicating metrics. |
| <code><a href="#@cdklabs/multi-az-observability.IServiceMetricDetails.property.metricNamespace">metricNamespace</a></code> | <code>string</code> | The CloudWatch metric namespace for these metrics. |
| <code><a href="#@cdklabs/multi-az-observability.IServiceMetricDetails.property.period">period</a></code> | <code>aws-cdk-lib.Duration</code> | The period for the metrics. |
| <code><a href="#@cdklabs/multi-az-observability.IServiceMetricDetails.property.successAlarmThreshold">successAlarmThreshold</a></code> | <code>number</code> | The threshold for alarms associated with success metrics, for example if measuring success rate, the threshold may be 99, meaning you would want an alarm that triggers if success drops below 99%. |
| <code><a href="#@cdklabs/multi-az-observability.IServiceMetricDetails.property.successMetricNames">successMetricNames</a></code> | <code>string[]</code> | The names of success indicating metrics. |
| <code><a href="#@cdklabs/multi-az-observability.IServiceMetricDetails.property.unit">unit</a></code> | <code>aws-cdk-lib.aws_cloudwatch.Unit</code> | The unit used for these metrics. |
| <code><a href="#@cdklabs/multi-az-observability.IServiceMetricDetails.property.graphedFaultStatistics">graphedFaultStatistics</a></code> | <code>string[]</code> | The statistics for faults you want to appear on dashboards, for example, with latency metrics, you might want p50, p99, and tm99. |
| <code><a href="#@cdklabs/multi-az-observability.IServiceMetricDetails.property.graphedSuccessStatistics">graphedSuccessStatistics</a></code> | <code>string[]</code> | The statistics for successes you want to appear on dashboards, for example, with latency metrics, you might want p50, p99, and tm99. |

---

##### `alarmStatistic`<sup>Required</sup> <a name="alarmStatistic" id="@cdklabs/multi-az-observability.IServiceMetricDetails.property.alarmStatistic"></a>

```typescript
public readonly alarmStatistic: string;
```

- *Type:* string

The statistic used for alarms, for availability metrics this should be "Sum", for latency metrics it could something like "p99" or "p99.9".

---

##### `datapointsToAlarm`<sup>Required</sup> <a name="datapointsToAlarm" id="@cdklabs/multi-az-observability.IServiceMetricDetails.property.datapointsToAlarm"></a>

```typescript
public readonly datapointsToAlarm: number;
```

- *Type:* number

The number of datapoints to alarm on for latency and availability alarms.

---

##### `evaluationPeriods`<sup>Required</sup> <a name="evaluationPeriods" id="@cdklabs/multi-az-observability.IServiceMetricDetails.property.evaluationPeriods"></a>

```typescript
public readonly evaluationPeriods: number;
```

- *Type:* number

The number of evaluation periods for latency and availabiltiy alarms.

---

##### `faultAlarmThreshold`<sup>Required</sup> <a name="faultAlarmThreshold" id="@cdklabs/multi-az-observability.IServiceMetricDetails.property.faultAlarmThreshold"></a>

```typescript
public readonly faultAlarmThreshold: number;
```

- *Type:* number

The threshold for alarms associated with fault metrics, for example if measuring fault rate, the threshold may be 1, meaning you would want an alarm that triggers if the fault rate goes above 1%.

---

##### `faultMetricNames`<sup>Required</sup> <a name="faultMetricNames" id="@cdklabs/multi-az-observability.IServiceMetricDetails.property.faultMetricNames"></a>

```typescript
public readonly faultMetricNames: string[];
```

- *Type:* string[]

The names of fault indicating metrics.

---

##### `metricNamespace`<sup>Required</sup> <a name="metricNamespace" id="@cdklabs/multi-az-observability.IServiceMetricDetails.property.metricNamespace"></a>

```typescript
public readonly metricNamespace: string;
```

- *Type:* string

The CloudWatch metric namespace for these metrics.

---

##### `period`<sup>Required</sup> <a name="period" id="@cdklabs/multi-az-observability.IServiceMetricDetails.property.period"></a>

```typescript
public readonly period: Duration;
```

- *Type:* aws-cdk-lib.Duration

The period for the metrics.

---

##### `successAlarmThreshold`<sup>Required</sup> <a name="successAlarmThreshold" id="@cdklabs/multi-az-observability.IServiceMetricDetails.property.successAlarmThreshold"></a>

```typescript
public readonly successAlarmThreshold: number;
```

- *Type:* number

The threshold for alarms associated with success metrics, for example if measuring success rate, the threshold may be 99, meaning you would want an alarm that triggers if success drops below 99%.

---

##### `successMetricNames`<sup>Required</sup> <a name="successMetricNames" id="@cdklabs/multi-az-observability.IServiceMetricDetails.property.successMetricNames"></a>

```typescript
public readonly successMetricNames: string[];
```

- *Type:* string[]

The names of success indicating metrics.

---

##### `unit`<sup>Required</sup> <a name="unit" id="@cdklabs/multi-az-observability.IServiceMetricDetails.property.unit"></a>

```typescript
public readonly unit: Unit;
```

- *Type:* aws-cdk-lib.aws_cloudwatch.Unit

The unit used for these metrics.

---

##### `graphedFaultStatistics`<sup>Optional</sup> <a name="graphedFaultStatistics" id="@cdklabs/multi-az-observability.IServiceMetricDetails.property.graphedFaultStatistics"></a>

```typescript
public readonly graphedFaultStatistics: string[];
```

- *Type:* string[]
- *Default:* For availability metrics, this will be "Sum", for latency metrics it will be just "p99"

The statistics for faults you want to appear on dashboards, for example, with latency metrics, you might want p50, p99, and tm99.

For availability
metrics this will typically just be "Sum".

---

##### `graphedSuccessStatistics`<sup>Optional</sup> <a name="graphedSuccessStatistics" id="@cdklabs/multi-az-observability.IServiceMetricDetails.property.graphedSuccessStatistics"></a>

```typescript
public readonly graphedSuccessStatistics: string[];
```

- *Type:* string[]
- *Default:* For availability metrics, this will be "Sum", for latency metrics it will be just "p99"

The statistics for successes you want to appear on dashboards, for example, with latency metrics, you might want p50, p99, and tm99.

For availability
metrics this will typically just be "Sum".

---

## Enums <a name="Enums" id="Enums"></a>

### ApplicationLoadBalancerLatencyOutlierCalculation <a name="ApplicationLoadBalancerLatencyOutlierCalculation" id="@cdklabs/multi-az-observability.ApplicationLoadBalancerLatencyOutlierCalculation"></a>

The options for calculating if an AZ is an outlier for latency for ALBs.

#### Members <a name="Members" id="Members"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#@cdklabs/multi-az-observability.ApplicationLoadBalancerLatencyOutlierCalculation.STATIC">STATIC</a></code> | This will take the latency threshold and count the number of requests per AZ  that exceed this threshold and then calculate the percentage of requests exceeding this threshold belong to each AZ. |
| <code><a href="#@cdklabs/multi-az-observability.ApplicationLoadBalancerLatencyOutlierCalculation.Z_SCORE">Z_SCORE</a></code> | This calculates the z score of latency in one AZ against the other AZs. |

---

##### `STATIC` <a name="STATIC" id="@cdklabs/multi-az-observability.ApplicationLoadBalancerLatencyOutlierCalculation.STATIC"></a>

This will take the latency threshold and count the number of requests per AZ  that exceed this threshold and then calculate the percentage of requests exceeding this threshold belong to each AZ.

This provides a static comparison
of the number of high latency requests in one AZ versus the others

---


##### `Z_SCORE` <a name="Z_SCORE" id="@cdklabs/multi-az-observability.ApplicationLoadBalancerLatencyOutlierCalculation.Z_SCORE"></a>

This calculates the z score of latency in one AZ against the other AZs.

It uses
the target response time of all requests to calculate the standard deviation and
average for all AZs. This is the default.

---


### OutlierDetectionAlgorithm <a name="OutlierDetectionAlgorithm" id="@cdklabs/multi-az-observability.OutlierDetectionAlgorithm"></a>

Available algorithms for performing outlier detection.

#### Members <a name="Members" id="Members"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#@cdklabs/multi-az-observability.OutlierDetectionAlgorithm.STATIC">STATIC</a></code> | Defines using a static value to compare skew in faults or high latency responses. |
| <code><a href="#@cdklabs/multi-az-observability.OutlierDetectionAlgorithm.CHI_SQUARED">CHI_SQUARED</a></code> | Uses the chi squared statistic to determine if there is a statistically significant skew in fault rate or high latency distribution. |
| <code><a href="#@cdklabs/multi-az-observability.OutlierDetectionAlgorithm.Z_SCORE">Z_SCORE</a></code> | Uses z-score to determine if the skew in faults or high latency respones exceeds a defined number of standard devations. |
| <code><a href="#@cdklabs/multi-az-observability.OutlierDetectionAlgorithm.IQR">IQR</a></code> | Uses Interquartile Range Method to determine an outlier for faults or latency. |
| <code><a href="#@cdklabs/multi-az-observability.OutlierDetectionAlgorithm.MAD">MAD</a></code> | Median Absolute Deviation (MAD) to determine an outlier for faults or latency. |

---

##### `STATIC` <a name="STATIC" id="@cdklabs/multi-az-observability.OutlierDetectionAlgorithm.STATIC"></a>

Defines using a static value to compare skew in faults or high latency responses.

A good default threshold for this is .7 meaning one AZ
is responsible for 70% of the total errors or high latency responses

---


##### `CHI_SQUARED` <a name="CHI_SQUARED" id="@cdklabs/multi-az-observability.OutlierDetectionAlgorithm.CHI_SQUARED"></a>

Uses the chi squared statistic to determine if there is a statistically significant skew in fault rate or high latency distribution.

A normal default threshold for this is 0.05, which means there is a 5% or
less chance of the skew in errors or high latency responses occuring

---


##### `Z_SCORE` <a name="Z_SCORE" id="@cdklabs/multi-az-observability.OutlierDetectionAlgorithm.Z_SCORE"></a>

Uses z-score to determine if the skew in faults or high latency respones exceeds a defined number of standard devations.

A good default threshold value for this is 2, meaning the outlier value is outside
95% of the normal distribution. Using 3 means the outlier is outside 99.7% of
the normal distribution.

---


##### `IQR` <a name="IQR" id="@cdklabs/multi-az-observability.OutlierDetectionAlgorithm.IQR"></a>

Uses Interquartile Range Method to determine an outlier for faults or latency.

No threshold is required for this method and will be ignored

---


##### `MAD` <a name="MAD" id="@cdklabs/multi-az-observability.OutlierDetectionAlgorithm.MAD"></a>

Median Absolute Deviation (MAD) to determine an outlier for faults or latency.

A common default value threshold 3

---

