load("@devinfra//bazel/ts_project:index.bzl", "strict_deps_test")
load("@rules_angular//src/ts_project:index.bzl", _ts_project = "ts_project")

def ts_project(
        name,
        deps = [],
        tsconfig = None,
        testonly = False,
        visibility = None,
        # TODO: Enable this for all `ts_project` targets at end of migration.
        ignore_strict_deps = True,
        rule_impl = _ts_project,
        **kwargs):
    rule_impl(
        name = name,
        testonly = testonly,
        declaration = True,
        tsconfig = tsconfig,
        visibility = visibility,
        deps = deps,
        **kwargs
    )

    if not ignore_strict_deps:
        strict_deps_test(
            name = "%s_strict_deps_test" % name,
            srcs = kwargs.get("srcs", []),
            deps = deps,
        )
