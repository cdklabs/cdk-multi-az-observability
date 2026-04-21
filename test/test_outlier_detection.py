# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: Apache-2.0
import unittest
import math
import sys
import os
from unittest.mock import MagicMock

# Add the source directory to the path so we can import index
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'src', 'outlier-detection', 'src'))

# Mock aws_embedded_metrics and boto3 before importing index
import types
mock_emm = types.ModuleType('aws_embedded_metrics')
def metric_scope(fn):
    """Mock metric_scope that just passes through the function."""
    return fn
mock_emm.metric_scope = metric_scope
sys.modules['aws_embedded_metrics'] = mock_emm
sys.modules['boto3'] = MagicMock()

from index import (
    _mean, _std, _median, _percentile,
    _chi_squared_p_value, _regularized_gamma_inc,
    _gamma_inc_series, _gamma_inc_cf,
    chi_squared, z_score, iqr, mad,
)


class TestMean(unittest.TestCase):
    def test_single_value(self):
        self.assertEqual(_mean([5]), 5.0)

    def test_integers(self):
        self.assertAlmostEqual(_mean([1, 2, 3, 4, 5]), 3.0)

    def test_floats(self):
        self.assertAlmostEqual(_mean([1.5, 2.5, 3.5]), 2.5)

    def test_identical_values(self):
        self.assertAlmostEqual(_mean([7, 7, 7, 7]), 7.0)

    def test_mixed_positive_negative(self):
        self.assertAlmostEqual(_mean([-2, 0, 2]), 0.0)


class TestStd(unittest.TestCase):
    def test_identical_values(self):
        self.assertAlmostEqual(_std([5, 5, 5, 5]), 0.0)

    def test_known_values(self):
        # Population std of [2, 4, 4, 4, 5, 5, 7, 9] = 2.0
        self.assertAlmostEqual(_std([2, 4, 4, 4, 5, 5, 7, 9]), 2.0)

    def test_two_values(self):
        # Population std of [0, 10] = 5.0
        self.assertAlmostEqual(_std([0, 10]), 5.0)

    def test_single_value(self):
        self.assertAlmostEqual(_std([42]), 0.0)


class TestMedian(unittest.TestCase):
    def test_odd_count(self):
        self.assertEqual(_median([3, 1, 2]), 2)

    def test_even_count(self):
        self.assertAlmostEqual(_median([1, 2, 3, 4]), 2.5)

    def test_single_value(self):
        self.assertEqual(_median([99]), 99)

    def test_already_sorted(self):
        self.assertAlmostEqual(_median([10, 20, 30, 40, 50]), 30)

    def test_unsorted(self):
        self.assertAlmostEqual(_median([5, 1, 3]), 3)


class TestPercentile(unittest.TestCase):
    def test_0th_percentile(self):
        self.assertAlmostEqual(_percentile([1, 2, 3, 4, 5], 0), 1.0)

    def test_100th_percentile(self):
        self.assertAlmostEqual(_percentile([1, 2, 3, 4, 5], 100), 5.0)

    def test_50th_percentile_is_median(self):
        vals = [1, 2, 3, 4, 5]
        self.assertAlmostEqual(_percentile(vals, 50), _median(vals))

    def test_25th_percentile(self):
        # numpy.percentile([1,2,3,4,5], 25) = 2.0
        self.assertAlmostEqual(_percentile([1, 2, 3, 4, 5], 25), 2.0)

    def test_75th_percentile(self):
        # numpy.percentile([1,2,3,4,5], 75) = 4.0
        self.assertAlmostEqual(_percentile([1, 2, 3, 4, 5], 75), 4.0)

    def test_interpolation(self):
        # numpy.percentile([10, 20, 30, 40], 25) = 17.5
        self.assertAlmostEqual(_percentile([10, 20, 30, 40], 25), 17.5)

    def test_single_value(self):
        self.assertAlmostEqual(_percentile([42], 50), 42.0)


