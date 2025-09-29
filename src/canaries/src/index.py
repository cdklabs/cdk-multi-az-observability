# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: Apache-2.0
import json
import http.client
import urllib.parse
import urllib
import time
import functools
import copy
import os
import traceback
import uuid
import requests
from inspect import getfullargspec
from dateutil import parser
from datetime import datetime, timedelta, timezone
from aws_embedded_metrics import metric_scope
from aws_xray_sdk.core import xray_recorder
from aws_xray_sdk.core import patch_all
from requests.packages.urllib3.util.retry import Retry
from requests.adapters import HTTPAdapter

ignore_ssl_errors = os.environ.get("IGNORE_SSL_ERRORS")
region = os.environ.get("REGION")
#session = requests.Session()
#session.mount("http://", HTTPAdapter(max_retries = 0))

try:
  timeout = float(os.environ.get("TIMEOUT"))
except (TypeError, ValueError):
  timeout = 2.0

#patch_all(double_patch=True)
patch_all()

def parameterized(dec):
  def layer(*args, **kwargs):
    def repl(f):
      return dec(f, *args, **kwargs)
    return repl
  return layer

@parameterized
def latency_timer(method, metric_parameter_name):
  """Measure method latency"""
  argspec = getfullargspec(method)
  argument_index = argspec.args.index(metric_parameter_name)

  @functools.wraps(method)
  def timed(*args, **kwargs):
    start = time.perf_counter()
    code = method(*args, **kwargs)
    end = time.perf_counter()

    metrics = None
    if metric_parameter_name in kwargs:
      metrics = kwargs.get(metric_parameter_name, None)
    elif argument_index > -1:
      metrics = args[argument_index]
      
    if metrics is not None:
      if code is not None and code >= 200 and code <= 399:
        metrics.put_metric("SuccessLatency", (end - start) * 1000, "Milliseconds")
      else:
        metrics.put_metric("FaultLatency", (end - start) * 1000, "Milliseconds")
    else:
      print("Metrics parameter not found.")
    return code
  return timed

