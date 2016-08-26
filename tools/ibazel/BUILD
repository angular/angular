load("//build_defs:nodejs.bzl", "nodejs_binary")
load("//build_defs:typescript.bzl", "ts_library")
load("//build_defs:jasmine.bzl", "jasmine_node_test")

ts_library(
    name = "ibazel",
    srcs = [
        "environment.ts",
        "index.ts",
        "parser.ts",
        "utils.ts",
    ],
    deps = [
        "//:_types_node",
        "//:_types_jasmine",
    ],
    data = [
        "//:chalk",
        "//:chokidar",
        "//:protobufjs",
        "build.proto",
    ],
    tsconfig = "tsconfig.json",
)

nodejs_binary(
    name = "ibazel_bin",
    srcs = [":ibazel"],
    entry_point = "index.js",
)

ts_library(
    name = "ibazel_test_module",
    srcs = [
        "environment_mock.ts",
        "environment_spec.ts",
        "index_spec.ts",
        "parser_spec.ts",
        "utils_spec.ts",
    ],
    deps = [
        "//:_types_jasmine",
        ":ibazel",
    ],
    data = [
        "//:source-map-support",
    ],
    tsconfig = "tsconfig.json",
)

ts_library(
    name = "ibazel_e2e_test_module",
    srcs = [
        "e2e_spec.ts",
    ],
    deps = [
        "//:_types_node",
        "//:_types_jasmine",
        ":ibazel",
    ],
    tsconfig = "tsconfig.json",
)

jasmine_node_test(
    name = "ibazel_test",
    srcs = [":ibazel_test_module"],
    size = "small",
    args = ["--node_path=tools"],
)

jasmine_node_test(
    name = "ibazel_e2e_test",
    srcs = [":ibazel_e2e_test_module"],
    size = "small",
    args = ["--node_path=tools"],
    local = True,
)
