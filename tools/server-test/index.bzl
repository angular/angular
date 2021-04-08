load("@build_bazel_rules_nodejs//:index.bzl", "nodejs_test")

"""
  Runs a given test together with the specified server. The server executable is expected
  to support a `--port` command line flag. The chosen available port is then set as environment
  variable so that the test environment can connect to the server. Use `TEST_SERVER_PORT`.
"""

def server_test(server, test, **kwargs):
    nodejs_test(
        data = [server, test, "//tools/server-test:test_runner_lib"],
        args = ["$(rootpath %s)" % server, "$(rootpath %s)" % test],
        entry_point = "//tools/server-test:test-runner.ts",
        # TODO(josephperrott): update dependency usages to no longer need bazel patch module resolver
        # See: https://github.com/bazelbuild/rules_nodejs/wiki#--bazel_patch_module_resolver-now-defaults-to-false-2324
        templated_args = ["--bazel_patch_module_resolver"],
        **kwargs
    )
