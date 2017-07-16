package(default_visibility=["//visibility:public"])
load("@io_bazel_rules_typescript//:defs.bzl", "ts_library")

ts_library(
    name = "platform-server",
    srcs = glob(["**/*.ts"], exclude=[
      "integrationtest/**",
      "test/**",
      "testing/**",
    ]),
    module_name = "@angular/platform-server",
    deps = [
        "//packages/animations/browser",
        "//packages/common",
        "//packages/common/http",
        "//packages/compiler",
        "//packages/core",
        "//packages/http",
        "//packages/platform-browser",
        "//packages/platform-browser/animations",
    ],
    tsconfig = ":tsconfig-build.json",
)