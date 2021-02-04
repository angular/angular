load("//tools:defaults.bzl", "protractor_web_test_suite", "ts_library")

def example_test(name, srcs, server, data = [], deps = [], **kwargs):
    ts_library(
        name = "%s_lib" % name,
        testonly = True,
        srcs = srcs,
        tsconfig = "//modules/playground:tsconfig-e2e.json",
        deps = [
            "//dev-infra/benchmark/driver-utilities",
            "//packages/private/testing",
            "@npm//@types/jasminewd2",
            "@npm//@types/selenium-webdriver",
            "@npm//protractor",
        ] + deps,
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
