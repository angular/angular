package(default_visibility=["//visibility:public"])
load("@io_bazel_rules_typescript//:defs.bzl", "ts_library")

ts_library(
    name = "core",
    srcs = glob(["**/*.ts"], exclude=[
      "test/**",
      "testing/**",
    ]),
    module_name = "@angular/core",
    deps = [],
    tsconfig = ":tsconfig-build.json",
)
