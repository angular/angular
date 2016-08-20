load("//build_defs:nodejs.bzl", "nodejs_module", "nodejs_test")

# nodejs_{binary,test} should be runnable.
nodejs_test(
    name = "do_nothing",
    srcs = ["do_nothing.js"],
    entry_point = "do_nothing.js",
    size = "small",
)

# nodejs_{binary,test} should support entrypoint inside a directory file.
nodejs_test(
    name = "inside_directory",
    srcs = ["dir"],
    entry_point = "dir/index.js",
    size = "small",
)

# nodejs_{binary,test} should support node_options.
nodejs_test(
    name = "node_options",
    srcs = ["node_options.js"],
    entry_point = "node_options.js",
    args = ["--node_options=--expose-gc"],
    size = "small",
)

# nodejs_module should be accessible from downstream dependencies.
nodejs_module(
    name = "foo-module",
    srcs = ["foo-module/index.js"],
)

nodejs_test(
    name = "use_relative",
    srcs = ["use_relative.js"],
    entry_point = "use_relative.js",
    size = "small",
)

# nodejs_{binary,test} should support node_path.
nodejs_test(
    name = "use_absolute",
    srcs = ["use_absolute.js"],
    deps = ["foo-module"],
    entry_point = "use_absolute.js",
    args = ["--node_path=build_defs/tests/nodejs"],
    size = "small",
)

test_suite(
    name = "all_tests",
)
