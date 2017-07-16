package(default_visibility=["//visibility:public"])
load("@io_bazel_rules_typescript//:defs.bzl", "ts_library")

ts_library(
    name = "upgrade",
    srcs = glob(["**/*.ts"]),
    module_name = "@angular/router/upgrade",
    deps = [
        "//packages/core",
        "//packages/router",
        "//packages/upgrade/static",
    ],
    tsconfig = ":tsconfig-build.json",
)