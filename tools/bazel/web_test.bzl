load("@devinfra//bazel/spec-bundling:index_rjs.bzl", "spec_bundle")
load("@rules_browsers//src/wtr:index.bzl", "wtr_test")

def _web_test(name, tags = [], deps = [], bootstrap = [], **kwargs):
    spec_bundle(
        name = "%s_bundle" % name,
        testonly = True,
        srcs = ["//packages:tsconfig_build"],
        bootstrap = bootstrap,
        deps = deps,
        tags = [
            "manual",
        ],
        config = {
            "resolveExtensions": [".js", ".mjs"],
            "tsconfig": "./packages/tsconfig-build.json",
        },
        platform = "browser",
        external = kwargs.pop("external", []),
    )

    wtr_test(
        name = name,
        deps = [":%s_bundle" % name] + kwargs.pop("data", []),
        tags = tags,
        **kwargs
    )

def ng_web_test_suite(deps = [], bootstrap = [], **kwargs):
    _web_test(
        deps = deps,
        bootstrap = [
            "//tools/testing:browser_rjs",
        ] + bootstrap,
        **kwargs
    )

def zoneless_web_test_suite(deps = [], bootstrap = [], **kwargs):
    _web_test(
        deps = deps,
        bootstrap = [
            "//tools/testing:browser_zoneless_rjs",
        ] + bootstrap,
        **kwargs
    )
