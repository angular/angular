package(default_visibility=["//visibility:public"])
load("@io_bazel_rules_typescript//:defs.bzl", "ts_library")

ts_library(
    name = "browser",
    srcs = glob(["**/*.ts"], exclude=[
      "test/**",
      "testing/**",
    ]),
    module_name = "@angular/animations/browser",
    deps = ["//packages/animations"],
    tsconfig = ":tsconfig-build.json",
)