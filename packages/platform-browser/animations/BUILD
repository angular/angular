package(default_visibility=["//visibility:public"])
load("@io_bazel_rules_typescript//:defs.bzl", "ts_library")

ts_library(
    name = "animations",
    srcs = glob(["**/*.ts"], exclude=[
      "test/**",
    ]),
    module_name = "@angular/platform-browser/animations",
    deps = [
      "//packages/animations",
      "//packages/animations/browser",
      "//packages/core",
      "//packages/common",
      "//packages/platform-browser",
    ],
    tsconfig = ":tsconfig-build.json",
)
