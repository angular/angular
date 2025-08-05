load("@devinfra//bazel/spec-bundling:index_rjs.bzl", "spec_bundle")
load("@rules_browsers//src/wtr:index.bzl", "wtr_test")

def web_test(name, tags = [], deps = [], bootstrap = [], tsconfig = "//packages:tsconfig_build", **kwargs):
    spec_bundle(
        name = "%s_bundle" % name,
        testonly = True,
        srcs = [tsconfig],
        tsconfig = tsconfig,
        bootstrap = bootstrap,
        deps = deps,
        tags = [
            "manual",
        ],
        config = {
            "resolveExtensions": [".js", ".mjs"],
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
    web_test(
        deps = deps,
        bootstrap = [
            "//tools/testing:browser",
        ] + bootstrap,
        **kwargs
    )

def zoneless_web_test_suite(deps = [], bootstrap = [], **kwargs):
    web_test(
        deps = deps,
        bootstrap = [
            "//tools/testing:browser_zoneless",
        ] + bootstrap,
        **kwargs
    )
