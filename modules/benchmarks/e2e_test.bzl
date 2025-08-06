load("@devinfra//bazel/spec-bundling:index.bzl", "spec_bundle")
load("@rules_browsers//src/protractor_test:index.bzl", "protractor_test")

"""
  Macro that can be used to define a e2e test in `modules/benchmarks`. Targets created through
  this macro differentiate from a "benchmark_test" as they will run on CI and do not run
  with `@angular/benchpress`.
"""

def e2e_test(name, deps = [], server = None):
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
        data = [
            "//modules:node_modules/protractor",
            "//modules:node_modules/selenium-webdriver",
        ],
    )
