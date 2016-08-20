package(default_visibility=["//visibility:public"])

load("//build_defs:nodejs.bzl", "nodejs_binary")

nodejs_binary(
    name = "merge_tsconfig",
    srcs = ["merge_tsconfig.js"],
    deps = ["//:typescript"],
    entry_point = "merge_tsconfig.js",
)