class TestChiSquaredPValue(unittest.TestCase):
    def test_uniform_distribution(self):
        # All equal values should give p-value of 1.0
        p = _chi_squared_p_value([10, 10, 10])
        self.assertAlmostEqual(p, 1.0)

    def test_highly_skewed(self):
        # One value much larger should give a very small p-value
        p = _chi_squared_p_value([0, 0, 100])
        self.assertLess(p, 0.01)

    def test_single_element(self):
        self.assertAlmostEqual(_chi_squared_p_value([5]), 1.0)

    def test_all_zeros(self):
        self.assertAlmostEqual(_chi_squared_p_value([0, 0, 0]), 1.0)

    def test_two_elements_equal(self):
        p = _chi_squared_p_value([50, 50])
        self.assertAlmostEqual(p, 1.0)

    def test_two_elements_different(self):
        p = _chi_squared_p_value([10, 90])
        self.assertLess(p, 0.05)

    def test_moderate_difference(self):
        # Moderate difference should give intermediate p-value
        p = _chi_squared_p_value([30, 35, 35])
        self.assertGreater(p, 0.05)


class TestRegularizedGammaInc(unittest.TestCase):
    def test_zero_x(self):
        self.assertAlmostEqual(_regularized_gamma_inc(1.0, 0.0), 0.0)

    def test_negative_x(self):
        self.assertAlmostEqual(_regularized_gamma_inc(1.0, -1.0), 0.0)

    def test_known_value_a1(self):
        # P(1, 1) = 1 - e^(-1) ≈ 0.6321
        self.assertAlmostEqual(_regularized_gamma_inc(1.0, 1.0), 1.0 - math.exp(-1.0), places=6)

    def test_large_x(self):
        # For large x, P(a, x) should approach 1
        self.assertAlmostEqual(_regularized_gamma_inc(1.0, 20.0), 1.0, places=6)

    def test_series_path(self):
        # x < a + 1 triggers series expansion
        result = _regularized_gamma_inc(5.0, 3.0)
        self.assertGreater(result, 0.0)
        self.assertLess(result, 1.0)

    def test_cf_path(self):
        # x >= a + 1 triggers continued fraction
        result = _regularized_gamma_inc(2.0, 5.0)
        self.assertGreater(result, 0.0)
        self.assertLess(result, 1.0)


class TestGammaIncSeries(unittest.TestCase):
    def test_basic(self):
        result = _gamma_inc_series(1.0, 0.5)
        self.assertGreater(result, 0.0)
        self.assertLess(result, 1.0)


class TestGammaIncCF(unittest.TestCase):
    def test_basic(self):
        result = _gamma_inc_cf(1.0, 3.0)
        self.assertGreater(result, 0.0)
        self.assertLess(result, 1.0)


def _make_metrics():
    """Create a mock metrics object for algorithm function tests."""
    m = MagicMock()
    m.set_property = MagicMock()
    m.put_metric = MagicMock()
    return m


class TestChiSquaredAlgorithm(unittest.TestCase):
    def test_all_zeros(self):
        az_counts = {1000: {"az1": 0, "az2": 0, "az3": 0}}
        results = chi_squared(az_counts, "az1", 0.05, _make_metrics())
        self.assertEqual(results, [0])

    def test_uniform_values(self):
        az_counts = {1000: {"az1": 10, "az2": 10, "az3": 10}}
        results = chi_squared(az_counts, "az1", 0.05, _make_metrics())
        self.assertEqual(results, [0])

    def test_outlier_detected(self):
        # az1 is the clear outlier with a much higher value
        az_counts = {1000: {"az1": 100, "az2": 1, "az3": 1}}
        results = chi_squared(az_counts, "az1", 0.05, _make_metrics())
        self.assertEqual(results, [1])

    def test_outlier_not_target_az(self):
        # az3 is the outlier, but we're checking az1
        az_counts = {1000: {"az1": 1, "az2": 1, "az3": 100}}
        results = chi_squared(az_counts, "az1", 0.05, _make_metrics())
        self.assertEqual(results, [0])

    def test_multiple_timestamps(self):
        az_counts = {
            2000: {"az1": 10, "az2": 10, "az3": 10},
            1000: {"az1": 100, "az2": 1, "az3": 1},
        }
        results = chi_squared(az_counts, "az1", 0.05, _make_metrics())
        # Sorted descending: 2000 first (uniform=0), then 1000 (outlier=1)
        self.assertEqual(results, [0, 1])


