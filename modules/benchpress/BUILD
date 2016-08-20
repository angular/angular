load("//build_defs:jasmine.bzl", "jasmine_node_test")
load("//build_defs:typescript.bzl", "ts_library")


ts_library(
    name = "benchpress",
    srcs = glob(
        ["*.ts", "src/**/*.ts"],
        exclude = ["types.d.ts"]
    ),
    deps = [
        "//:_types_selenium-webdriver",
        "//:core",
        "//:facade",
    ],
    tsconfig = "tsconfig.json",
)

ts_library(
    name = "benchpress_test_module",
    srcs = glob(["test/**/*.ts"]),
    deps = [
        "//:_types_protractor",
        ":benchpress",
    ],
    tsconfig = "tsconfig.json",
)
