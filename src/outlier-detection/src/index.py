# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: Apache-2.0
import os
import boto3
import json
import time
import traceback
import sys
import numpy
from numpy import float64
from scipy.stats import chisquare
from aws_embedded_metrics import metric_scope

cw_client = boto3.client("cloudwatch", os.environ.get("AWS_REGION", "us-east-1"))

#
#{
#  "EventType": "GetMetricData",
#  "GetMetricDataRequest": {
#    "StartTime": 1697060700,
#    "EndTime": 1697061600,
#    "Period": 300,
#    "Arguments": ["serviceregistry_external_http_requests{host_cluster!=\"prod\"}"] 
#  }
#}
#

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
    
#
#{
#  "EventType": "GetMetricData",
#  "GetMetricDataRequest": {
#    "StartTime": 1697060700,
#    "EndTime": 1697061600,
#    "Period": 300,
#    "Arguments": ["serviceregistry_external_http_requests{host_cluster!=\"prod\"}"] 
#  }
#}
#
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
    #
    # {
    #    "use1-az1": [
    #        {
    #          "Operation": "Ride",
    #          "AZ-ID": "use-az1",
    #          "Region": "us-east-1"
    #        }
    #    ],
    #    "use1-az2": [
    #    ]
    # }
    #
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

                # Set the value for this AZ (as identified by key) for the timestamp
                az_counts[epoch_timestamp][az_id] = item["Values"][index]

        if "NextToken" in data:
            next_token = data["NextToken"]

        if next_token is None:
            break

    # now we should have fault counts in each az by timestamp. Next we need to compare
    # each AZ at each timestamp to calculate the chi squared result

    # {
    #   "1716494472" : {
    #     "use1-az1": 0,
    #     "use1-az2": 10,
    #     "use1-az6": 5
    #   }
    # }

    metrics.set_property("InterimCalculation", json.loads(json.dumps(az_counts, default = str)))

    results = []

    match algorithm:
        case "Z_SCORE":
            results = z_score(az_counts = az_counts, az_id = az_id, threshold = threshold, metrics = metrics)
        case "IQR":
            results = iqr(az_counts = az_counts, az_id = az_id, threshold = threshold, metrics = metrics)
        case "MAD":
            results = iqr(az_counts = az_counts, az_id = az_id, threshold = threshold, metrics = metrics)
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
            chi_sq_result = chisquare(vals)

            if len(vals) > 0:
                expected = sum(vals) / len(vals)
                p_value: float64 = chi_sq_result.pvalue
                metrics.set_property("PValue_" + str(timestamp_key), str(p_value))

                for az in az_counts[timestamp_key]:
                    # set the farthest from the average to initially be the first AZ
                    farthest_from_expected = az
                    break

                # compare the other AZs for this timestamp and find the one
                # farthest from the average
                for az in az_counts[timestamp_key]:
                    if abs(az_counts[timestamp_key][az] - expected) > abs(az_counts[timestamp_key][farthest_from_expected] - expected):
                        farthest_from_expected = az        

                # if the p-value result is less than the threshold
                # and the one that is farthest from is the AZ we are
                # concerned with, then there is a statistically significant
                # difference and emit a 1 value
                if not numpy.isnan(p_value) and p_value <= threshold and az_id == farthest_from_expected:
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
        mean = numpy.mean(vals)
        metrics.set_property("Mean_" + str(timestamp_key), mean)
        std = numpy.std(vals)
        metrics.set_property("StdDev_" + str(timestamp_key), std)
        
        val = az_counts[timestamp_key][az_id]
        z_score = (val - mean) / std
        metrics.set_property("ZScore_" + str(timestamp_key), z_score)
            
        if z_score >= threshold:
            results.append(1)
        else:
            results.append(0)
    
    return results

# Interquartile Range Method
def iqr(az_counts: dict, az_id: str, threshold, metrics):
    results = []
    for timestamp_key in sorted(az_counts.keys(), reverse = True):
        vals = sorted(list(az_counts[timestamp_key].values()))
        q1 = numpy.percentile(vals, 25)
        metrics.set_property("Q1_" + str(timestamp_key), iqr)
        q3 = numpy.percentile(vals, 75)
        metrics.set_property("Q3_" + str(timestamp_key), iqr)
        iqr = q3 - q1
        metrics.set_property("IQR_" + str(timestamp_key), iqr)

        upper_bound = q3 + (1.5 * iqr)

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
        median = numpy.median(vals)

        absolute_deviations = []
        for val in vals:
            absolute_deviations.append(abs(val - median))

        mad = numpy.median(absolute_deviations)

        metrics.set_property("MAD_" + str(timestamp_key), mad)

        median + (threshold * mad)

        if az_counts[timestamp_key][az_id] >= median + (threshold * mad):
            results.append(1)
        else:
            results.append(0)
    
    return results


def z_score2(data: list, tested_number, threshold, timestamp_key, metrics):
    mean = numpy.mean(data)
    #metrics.set_property("Mean_" + str(timestamp_key), mean)
    std = numpy.std(data)
    #metrics.set_property("StdDev_" + str(timestamp_key), std)
        
    z_score = (tested_number - mean) / std
    #metrics.set_property("ZScore_" + str(timestamp_key), z_score)
            
    if z_score >= threshold:
        return 1
    else:
        return 0
    