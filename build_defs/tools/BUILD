package(default_visibility=["//visibility:public"])

load("//build_defs:nodejs.bzl", "nodejs_binary")

nodejs_binary(
    name = "serve_runfiles",
    srcs = ["serve_runfiles.js"],
    deps = [
        "//:gulp-connect",
        "//:cors",
    ],
    entry_point = "serve_runfiles.js",
)

nodejs_binary(
    name = "merge_tsconfig",
    srcs = ["merge_tsconfig.js"],
    deps = ["//:typescript"],
    entry_point = "merge_tsconfig.js",
)

sh_binary(
    name = "uglifyjs_wrapped",
    srcs = ["uglifyjs_wrapped.sh"],
    data = ["//:uglifyjs_bin"],
)

nodejs_binary(
    name = "flatten_sourcemap",
    srcs = ["flatten_sourcemap.js"],
    data = ["//:source-map", "//:tsc_bin"],
    entry_point = "flatten_sourcemap.js",
)
