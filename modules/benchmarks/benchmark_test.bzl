load("//tools:defaults.bzl", "protractor_web_test_suite")

"""
  Macro that can be used to define a benchmark test. This differentiates from
  a normal Protractor test suite because we specify a custom "perf" configuration
  that sets up "@angular/benchpress". Benchmark test targets will not run on CI
  unless explicitly requested.
"""

def benchmark_test(name, server, tags = [], **kwargs):
    protractor_web_test_suite(
        name = name,
        configuration = "//:protractor-perf.conf.js",
        data = [
            "//packages/benchpress",
        ],
        on_prepare = "//modules/benchmarks:start-server.js",
        server = server,
        # Benchmark targets should not run on CI by default.
        tags = tags + [
            "manual",
            "no-remote-exec",
        ],
        test_suite_tags = [
            "manual",
            "no-remote-exec",
        ],
        **kwargs
    )
