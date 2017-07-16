package(default_visibility=["//visibility:public"])
load("@io_bazel_rules_typescript//:defs.bzl", "ts_library")

ts_library(
    name = "platform-browser",
    srcs = glob(["**/*.ts"], exclude=[
      "test/**",
      "testing/**",
    ]),
    module_name = "@angular/platform-browser",
    deps = [
      "//packages/core",
      "//packages/common"
    ],
    tsconfig = ":tsconfig-build.json",
)
