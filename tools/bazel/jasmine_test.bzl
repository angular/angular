load("@aspect_rules_jasmine//jasmine:defs.bzl", _jasmine_test = "jasmine_test")

def angular_jasmine_test(name, data = [], fixed_args = [], **kwargs):
    jasmine_test(
        name = name,
        data = data + ["//tools/testing:node_rjs"],
        fixed_args = fixed_args + ["--require={root}/tools/testing/node_tests.init.mjs"],
        **kwargs
    )

def jasmine_test(name, data = [], fixed_args = [], **kwargs):
    # Create relative path to root, from current package dir. Necessary as
    # we change the `chdir` below to the package directory.
    relative_to_root = "/".join([".."] * len(native.package_name().split("/")))

    all_fixed_args = [
        "--require={root}/node_modules/source-map-support/register.js",
        # Escape so that the `js_binary` launcher triggers Bash expansion.
        "'**/*+(.|_)spec.js'",
        "'**/*+(.|_)spec.mjs'",
        "'**/*+(.|_)spec.cjs'",
    ] + fixed_args

    all_fixed_args = [arg.format(root = relative_to_root) for arg in all_fixed_args]

    _jasmine_test(
        name = name,
        node_modules = "//:node_modules",
        chdir = native.package_name(),
        fixed_args = all_fixed_args,
        data = data + [
            "//packages:package_json",
            "//packages:tsconfig_build",
            "//tools/bazel/node_loader",
            "//:node_modules/source-map-support",
        ],
        node_options = ["--import", "%s/tools/bazel/node_loader/index.mjs" % relative_to_root],
        **kwargs
    )