@metric_scope
@latency_timer("metrics")
@xray_recorder.capture('url_check')
def verify_request(context, item, method, id, metrics = None):
  method_start = (time.time() * 1000)
  metrics.set_property("MethodStartTime", round(method_start))
  code = None
  
  if "postData" in item:
    post_data = item["postData"]
  else:
    post_data = ""

  if "headers" in item:
    headers = item["headers"]
  else:
    headers = {}

  url = item["url"]
  operation = item["operation"]
  fault_boundary_id = item["faultBoundaryId"]
  fault_boundary = item["faultBoundary"]
  metric_namespace = item["metricNamespace"]

  xray_recorder.put_annotation("Source", "canary")
  xray_recorder.put_annotation("Url", url)
  xray_recorder.put_annotation("Operation", operation)

  try:
    metrics.context.properties.clear()
    metrics.set_namespace(metric_namespace)

    metrics.set_property("Method", method)
    metrics.set_property("Url", url)
    metrics.set_property("PostData", post_data)
    
    parsed_url = urllib.parse.urlparse(url)
    user_agent = "lambda-canary-python3.13"
    h = copy.deepcopy(headers)
    if "User-Agent" in h:
      h["User-Agent"] = " ".join([user_agent, h["User-Agent"]])
    else:
      h["User-Agent"] = "{}".format(user_agent)
      
    metrics.set_property("LambdaRequestId", id)
    h["X-Lambda-RequestId"] = id
         
    invocation_id = str(uuid.uuid4())
    metrics.set_property("InvocationId", invocation_id)
    h["X-Invocation-Id"] = invocation_id
    
    metrics.set_property("Headers", h)
    if fault_boundary == "az":
      metrics.set_dimensions({"Operation": operation, "AZ-ID": fault_boundary_id, "Region": region })
    else:
      metrics.set_dimensions({"Operation": operation, "Region": fault_boundary_id })
    
    verify = not (parsed_url.scheme == "https" and ignore_ssl_errors == True)
    error = False

    try:
      start = (time.time() * 1000)
      metrics.set_property("RequestStartTime", round(start))
      
      response = requests.request(method = method, headers = h, url = url, data = str(post_data), verify = verify, timeout = timeout, stream = True)
      data = response.text
      response_end = time.time() * 1000
      if response.raw._connection and response.raw._connection.sock:
        sock = response.raw._connection.sock.getsockname()
        metrics.set_property("RemoteIpAddress", str(sock[0]) + ":" + str(sock[1]))
      else:
        metrics.set_property("RemoteIpAddress", "Unknown")
      metrics.set_property("ResponseReceivedTime", round(response_end))
      metrics.put_metric("TimeToResponseReceived", response_end - start, "Milliseconds")
    except http.client.RemoteDisconnected as e:
      metrics.set_property("RemoteDisconnected", str(e))
      error = True
    except http.client.HTTPException as e:
      metrics.set_property("HTTPException", str(e))
      error = True
    except ConnectionError as e: # networking problem, DNS failure, refused connection
      metrics.set_property("ConnectionError", str(e))
      error = True
    except TimeoutError as e:
      metrics.set_property("TimeoutError", str(e))
      error = True
    except Exception as e:
      metrics.set_property("GenericError", str(e))
      metrics.set_property("Traceback", traceback.format_exc())
      error = True
     
    if error == True:
      metrics.put_metric("Failure", 1, "Count")
      metrics.put_metric("Fault", 0, "Count")
      metrics.put_metric("Error", 0, "Count")
      metrics.put_metric("Success", 0, "Count")
      return None
    
    code = response.status_code
    response_headers = dict(response.headers)

    metrics.set_property("HttpStatusCode", code) 
    metrics.set_property("ResponseHeaders", response_headers)
    
    if response.reason:   
      metrics.set_property("Reason", response.reason)
    
    try:
      data = response.text
      json_obj = json.loads(data)
      metrics.set_property("Response", json_obj) 
      response_decode_end = time.time() * 1000
      metrics.set_property("ResponseDecodedTime", round(response_decode_end))
      metrics.put_metric("TimeToResponseBodyRead", response_decode_end - start, "Milliseconds")
    except Exception as e:
      metrics.set_property("ResponseDecodeError", str(e))

    metrics.put_metric("Success", (1 if code >= 200 and code <= 399 else 0), "Count")
    metrics.put_metric("Error", (1 if code >= 400 and code <= 499 else 0), "Count")
    metrics.put_metric("Fault", (1 if code >= 500 and code <= 599 else 0), "Count")
    metrics.put_metric("Failure", 0, "Count")

    method_end = (time.time() * 1000)
    metrics.set_property("MethodStartTime", round(method_end))
    metrics.set_property("MethodInvocationTime", method_end - method_start)
    return code

  except Exception as e:
    metrics.set_property("GenericError", str(e))
    metrics.set_property("Traceback", traceback.format_exc())
    
    if code is None:
      metrics.put_metric("Success", 0, "Count")
      metrics.put_metric("Error", 0, "Count")
      metrics.put_metric("Fault", 0, "Count")
      metrics.put_metric("Failure", 1, "Count")
    else:
      metrics.put_metric("Success", (1 if code >= 200 and code <= 399 else 0), "Count")
      metrics.put_metric("Error", (1 if code >= 400 and code <= 499 else 0), "Count")
      metrics.put_metric("Fault", (1 if code >= 500 and code <= 599 else 0), "Count")
      metrics.put_metric("Failure", 0, "Count")     

@metric_scope
@xray_recorder.capture('handler')
def handler(event, context, metrics):
  start = time.perf_counter()
  metrics.set_namespace("Canaries")
  metrics.set_dimensions({"FunctionName": context.function_name, "Region": os.environ.get("AWS_REGION") })
  metrics.set_property("CanaryName", context.function_name)
  metrics.set_property("Event", event)
  
  if context.aws_request_id:
    metrics.set_property("AWSRequestIdPresent", True)
    metrics.set_property("LambdaRequestId", context.aws_request_id)
    id = context.aws_request_id
  else:
    metrics.set_property("AWSRequestIdPresent", False)
    id = str(uuid.uuid4())
    metrics.set_property("LambdaRequestId", id)

  xray_recorder.put_annotation("Source", "canary")

  errors = []
  tracebacks = []

  if "parameters" in event and event["parameters"] is not None:
    request_count = 10
    if "requestCount" in event["parameters"] and event["parameters"]["requestCount"] is not None:
      request_count = int(event["parameters"]["requestCount"])

    methods = event["parameters"]["methods"]

    if methods is None or len(methods) == 0:
      methods = [ "GET" ]

    for method in methods:
      for x in range(0, request_count):
        try:
          verify_request(context, event["parameters"], method, id)
          time.sleep(1)
        except Exception as e:
          errors.append(str(e))
          tracebacks.append(traceback.format_exc())
  
  metrics.set_property("Errors", errors)
  metrics.set_property("Tracebacks", tracebacks)
  end = time.perf_counter()
  metrics.put_metric("TotalProcessingLatency", (end - start) * 1000, "Milliseconds")

  return None
