load("@devinfra//bazel/spec-bundling:index.bzl", "spec_bundle")
load("@rules_browsers//src/protractor_test:index.bzl", "protractor_test")

"""
  Macro that can be used to define a e2e test in `modules/benchmarks`. Targets created through
  this macro differentiate from a "benchmark_test" as they will run on CI and do not run
  with `@angular/benchpress`.
"""

def benchmark_test(name, deps = [], server = None, tags = []):
    spec_bundle(
        name = "%s_bundle" % name,
        testonly = True,
        srcs = ["//modules/benchmarks:tsconfig_e2e"],
        deps = deps,
        tags = [
            "manual",
        ],
        config = {
            "resolveExtensions": [".js", ".mjs"],
            "tsconfig": "./modules/benchmarks/tsconfig-e2e.json",
        },
        external = ["protractor", "selenium-webdriver"],
    )

    protractor_test(
        name = name,
        deps = [":%s_bundle" % name],
        server = server,
        enable_perf_logging = True,
        # Benchmark targets should not run on CI by default.
        tags = tags + [
            "benchmark-test",
            "manual",
            "no-remote-exec",
        ],
        data = [
            "//modules:node_modules/@angular/benchpress",
            "//modules:node_modules/tslib",
            "//modules:node_modules/protractor",
            "//modules:node_modules/selenium-webdriver",
        ],
    )
