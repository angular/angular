load("@build_bazel_rules_nodejs//:index.bzl", "generated_file_test")
load("//tools:defaults.bzl", "nodejs_binary", "npm_package_bin")

def partial_compliance_golden(filePath):
    """Creates the generate and testing targets for partial compile results.
    """

    # Remove the "TEST_CASES.json" substring from the end of the provided path.
    path = filePath[:-len("/TEST_CASES.json")]
    generate_partial_name = "partial_%s" % path
    data = [
        "//packages/compiler-cli/test/compliance/partial:generate_golden_partial_lib",
        "//packages/core:npm_package",
        "//packages:package_json",
        filePath,
    ] + native.glob(["%s/*.ts" % path, "%s/**/*.html" % path, "%s/**/*.css" % path])

    nodejs_binary(
        name = generate_partial_name,
        testonly = True,
        data = data,
        visibility = [":__pkg__"],
        entry_point = "//packages/compiler-cli/test/compliance/partial:cli.ts",
        templated_args = ["$(execpath %s)" % filePath],
    )

    nodejs_binary(
        name = generate_partial_name + ".debug",
        testonly = True,
        data = data,
        visibility = [":__pkg__"],
        entry_point = "//packages/compiler-cli/test/compliance/partial:cli.ts",
        templated_args = ["--node_options=--inspect-brk", filePath],
    )

    npm_package_bin(
        name = "_generated_%s" % path,
        tool = generate_partial_name,
        testonly = True,
        outs = ["%s/_generated.js" % path],
        link_workspace_root = True,
        # Disable the linker and rely on patched resolution which works better on Windows
        # and is less prone to race conditions when targets build concurrently.
        args = ["--nobazel_run_linker", "$@"],
        visibility = [":__pkg__"],
        # TODO(devversion): re-enable when we figure out the RBE hanging process issue.
        tags = ["no-remote-exec"],
        data = [],
    )

    generated_file_test(
        visibility = ["//visibility:public"],
        name = "%s.golden" % path,
        src = "//packages/compiler-cli/test/compliance/test_cases:%s/GOLDEN_PARTIAL.js" % path,
        # TODO(devversion): re-enable when we figure out the RBE hanging process issue.
        tags = ["no-remote-exec"],
        generated = "_generated_%s" % path,
    )
