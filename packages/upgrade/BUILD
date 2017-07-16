package(default_visibility=["//visibility:public"])
load("@io_bazel_rules_typescript//:defs.bzl", "ts_library")

ts_library(
    name = "upgrade",
    srcs = glob(["**/*.ts"], exclude = [
        "test/**"
    ]),
    module_name = "@angular/upgrade",
    deps = [
        "//packages/core",
        "//packages/platform-browser-dynamic",
    ],
    tsconfig = ":tsconfig-build.json",
)