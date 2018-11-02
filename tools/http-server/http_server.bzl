"""Simple Bazel wrapper around npm http-server package.

See https://www.npmjs.com/package/http-server
"""

load("@build_bazel_rules_nodejs//:defs.bzl", "nodejs_binary")

def http_server(templated_args = [], **kwargs):
    # By default, we pass an argument pointing the http server to the
    # package of the caller.
    # This assumes there is an index.html in the package directory.
    if not templated_args:
        templated_args = [native.package_name()]

    nodejs_binary(
        node_modules = "@http-server_runtime_deps//:node_modules",
        entry_point = "http-server/bin/http-server",
        templated_args = templated_args,
        **kwargs
    )
