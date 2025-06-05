load("@aspect_rules_jasmine//jasmine:defs.bzl", _jasmine_test = "jasmine_test")

def jasmine_test(name, data = [], setup_node_bootstrap = False, **kwargs):
    # Create relative path to root, from current package dir. Necessary as
    # we change the `chdir` below to the package directory.
    relative_to_root = "/".join([".."] * len(native.package_name().split("/")))

    extra_data = []
    fixed_args = []

    if setup_node_bootstrap:
        extra_data.append("//tools/testing:node_rjs")
        fixed_args.append("--require=%s/tools/testing/node_tests.init.mjs" % relative_to_root)

    _jasmine_test(
        name = name,
        node_modules = "//:node_modules",
        chdir = native.package_name(),
        fixed_args = [
            "--require=%s/node_modules/source-map-support/register.js" % relative_to_root,
            # Escape so that the `js_binary` launcher triggers Bash expansion.
            "'**/*+(.|_)spec.js'",
            "'**/*+(.|_)spec.mjs'",
            "'**/*+(.|_)spec.cjs'",
        ] + fixed_args,
        data = extra_data + data + [
            "//packages:package_json",
            "//packages:tsconfig_build",
            "//tools/bazel/node_loader",
            "//:node_modules/source-map-support",
        ],
        node_options = ["--import", "%s/tools/bazel/node_loader/index.mjs" % relative_to_root],
        **kwargs
    )
