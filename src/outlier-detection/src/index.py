# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: Apache-2.0
import os
import boto3
import json
import time
import traceback
import sys
import math
from aws_embedded_metrics import metric_scope

cw_client = boto3.client("cloudwatch", os.environ.get("AWS_REGION", "us-east-1"))


# --- Pure Python replacements for numpy/scipy ---

def _mean(vals):
    """Calculate the arithmetic mean of a list of numbers."""
    return sum(vals) / len(vals)


def _std(vals):
    """Calculate the population standard deviation."""
    m = _mean(vals)
    return math.sqrt(sum((x - m) ** 2 for x in vals) / len(vals))


def _median(vals):
    """Calculate the median of a sorted list."""
    s = sorted(vals)
    n = len(s)
    mid = n // 2
    if n % 2 == 0:
        return (s[mid - 1] + s[mid]) / 2.0
    return s[mid]


def _percentile(vals, p):
    """Calculate the p-th percentile using linear interpolation (matching numpy default)."""
    s = sorted(vals)
    n = len(s)
    k = (p / 100.0) * (n - 1)
    f = math.floor(k)
    c = math.ceil(k)
    if f == c:
        return s[int(k)]
    return s[f] * (c - k) + s[c] * (k - f)


def _chi_squared_p_value(observed):
    """
    Compute the p-value for a chi-squared goodness-of-fit test against
    a uniform expected distribution (same as scipy.stats.chisquare with
    default parameters).

    Uses the regularized incomplete gamma function to compute the survival
    function: p = 1 - gammainc(df/2, chi2/2).
    """
    n = len(observed)
    if n < 2:
        return 1.0

    total = sum(observed)
    if total == 0:
        return 1.0

    expected = total / n
    chi2 = sum((o - expected) ** 2 / expected for o in observed)
    df = n - 1

    return 1.0 - _regularized_gamma_inc(df / 2.0, chi2 / 2.0)


def _regularized_gamma_inc(a, x):
    """
    Compute the regularized lower incomplete gamma function P(a, x)
    using series expansion for small x and continued fraction for large x.
    """
    if x < 0 or a <= 0:
        return 0.0
    if x == 0:
        return 0.0

    if x < a + 1:
        # Series expansion
        return _gamma_inc_series(a, x)
    else:
        # Continued fraction representation
        return 1.0 - _gamma_inc_cf(a, x)


def _gamma_inc_series(a, x, max_iter=200, eps=1e-15):
    """Series expansion for the regularized lower incomplete gamma function."""
    ln_gamma_a = math.lgamma(a)
    ap = a
    s = 1.0 / a
    delta = s
    for _ in range(max_iter):
        ap += 1.0
        delta *= x / ap
        s += delta
        if abs(delta) < abs(s) * eps:
            break
    return s * math.exp(-x + a * math.log(x) - ln_gamma_a)


def _gamma_inc_cf(a, x, max_iter=200, eps=1e-15):
    """Continued fraction for the regularized upper incomplete gamma function."""
    ln_gamma_a = math.lgamma(a)
    b = x + 1.0 - a
    c = 1.0 / 1e-30
    d = 1.0 / b
    h = d
    for i in range(1, max_iter + 1):
        an = -i * (i - a)
        b += 2.0
        d = an * d + b
        if abs(d) < 1e-30:
            d = 1e-30
        c = b + an / c
        if abs(c) < 1e-30:
            c = 1e-30
        d = 1.0 / d
        delta = d * c
        h *= delta
        if abs(delta - 1.0) < eps:
            break
    return math.exp(-x + a * math.log(x) - ln_gamma_a) * h


# --- Lambda handler and business logic ---

