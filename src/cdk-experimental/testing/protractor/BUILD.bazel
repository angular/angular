package(default_visibility = ["//visibility:public"])

load("//tools:defaults.bzl", "ts_library")

ts_library(
    name = "protractor",
    srcs = glob(
        ["**/*.ts"],
        exclude = ["**/*.spec.ts"],
    ),
    module_name = "@angular/cdk-experimental/testing/protractor",
    deps = [
        "//src/cdk-experimental/testing",
        "@npm//protractor",
    ],
)
