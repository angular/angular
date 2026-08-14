load("//tools:defaults.bzl", "ts_project", "webdriver_test")

def example_test(
        name,
        srcs,
        server,
        data = [],
        deps = [],
        external = [],
        tsconfig = "//modules/playground:tsconfig_e2e",
        use_legacy_webdriver_types = False):
    ts_project(
        name = "%s_lib" % name,
        testonly = True,
        srcs = srcs,
        tsconfig = "//modules/playground:tsconfig_e2e",
        deps = deps + [
            "//modules:node_modules/@types/jasmine",
            "//modules:node_modules/@types/selenium-webdriver",
            "//modules:node_modules/selenium-webdriver",
            "//packages/examples/test-utils:test-utils",
        ],
    )

    webdriver_test(
        name = name,
        server = server,
        data = data,
        external = external,
        deps = [
            ":%s_lib" % name,
        ],
    )