@metric_scope
def handler(event, context, metrics):
    start = time.perf_counter()
    metrics.set_dimensions(
        {
            "Operation": "OutlierDetection",
            "EventType": event["EventType"],
            "Region": os.environ.get("AWS_REGION", "us-east-1")
        }
    )
    metrics.set_namespace("OutlierDetection")
    metrics.set_property("Event", json.loads(json.dumps(event, default = str)))
    
    event_type = event["EventType"]

    if event_type == "GetMetricData":
        try:
            result = get_metric_data(event["GetMetricDataRequest"], metrics)
            metrics.put_metric("Success", 1, "Count")

            end = time.perf_counter()
            metrics.put_metric("SuccessLatency", (end - start) * 1000, "Milliseconds")
            return result
        except Exception as e:

            end = time.perf_counter()
            metrics.put_metric("FaultLatency", (end - start) * 1000, "Milliseconds")
            metrics.put_metric("Fault", 1, "Count")

            info = sys.exc_info()

            exc_info = sys.exc_info()
            details = ''.join(traceback.format_exception(*exc_info))
            exc_type, exc_value, exc_context = sys.exc_info()

            metrics.set_property("Exception", {
                "type": exc_type.__name__,
                "description": str(exc_value),
                "details": details
            })

            return {
                "Error": {
                    "Code": "Exception",
                    "Value": str(e)
                }
            }
    elif event_type == "DescribeGetMetricData":
        end = time.perf_counter()
        metrics.put_metric("SuccessLatency", (end - start) * 1000, "Milliseconds")
        metrics.put_metric("Success", 1, "Count")
        return {
            "Description": "Outlier detection metric calculator"
        }
    else:
        metrics.set_property("Error", "Unknown event type")
        return {}


def get_metric_data(event, metrics):
    start = event["StartTime"]
    end = event["EndTime"]
    period = event["Period"]
    args: list = event["Arguments"]
    algorithm: str = str(args[0])
    threshold: float = float(args[1])
    metrics.set_property("Threshold", threshold)
    az_id: str= args[2]
    metrics.set_property("AZ-ID", az_id)
    dimensions_per_az: dict = json.loads(args[3])
    metric_namespace: str = args[4]
    metrics.set_property("Namespace", metric_namespace)
    metric_names: list = args[5].split(":")
    metric_stat: str = args[6]
    unit: str = args[7]    
    metrics.set_property("Algorithm", algorithm)

    metric_query = {
        "StartTime": start,
        "EndTime": end,
        "MetricDataQueries": [],
    }

    operation = ""

    for az in dimensions_per_az:

        for dimension_set in dimensions_per_az[az]:

            index = 0
            az_query_keys = []

            dimensions = []

            for dim in dimension_set:
                dimensions.append({
                    "Name": dim,
                    "Value": dimension_set[dim]
                })

                if dim == "Operation":
                    operation = dimension_set[dim]

            for metric in metric_names:
                query = {
                  "Id": az.replace("-", "_") + str(index),
                  "Label": az + ' ' + metric,
                  "ReturnData": False,
                  "MetricStat": {
                    "Metric": {
                      "Namespace": metric_namespace,
                      "MetricName": metric,
                      "Dimensions": dimensions
                    },
                    "Period": 60,
                    "Stat": metric_stat,
                    "Unit": unit,
                  }
                }

                az_query_keys.append(az.replace("-", "_")  + str(index))
                index += 1

                metric_query["MetricDataQueries"].append(query)

        metric_query["MetricDataQueries"].append({
            "Id": az.replace("-", "_"),
            "Label": az,
            "ReturnData": True,
            "Expression": "+".join(az_query_keys)
        })

    metrics.set_property("Query", json.loads(json.dumps(metric_query, default = str)))

    if operation != "":
        metrics.set_property("ServiceOperation", operation)

    next_token: str = None

    az_counts: dict = {}

    while True:
        if next_token is not None:
            metric_query["NextToken"] = next_token

        data = cw_client.get_metric_data(**metric_query)

        if next_token is not None:
            metrics.set_property("GetMetricResult::" + next_token, json.loads(json.dumps(data, default = str)))
        else:
            metrics.set_property("GetMetricResult", json.loads(json.dumps(data, default = str)))

        for item in data["MetricDataResults"]:          
            az_id = item["Id"].replace("_", "-")
            
            for index, timestamp in enumerate(item["Timestamps"]):
                epoch_timestamp = int(timestamp.timestamp())
                if epoch_timestamp not in az_counts:
                    az_counts[epoch_timestamp] = {az:0 for az in dimensions_per_az}

                az_counts[epoch_timestamp][az_id] = item["Values"][index]

        if "NextToken" in data:
            next_token = data["NextToken"]

        if next_token is None:
            break

    metrics.set_property("InterimCalculation", json.loads(json.dumps(az_counts, default = str)))

    results = []

    match algorithm:
        case "Z_SCORE":
            results = z_score(az_counts = az_counts, az_id = az_id, threshold = threshold, metrics = metrics)
        case "IQR":
            results = iqr(az_counts = az_counts, az_id = az_id, threshold = threshold, metrics = metrics)
        case "MAD":
            results = mad(az_counts = az_counts, az_id = az_id, threshold = threshold, metrics = metrics)
        case "CHI_SQUARED" | _:
            results = chi_squared(az_counts = az_counts, az_id = az_id, threshold = threshold, metrics = metrics)

    data_results = {
        "MetricDataResults": [
          {
             "StatusCode": "Complete",
             "Label": az_id,
             "Timestamps": sorted(az_counts.keys(), reverse = True),
             "Values": results
          }
        ]
    }

    return data_results


