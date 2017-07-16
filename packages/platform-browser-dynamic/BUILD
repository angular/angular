package(default_visibility=["//visibility:public"])
load("@io_bazel_rules_typescript//:defs.bzl", "ts_library")

ts_library(
    name = "platform-browser-dynamic",
    srcs = glob(["**/*.ts"], exclude=[
      "test/**",
      "testing/**",
    ]),
    module_name = "@angular/platform-browser-dynamic",
    deps = [
      "//packages/common",
      "//packages/compiler",
      "//packages/core",
      "//packages/platform-browser",
    ],
    tsconfig = ":tsconfig-build.json",
)
