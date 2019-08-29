load("@npm_bazel_protractor//:index.bzl", "protractor_web_test_suite")

"""
  Macro that can be used to define a benchmark test. This differentiates from
  a normal Protractor test suite because we specify a custom "perf" configuration
  that sets up "@angular/benchpress".
"""

def benchmark_test(name, server, deps, tags = []):
    protractor_web_test_suite(
        name = name,
        configuration = "//:protractor-perf.conf.js",
        data = [
            "//packages/bazel/src/protractor/utils",
            "//packages/benchpress",
        ],
        on_prepare = "//modules/benchmarks:start-server.js",
        server = server,
        tags = tags,
        deps = [
            "@npm//yargs",
        ] + deps,
    )
