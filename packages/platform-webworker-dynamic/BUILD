package(default_visibility=["//visibility:public"])
load("@io_bazel_rules_typescript//:defs.bzl", "ts_library")

ts_library(
    name = "platform-webworker-dynamic",
    srcs = glob(["**/*.ts"]),
    module_name = "@angular/platform-webworker-dynamic",
    deps = [
        "//packages/common",
        "//packages/compiler",
        "//packages/core",
        "//packages/platform-browser-dynamic",
    ],
    tsconfig = ":tsconfig-build.json",
)