# Chi-squared     
def chi_squared(az_counts: dict, az_id: str, threshold, metrics):
    results = []
    for timestamp_key in sorted(az_counts.keys(), reverse = True):
        vals = list(az_counts[timestamp_key].values())
        
        if not all(v == 0 for v in vals):
            if len(vals) > 0:
                expected = sum(vals) / len(vals)
                p_value = _chi_squared_p_value(vals)
                metrics.set_property("PValue_" + str(timestamp_key), str(p_value))

                for az in az_counts[timestamp_key]:
                    farthest_from_expected = az
                    break

                for az in az_counts[timestamp_key]:
                    if abs(az_counts[timestamp_key][az] - expected) > abs(az_counts[timestamp_key][farthest_from_expected] - expected):
                        farthest_from_expected = az        

                if not math.isnan(p_value) and p_value <= threshold and az_id == farthest_from_expected:
                    results.append(1)
                else:
                    results.append(0)
            else:
                metrics.set_property("PValue_" + str(timestamp_key), "No values for timestamp.")
                results.append(0)
            
        else:
            metrics.set_property("PValue_" + str(timestamp_key), "All values are zero.")
            results.append(0)

    return results

# Z-Score
def z_score(az_counts: dict, az_id: str, threshold, metrics):
    results = []
    for timestamp_key in sorted(az_counts.keys(), reverse = True):
        vals = list(az_counts[timestamp_key].values())
        mean = _mean(vals)
        metrics.set_property("Mean_" + str(timestamp_key), mean)
        std = _std(vals)
        metrics.set_property("StdDev_" + str(timestamp_key), std)
        
        val = az_counts[timestamp_key][az_id]

        if std == 0:
            results.append(0)
            continue

        z = (val - mean) / std
        metrics.set_property("ZScore_" + str(timestamp_key), z)
            
        if z >= threshold:
            results.append(1)
        else:
            results.append(0)
    
    return results

# Interquartile Range Method
def iqr(az_counts: dict, az_id: str, threshold, metrics):
    results = []
    for timestamp_key in sorted(az_counts.keys(), reverse = True):
        vals = sorted(list(az_counts[timestamp_key].values()))
        q1 = _percentile(vals, 25)
        metrics.set_property("Q1_" + str(timestamp_key), q1)
        q3 = _percentile(vals, 75)
        metrics.set_property("Q3_" + str(timestamp_key), q3)
        iqr_val = q3 - q1
        metrics.set_property("IQR_" + str(timestamp_key), iqr_val)

        upper_bound = q3 + (1.5 * iqr_val)

        metrics.set_property("UPPER_BOUND_" + str(timestamp_key), upper_bound)

        if az_counts[timestamp_key][az_id] > upper_bound:
            results.append(1)
        else:
            results.append(0)
    
    return results

# Median Absolute Deviation (MAD)
def mad(az_counts: dict, az_id: str, threshold, metrics):
    results = []
    for timestamp_key in sorted(az_counts.keys(), reverse = True):
        vals = sorted(list(az_counts[timestamp_key].values()))
        median = _median(vals)

        absolute_deviations = [abs(val - median) for val in vals]

        mad_val = _median(absolute_deviations)

        metrics.set_property("MAD_" + str(timestamp_key), mad_val)

        if az_counts[timestamp_key][az_id] >= median + (threshold * mad_val):
            results.append(1)
        else:
            results.append(0)
    
    return results
