package(default_visibility=["//visibility:public"])
load("@io_bazel_rules_typescript//:defs.bzl", "ts_library")

ts_library(
    name = "language-service",
    srcs = glob(["**/*.ts"], exclude=[
      "test/**",
    ]),
    module_name = "@angular/language-service",
    deps = [
      "//packages/core",
      "//packages/compiler-cli",
      "//packages/tsc-wrapped",
    ],
    tsconfig = ":tsconfig-build.json",
)
