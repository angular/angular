load("@devinfra//bazel/ts_project:index.bzl", "strict_deps_test")
load("@rules_angular//src/ts_project:index.bzl", _ts_project = "ts_project")

def ts_project(
        name,
        deps = [],
        srcs = [],
        tsconfig = None,
        testonly = False,
        visibility = None,
        rule_impl = _ts_project,
        **kwargs):
    rule_impl(
        name = name,
        testonly = testonly,
        declaration = True,
        tsconfig = tsconfig,
        visibility = visibility,
        srcs = srcs,
        deps = deps,
        **kwargs
    )

    strict_deps_test(
        name = "%s_strict_deps_test" % name,
        srcs = srcs,
        tsconfig = tsconfig,
        deps = deps,
    )
