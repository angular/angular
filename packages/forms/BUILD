package(default_visibility=["//visibility:public"])
load("@io_bazel_rules_typescript//:defs.bzl", "ts_library")

ts_library(
    name = "forms",
    srcs = glob(["**/*.ts"], exclude=[
      "test/**",
    ]),
    module_name = "@angular/forms",
    deps = [
      "//packages/core",
      "//packages/platform-browser"
    ],
    tsconfig = ":tsconfig-build.json",
)
