load("@aspect_rules_js//js:defs.bzl", "js_run_binary")
load("@build_bazel_rules_nodejs//:index.bzl", "generated_file_test")
load("//tools/bazel:js_binary.bzl", "js_binary")

def partial_compliance_golden(filePath):
    """Creates the generate and testing targets for partial compile results.
    """

    # Remove the "TEST_CASES.json" substring from the end of the provided path.
    path = filePath[:-len("/TEST_CASES.json")]
    generate_partial_name = "partial_%s" % path
    data = [
        "//packages/compiler-cli/test/compliance/partial:generate_golden_partial_lib_rjs",
        "//packages/core:npm_package",
        "//packages:package_json",
        filePath,
    ] + native.glob(["%s/*.ts" % path, "%s/**/*.html" % path, "%s/**/*.css" % path])

    js_binary(
        name = generate_partial_name,
        testonly = True,
        data = data,
        visibility = [":__pkg__"],
        entry_point = "//packages/compiler-cli/test/compliance/partial:cli.js",
        fixed_args = ["$(rootpath %s)" % filePath],
    )

    js_run_binary(
        name = "_generated_%s" % path,
        tool = generate_partial_name,
        testonly = True,
        outs = ["%s/_generated.js" % path],
        # Relativize execpath to be relative to bazel-bin (bazel-out/k8-fastbuild/bin).
        args = ["../../../$(@)"],
        visibility = [":__pkg__"],
        mnemonic = "GeneratePartialGolden",
        progress_message = "Generating partial golden: %{label}",
    )

    generated_file_test(
        visibility = ["//visibility:public"],
        name = "%s.golden" % path,
        src = "//packages/compiler-cli/test/compliance/test_cases:%s/GOLDEN_PARTIAL.js" % path,
        generated = "_generated_%s" % path,
    )
