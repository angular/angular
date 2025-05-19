load("//tools:defaults.bzl", "jasmine_node_test", "karma_web_test_suite")
load("//tools:defaults2.bzl", "ng_project")

package(default_visibility = ["//visibility:private"])

ng_project(
    name = "selectorless_test_lib",
    testonly = True,
    srcs = glob(["**/*.ts"]),
    extends = "//packages/core:tsconfig_test",
    interop_deps = [
        "//packages/core",
        "//packages/core/testing",
        "//packages/zone.js/lib:zone_d_ts",
    ],
    tsconfig = ":tsconfig.json",
    visibility = ["//:__pkg__"],
)

jasmine_node_test(
    name = "selectorless",
    bootstrap = ["//tools/testing:node"],
    deps = [
        ":selectorless_test_lib",
        "//packages/zone.js/lib:zone_d_ts",
        "@npm//source-map",
    ],
)

karma_web_test_suite(
    name = "selectorless_web",
    deps = [
        ":selectorless_test_lib",
    ],
)
