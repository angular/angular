package(default_visibility=["//visibility:public"])
load("@io_bazel_rules_typescript//:defs.bzl", "ts_library")

ts_library(
    name = "static",
    srcs = glob(["**/*.ts"]),
    module_name = "@angular/upgrade/static",
    deps = [
        "//packages/core",
        "//packages/platform-browser-dynamic",
    ],
    tsconfig = ":tsconfig-build.json",
)