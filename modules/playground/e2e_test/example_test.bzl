load("//packages/bazel:index.bzl", "protractor_web_test_suite")
load("//tools:defaults.bzl", "ts_library")

def example_test(name, srcs, server, data = []):
    ts_library(
        name = "%s_lib" % name,
        testonly = True,
        srcs = srcs,
        tsconfig = "//modules/playground:tsconfig-e2e.json",
        deps = [
            "//modules/e2e_util",
            "//packages/private/testing",
            "@ngdeps//@types/jasminewd2",
            "@ngdeps//@types/selenium-webdriver",
            "@ngdeps//protractor",
        ],
    )

    protractor_web_test_suite(
        name = "protractor_tests",
        data = ["//packages/bazel/src/protractor/utils"] + data,
        on_prepare = "//modules/playground/e2e_test:start-server.js",
        server = server,
        deps = [
            ":%s_lib" % name,
            "@ngdeps//protractor",
            "@ngdeps//selenium-webdriver",
            "@ngdeps//yargs",
            "@ngdeps//source-map",
        ],
    )
