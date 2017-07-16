package(default_visibility=["//visibility:public"])
load("@io_bazel_rules_typescript//:defs.bzl", "ts_library")

ts_library(
    name = "platform-webworker",
    srcs = glob(["**/*.ts"], exclude=[
      "test/**",
    ]),
    module_name = "@angular/platform-webworker",
    deps = [
        "//packages/common",
        "//packages/core",
        "//packages/platform-browser",
    ],
    tsconfig = ":tsconfig-build.json",
)