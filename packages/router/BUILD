package(default_visibility=["//visibility:public"])
load("@io_bazel_rules_typescript//:defs.bzl", "ts_library")

ts_library(
    name = "router",
    srcs = glob(["**/*.ts"], exclude=[
      "test/**",
      "testing/**",
    ]),
    module_name = "@angular/router",
    deps = [
        "//packages/common",
        "//packages/core",
        "//packages/platform-browser",
    ],
    tsconfig = ":tsconfig-build.json",
)