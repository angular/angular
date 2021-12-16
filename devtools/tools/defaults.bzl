# Re-export of Bazel rules with repository-wide defaults

load("@npm//@bazel/concatjs:index.bzl", _karma_web_test = "karma_web_test", _karma_web_test_suite = "karma_web_test_suite")
load("@npm//@angular/dev-infra-private/bazel:extract_js_module_output.bzl", "extract_js_module_output")
load("//devtools/tools/esbuild:index.bzl", "LINKER_PROCESSED_FW_PACKAGES")
load("@build_bazel_rules_nodejs//:index.bzl", "js_library")
load("@npm//@angular/dev-infra-private/bazel/spec-bundling:spec-entrypoint.bzl", "spec_entrypoint")
load("@npm//@angular/dev-infra-private/bazel/esbuild:index.bzl", "esbuild_amd", _esbuild = "esbuild", _esbuild_config = "esbuild_config")

esbuild = _esbuild
esbuild_config = _esbuild_config

def _spec_bundle(
        name,
        deps,
        platform,
        run_angular_linker = False,
        # We cannot use `ES2017` or higher as that would result in `async/await` not being downleveled.
        # ZoneJS needs to be able to intercept these as otherwise change detection would not work properly.
        target = "es2016",
        workspace_name = None,
        **kwargs):
    """
      Macro that will bundle all test files, with their respective transitive dependencies,
      into a single bundle file that can be loaded within Karma or NodeJS directly. Test files
      are bundled as Angular framework packages do not ship UMD files and to avoid overall
      complexity with maintaining a runtime loader such as RequireJS or SystemJS.
    """

    is_browser_test = platform == "browser"
    package_name = native.package_name()

    spec_entrypoint(
        name = "%s_spec_entrypoint" % name,
        deps = deps,
        testonly = True,
    )

    if is_browser_test and not workspace_name:
        fail("The spec-bundling target %s is declared as browser test. In order to be able " +
             "to construct an AMD module name, the `workspace_name` attribute needs to be set.")

    # Browser tests (Karma) need named AMD modules to load.
    # TODO(devversion): consider updating `@bazel/concatjs` to support loading JS files directly.
    esbuild_rule = esbuild_amd if is_browser_test else esbuild
    amd_name = "%s/%s/%s" % (workspace_name, package_name, name + "_spec") if is_browser_test else None

    esbuild_rule(
        name = "%s_bundle" % name,
        testonly = True,
        config = "//devtools/tools/esbuild:esbuild_config_spec",
        entry_point = ":%s_spec_entrypoint" % name,
        module_name = amd_name,
        output = "%s_spec.js" % name,
        target = target,
        platform = platform,
        deps = deps + [":%s_spec_entrypoint" % name],
        link_workspace_root = True,
        **kwargs
    )

    js_library(
        name = name,
        testonly = True,
        named_module_srcs = [":%s_bundle" % name],
    )

def karma_web_test_suite(name, **kwargs):
    web_test_args = {}
    test_deps = kwargs.get("deps", [])

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
            "@npm//@angular/dev-infra-private/bazel/browsers/chromium:chromium",

            # todo(aleksanderbodurri): enable when firefox support is done
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
        config_file = "//devtools/tools:bazel-karma-local-config.js",
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
        bootstrap = [
            "@npm//:node_modules/tslib/tslib.js",
        ],
        **kwargs
    )

def spec_bundle(name, deps, **kwargs):
    extract_js_module_output(
        name = "%s_prodmode_deps" % name,
        deps = deps,
        provider = "JSEcmaScriptModuleInfo",
        forward_linker_mappings = True,
        include_external_npm_packages = True,
        include_default_files = False,
        include_declarations = True,
        testonly = True,
    )

    _spec_bundle(
        name = name,
        deps = ["%s_prodmode_deps" % name] + LINKER_PROCESSED_FW_PACKAGES,
        workspace_name = "angular",
        run_angular_linker = True,
        **kwargs
    )
