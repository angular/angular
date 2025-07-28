"""
    Extension of native `js_binary` to install a NodeJS resolution hook
    that will help with automatically adding missing ESM extension and
    mapping `@angular/<..>` to the local first-party package directory.
"""

load("@aspect_rules_js//js:defs.bzl", _js_binary = "js_binary", _js_run_binary = "js_run_binary", _js_test = "js_test")

js_run_binary = _js_run_binary

def js_binary(name, data = [], **kwargs):
    _js_binary(
        name = name,
        data = data + ["//tools/bazel/node_loader", "//packages:tsconfig_build"],
        node_options = ["--import", "$$JS_BINARY__RUNFILES/$(rlocationpath //tools/bazel/node_loader)"],
        **kwargs
    )

def js_test(name, data = [], **kwargs):
    _js_test(
        name = name,
        data = data + ["//tools/bazel/node_loader", "//packages:tsconfig_build"],
        node_options = ["--import", "$$JS_BINARY__RUNFILES/$(rlocationpath //tools/bazel/node_loader)"],
        **kwargs
    )
