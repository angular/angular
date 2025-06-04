load("//tools:defaults.bzl", "protractor_web_test_suite")
load("//tools:defaults2.bzl", "ts_project")

def example_test(
        name,
        srcs,
        server,
        data = [],
        interop_deps = [],
        deps = [],
        tsconfig = "//modules/playground:tsconfig_e2e",
        use_legacy_webdriver_types = True,
        **kwargs):
    # Reliance on the Control Flow in Selenium Webdriver is not recommended long-term,
    # especially with the deprecation of Protractor. New tests should not use the legacy
    # webdriver types but rather use the actual `@types/jasmine` types.
    if use_legacy_webdriver_types:
        tsconfig = "//modules/playground:tsconfig_e2e_legacy_wd2"

    ts_project(
        name = "%s_lib" % name,
        testonly = True,
        srcs = srcs,
        tsconfig = tsconfig,
        deps = deps + [
            "//:node_modules/protractor",
            "//:node_modules/@types/selenium-webdriver",
        ],
        interop_deps = interop_deps + [
            "@npm//@angular/build-tooling/bazel/benchmark/driver-utilities",
        ],
    )

    protractor_web_test_suite(
        name = "protractor_tests",
        data = data + ["@npm//source-map"],
        on_prepare = "//modules/playground/e2e_test:start-server.js",
        server = server,
        deps = [
            ":%s_lib" % name,
            "@npm//selenium-webdriver",
            "@npm//yargs",
        ],
        **kwargs
    )
