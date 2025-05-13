load("//tools:defaults.bzl", "jasmine_node_test", "karma_web_test_suite", "ng_module")

package(default_visibility = ["//visibility:private"])

ng_module(
    name = "selectorless_test_lib",
    testonly = True,
    srcs = glob(["**/*.ts"]),
    tsconfig = ":tsconfig.json",
    visibility = ["//:__pkg__"],
    deps = [
        "//packages/core",
        "//packages/core/testing",
        "//packages/zone.js/lib:zone_d_ts",
    ],
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
