# Re-export of Bazel rules with repository-wide defaults

load("@npm//@bazel/concatjs:index.bzl", _karma_web_test = "karma_web_test", _karma_web_test_suite = "karma_web_test_suite")
load("//tools/spec-bundling:index.bzl", "spec_bundle")

def karma_web_test_suite(name, **kwargs):
    web_test_args = {}
    test_deps = kwargs.get("deps", [])

    kwargs["tags"] = ["partial-compilation-integration"] + kwargs.get("tags", [])
    kwargs["deps"] = ["%s_bundle" % name]

    spec_bundle(
        name = "%s_bundle" % name,
        deps = test_deps,
        platform = "browser",
    )

    # Set up default browsers if no explicit `browsers` have been specified.
    if not hasattr(kwargs, "browsers"):
        kwargs["tags"] = ["native"] + kwargs.get("tags", [])
        kwargs["browsers"] = [
            # Note: when changing the browser names here, also update the "yarn test"
            # script to reflect the new browser names.
            "@npm//@angular/dev-infra-private/bazel/browsers/chromium:chromium",
            # "@npm//@angular/dev-infra-private/bazel/browsers/firefox:firefox",
        ]

    for opt_name in kwargs.keys():
        # Filter out options which are specific to "karma_web_test" targets. We cannot
        # pass options like "browsers" to the local web test target.
        if not opt_name in ["wrapped_test_tags", "browsers", "wrapped_test_tags", "tags"]:
            web_test_args[opt_name] = kwargs[opt_name]

    # Custom standalone web test that can be run to test against any browser
    # that is manually connected to.
    _karma_web_test(
        name = "%s_local_bin" % name,
        config_file = "//test:bazel-karma-local-config.js",
        tags = ["manual"],
        **web_test_args
    )

    # Workaround for: https://github.com/bazelbuild/rules_nodejs/issues/1429
    native.sh_test(
        name = "%s_local" % name,
        srcs = ["%s_local_bin" % name],
        tags = ["manual", "local", "ibazel_notify_changes"],
        testonly = True,
    )

    # Default test suite with all configured browsers.
    _karma_web_test_suite(
        name = name,
        **kwargs
    )
