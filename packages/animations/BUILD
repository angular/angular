package(default_visibility=["//visibility:public"])

load("@io_bazel_rules_typescript//:defs.bzl", "ts_library")

ts_library(
    name = "animations",
    srcs = glob(["**/*.ts"], exclude=[
      "test/**",
    ]),
    module_name = "@angular/animations",
    deps = [],
    tsconfig = ":tsconfig-build.json",
)