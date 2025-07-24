"""
    Extension of native `js_binary` to install a NodeJS resolution hook
    that will help with automatically adding missing ESM extension and
    mapping `@angular/<..>` to the local first-party package directory.
"""

load("@aspect_rules_js//js:defs.bzl", _js_binary = "js_binary")

def js_binary(name, chdir = None, data = [], **kwargs):
    if chdir != None:
        to_root = ["/".join([".."] * len(chdir.split("/")))]
    else:
        to_root = "./"

    _js_binary(
        name = name,
        data = data + ["//tools/bazel/node_loader", "//packages:tsconfig_build"],
        node_options = ["--import", "%s/tools/bazel/node_loader/index.mjs" % to_root],
        **kwargs
    )