class TestZScoreAlgorithm(unittest.TestCase):
    def test_identical_values_returns_zero(self):
        az_counts = {1000: {"az1": 5, "az2": 5, "az3": 5}}
        results = z_score(az_counts, "az1", 2.0, _make_metrics())
        self.assertEqual(results, [0])

    def test_outlier_detected(self):
        az_counts = {1000: {"az1": 100, "az2": 10, "az3": 10}}
        results = z_score(az_counts, "az1", 1.0, _make_metrics())
        self.assertEqual(results, [1])

    def test_no_outlier(self):
        az_counts = {1000: {"az1": 10, "az2": 11, "az3": 9}}
        results = z_score(az_counts, "az1", 2.0, _make_metrics())
        self.assertEqual(results, [0])

    def test_multiple_timestamps(self):
        az_counts = {
            2000: {"az1": 5, "az2": 5, "az3": 5},
            1000: {"az1": 100, "az2": 10, "az3": 10},
        }
        results = z_score(az_counts, "az1", 1.0, _make_metrics())
        self.assertEqual(results, [0, 1])


class TestIQRAlgorithm(unittest.TestCase):
    def test_no_outlier(self):
        az_counts = {1000: {"az1": 10, "az2": 11, "az3": 12, "az4": 13, "az5": 14}}
        results = iqr(az_counts, "az1", 1.5, _make_metrics())
        self.assertEqual(results, [0])

    def test_outlier_detected(self):
        az_counts = {1000: {"az1": 100, "az2": 10, "az3": 11, "az4": 12, "az5": 13}}
        results = iqr(az_counts, "az1", 1.5, _make_metrics())
        self.assertEqual(results, [1])

    def test_identical_values(self):
        az_counts = {1000: {"az1": 5, "az2": 5, "az3": 5, "az4": 5}}
        results = iqr(az_counts, "az1", 1.5, _make_metrics())
        self.assertEqual(results, [0])

    def test_multiple_timestamps(self):
        az_counts = {
            2000: {"az1": 10, "az2": 10, "az3": 10, "az4": 10},
            1000: {"az1": 100, "az2": 10, "az3": 10, "az4": 10},
        }
        results = iqr(az_counts, "az1", 1.5, _make_metrics())
        self.assertEqual(results, [0, 1])


class TestMADAlgorithm(unittest.TestCase):
    def test_no_outlier(self):
        az_counts = {1000: {"az1": 10, "az2": 11, "az3": 12}}
        results = mad(az_counts, "az1", 3.0, _make_metrics())
        self.assertEqual(results, [0])

    def test_outlier_detected(self):
        az_counts = {1000: {"az1": 100, "az2": 10, "az3": 11, "az4": 12}}
        results = mad(az_counts, "az1", 3.0, _make_metrics())
        self.assertEqual(results, [1])

    def test_identical_values(self):
        # All same values: MAD = 0, threshold * 0 = 0, median + 0 = 5
        # az1 value (5) >= 5 is true, so result is 1
        az_counts = {1000: {"az1": 5, "az2": 5, "az3": 5}}
        results = mad(az_counts, "az1", 3.0, _make_metrics())
        self.assertEqual(results, [1])

    def test_multiple_timestamps(self):
        az_counts = {
            2000: {"az1": 10, "az2": 11, "az3": 12},
            1000: {"az1": 100, "az2": 10, "az3": 11, "az4": 12},
        }
        results = mad(az_counts, "az1", 3.0, _make_metrics())
        self.assertEqual(results, [0, 1])


if __name__ == "__main__":
    unittest.main()
