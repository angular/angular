load("//tools:defaults2.bzl", "angular_jasmine_test", "ng_project", "ng_web_test_suite")

package(default_visibility = ["//visibility:private"])

ng_project(
    name = "selectorless_test_lib",
    testonly = True,
    srcs = glob(["**/*.ts"]),
    extends = "//packages/core:tsconfig_test",
    tsconfig = ":tsconfig.json",
    visibility = ["//:__pkg__"],
    deps = [
        "//packages/core:core_rjs",
        "//packages/core/testing:testing_rjs",
    ],
)

angular_jasmine_test(
    name = "selectorless",
    data = [
        ":selectorless_test_lib_rjs",
        "//:node_modules/source-map",
    ],
)

ng_web_test_suite(
    name = "selectorless_web",
    deps = [
        ":selectorless_test_lib_rjs",
    ],
)
