# Re-export of Bazel rules with devtools-wide defaults

load("@npm//@angular/dev-infra-private/bazel/spec-bundling:index.bzl", "spec_bundle")
load("@npm//@angular/dev-infra-private/bazel/karma:index.bzl", _karma_web_test_suite = "karma_web_test_suite")
load("@npm//@angular/dev-infra-private/bazel:extract_js_module_output.bzl", "extract_js_module_output")

def karma_web_test_suite(name, **kwargs):
    test_deps = kwargs.get("deps", [])
    kwargs["deps"] = ["%s_bundle" % name]

    # TODO(ESM): Remove this when devmode & prodmode are combined.
    extract_js_module_output(
        name = "%s_prodmode_deps" % name,
        deps = test_deps,
        provider = "JSEcmaScriptModuleInfo",
        forward_linker_mappings = True,
        include_external_npm_packages = True,
        include_default_files = False,
        include_declarations = True,
        testonly = True,
    )

    spec_bundle(
        name = "%s_bundle" % name,
        deps = ["%s_prodmode_deps" % name],
        platform = "browser",
        run_angular_linker = True,
        # We consume the Angular framework packages directly from source. The
        # placeholders might not be substituted and still use `0.0.0-PLACEHOLDER`.
        linker_unknown_declaration_handling = "ignore",
        workspace_name = "angular",
    )

    # Set up default browsers if no explicit `browsers` have been specified.
    if not hasattr(kwargs, "browsers"):
        kwargs["tags"] = ["native"] + kwargs.get("tags", [])
        kwargs["browsers"] = [
            "@npm//@angular/dev-infra-private/bazel/browsers/chromium:chromium",

            # todo(aleksanderbodurri): enable when firefox support is done
            # "@npm//@angular/dev-infra-private/bazel/browsers/firefox:firefox",
        ]

    # Default test suite with all configured browsers.
    _karma_web_test_suite(
        name = name,
        bootstrap = [
            "@npm//:node_modules/tslib/tslib.js",
        ],
        **kwargs
    )
