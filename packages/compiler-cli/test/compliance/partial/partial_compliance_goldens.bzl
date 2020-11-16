load("@build_bazel_rules_nodejs//:index.bzl", "generated_file_test", "nodejs_binary", "npm_package_bin")

def partial_compliance_golden(filePath):
    """Creates the generate and testing targets for partial compile results.
    """

    # Remove the "TEST_CASES.json" substring from the end of the provided path.
    path = filePath[:-len("/TEST_CASES.json")]

    nodejs_binary(
        name = "_generate_%s" % path,
        testonly = True,
        data = [
            "//packages/compiler-cli/test/compliance/partial:generate_golden_partial_lib",
            "//packages/compiler-cli/test/compliance/test_cases",
            "//packages/compiler-cli/test/ngtsc/fake_core:npm_package",
        ],
        visibility = [":__pkg__"],
        entry_point = "//packages/compiler-cli/test/compliance/partial:cli.ts",
        templated_args = [
            # "--node_options=--inspect-brk",
            filePath,
        ],
    )

    npm_package_bin(
        name = "_generated_%s" % path,
        tool = "_generate_%s" % path,
        testonly = True,
        stdout = "%s/this_file_should_not_be_committed" % path,
        link_workspace_root = True,
        tags = [
            # TODO(josephperrott): Begin running these tests on windows after updating to rules_nodejs 3.0
            "no-windows",
        ],
        visibility = [":__pkg__"],
        data = [
            "//packages/compiler-cli/test/compliance/partial:generate_golden_partial_lib",
            "//packages/compiler-cli/test/compliance/test_cases",
            "//packages/compiler-cli/test/ngtsc/fake_core:npm_package",
        ],
    )

    generated_file_test(
        visibility = ["//visibility:public"],
        tags = [
            "ivy-only",
            # TODO(josephperrott): Begin running these tests on windows after updating to rules_nodejs 3.0
            "no-windows",
        ],
        name = "%s.golden" % path,
        src = "//packages/compiler-cli/test/compliance/test_cases:%s/GOLDEN_PARTIAL.js" % path,
        generated = "_generated_%s" % path,
    )
