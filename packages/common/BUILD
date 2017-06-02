package(default_visibility=["//visibility:public"])
load("@io_bazel_rules_typescript//:defs.bzl", "ts_library")

ts_library(
    name = "common",
    srcs = glob(["**/*.ts"], exclude=[
      "test/**",
      "testing/**",
    ]),
    module_name = "@angular/common",
    deps = ["//packages/core"],
    tsconfig = ":tsconfig-build.json",
)
