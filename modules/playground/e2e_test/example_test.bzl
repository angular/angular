load("@devinfra//bazel/spec-bundling:index.bzl", "spec_bundle")
load("@rules_browsers//protractor_test:index.bzl", "protractor_test")
load("//tools:defaults2.bzl", "ts_project")

def example_test(
        name,
        srcs,
        server,
        data = [],
        deps = [],
        external = [],
        tsconfig = "//modules/playground:tsconfig_e2e",
        use_legacy_webdriver_types = True):
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
            "//modules:node_modules/protractor",
            "//modules:node_modules/@types/selenium-webdriver",
            "//modules/utilities:utilities",
        ],
    )

    spec_bundle(
        name = "%s_bundle" % name,
        testonly = True,
        srcs = ["//modules/playground:tsconfig_e2e"],
        deps = [
            "%s_lib" % name,
        ],
        tags = [
            "manual",
        ],
        config = {
            "resolveExtensions": [".js", ".mjs"],
            "tsconfig": "./modules/playground/tsconfig-e2e.json",
        },
        external = external + ["protractor", "selenium-webdriver"],
    )

    protractor_test(
        name = name,
        deps = [":%s_bundle" % name],
        server = server,
        data = data + [
            "//modules:node_modules/selenium-webdriver",
            "//modules:node_modules/yargs",
        ],
    )
