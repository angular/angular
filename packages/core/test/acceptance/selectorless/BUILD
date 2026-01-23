load("//tools:defaults.bzl", "angular_jasmine_test", "ng_project", "ng_web_test_suite", "ts_config")

package(default_visibility = ["//visibility:private"])

ts_config(
    name = "tsconfig",
    src = "tsconfig.json",
    deps = [
        "//packages/core:tsconfig_test",
    ],
)

ng_project(
    name = "selectorless_test_lib",
    testonly = True,
    srcs = glob(["**/*.ts"]),
    tsconfig = ":tsconfig",
    visibility = ["//:__pkg__"],
    deps = [
        "//packages/core",
        "//packages/core/testing",
    ],
)

angular_jasmine_test(
    name = "selectorless",
    data = [
        ":selectorless_test_lib",
        "//:node_modules/source-map",
    ],
)

ng_web_test_suite(
    name = "selectorless_web",
    deps = [
        ":selectorless_test_lib",
    ],
)
