load("//tools:defaults.bzl", "protractor_web_test_suite", "ts_library")

def example_test(name, srcs, server, data = [], deps = [], use_legacy_webdriver_types = True, **kwargs):
    ts_deps = [
        "@npm//@angular/build-tooling/bazel/benchmark/driver-utilities",
        "//packages/private/testing",
        "@npm//@types/selenium-webdriver",
        "@npm//protractor",
    ] + deps

    # Reliance on the Control Flow in Selenium Webdriver is not recommended long-term,
    # especially with the deprecation of Protractor. New tests should not use the legacy
    # webdriver types but rather use the actual `@types/jasmine` types.
    if use_legacy_webdriver_types:
        ts_deps.append("@npm//@types/jasminewd2")

    ts_library(
        name = "%s_lib" % name,
        testonly = True,
        srcs = srcs,
        tsconfig = "//modules/playground:tsconfig-e2e.json",
        deps = ts_deps,
    )

    protractor_web_test_suite(
        name = "protractor_tests",
        data = data,
        on_prepare = "//modules/playground/e2e_test:start-server.js",
        server = server,
        deps = [
            ":%s_lib" % name,
            "@npm//selenium-webdriver",
            "@npm//yargs",
            "@npm//source-map",
        ],
        **kwargs
    )
