load("@npm//@bazel/protractor:index.bzl", "protractor_web_test_suite")

"""
  Macro that can be used to define a benchmark test. This differentiates from
  a normal Protractor test suite because we specify a custom "perf" configuration
  that sets up "@angular/benchpress". Benchmark test targets will not run on CI
  unless explicitly requested.
"""

def benchmark_test(name, server, tags = [], **kwargs):
    protractor_web_test_suite(
        name = name,
        browsers = ["//dev-infra/bazel/browsers/chromium:chromium"],
        configuration = "//dev-infra/benchmark/component_benchmark:protractor-perf.conf.js",
        on_prepare = "//dev-infra/benchmark/component_benchmark:start-server.js",
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
