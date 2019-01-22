"""Re-export of some bazel rules with repository-wide defaults."""

load("@build_bazel_rules_nodejs//:defs.bzl", _jasmine_node_test = "jasmine_node_test", _nodejs_binary = "nodejs_binary", _npm_package = "npm_package")
load("@build_bazel_rules_typescript//:defs.bzl", _ts_library = "ts_library", _ts_web_test_suite = "ts_web_test_suite")
load("//packages/bazel:index.bzl", _ng_module = "ng_module", _ng_package = "ng_package")
load("//packages/bazel/src:ng_rollup_bundle.bzl", _ng_rollup_bundle = "ng_rollup_bundle")

_DEFAULT_TSCONFIG_BUILD = "//packages:tsconfig-build.json"
_DEFAULT_TSCONFIG_TEST = "//packages:tsconfig-test.json"
_DEFAULT_TS_TYPINGS = "@ngdeps//typescript:typescript__typings"
_DEFAULT_KARMA_BIN = "@ngdeps//@bazel/karma/bin:karma"
_INTERNAL_NG_MODULE_COMPILER = "//packages/bazel/src/ngc-wrapped"
_INTERNAL_NG_MODULE_XI18N = "//packages/bazel/src/ngc-wrapped:xi18n"
_INTERNAL_NG_PACKAGER_PACKAGER = "//packages/bazel/src/ng_package:packager"

# Packages which are versioned together on npm
ANGULAR_SCOPED_PACKAGES = ["@angular/%s" % p for p in [
    # core should be the first package because it's the main package in the group
    # this is significant for Angular CLI and "ng update" specifically, @angular/core
    # is considered the identifier of the group by these tools.
    "core",
    "bazel",
    "common",
    "compiler",
    "compiler-cli",
    "animations",
    "elements",
    "platform-browser",
    "platform-browser-dynamic",
    "forms",
    "http",
    "platform-server",
    "platform-webworker",
    "platform-webworker-dynamic",
    "upgrade",
    "router",
    "language-service",
    "service-worker",
]]

PKG_GROUP_REPLACEMENTS = {
    "\"NG_UPDATE_PACKAGE_GROUP\"": """[
      %s
    ]""" % ",\n      ".join(["\"%s\"" % s for s in ANGULAR_SCOPED_PACKAGES]),
}

def _default_module_name(testonly):
    """ Provide better defaults for package names.

    e.g. rather than angular/packages/core/testing we want @angular/core/testing

    TODO(alexeagle): we ought to supply a default module name for every library in the repo.
    But we short-circuit below in cases that are currently not working.
    """
    pkg = native.package_name()

    if testonly:
        # Some tests currently rely on the long-form package names
        return None

    if pkg.startswith("packages/bazel"):
        # Avoid infinite recursion in the ViewEngine compiler. Error looks like:
        #  Compiling Angular templates (ngc) //packages/bazel/test/ngc-wrapped/empty:empty failed (Exit 1)
        # : RangeError: Maximum call stack size exceeded
        #    at normalizeString (path.js:57:25)
        #    at Object.normalize (path.js:1132:12)
        #    at Object.join (path.js:1167:18)
        #    at resolveModule (execroot/angular/bazel-out/host/bin/packages/bazel/src/ngc-wrapped/ngc-wrapped.runfiles/angular/packages/compiler-cli/src/metadata/bundler.js:582:50)
        #    at MetadataBundler.exportAll (execroot/angular/bazel-out/host/bin/packages/bazel/src/ngc-wrapped/ngc-wrapped.runfiles/angular/packages/compiler-cli/src/metadata/bundler.js:119:42)
        #    at MetadataBundler.exportAll (execroot/angular/bazel-out/host/bin/packages/bazel/src/ngc-wrapped/ngc-wrapped.runfiles/angular/packages/compiler-cli/src/metadata/bundler.js:121:52)
        return None

    if pkg.startswith("packages/"):
        return "@angular/" + pkg[len("packages/"):]

    return None

def ts_library(tsconfig = None, testonly = False, deps = [], module_name = None, **kwargs):
    """Default values for ts_library"""
    deps = deps + ["@ngdeps//tslib"]
    if testonly:
        # Match the types[] in //packages:tsconfig-test.json
        deps.append("@ngdeps//@types/jasmine")
        deps.append("@ngdeps//@types/node")
    if not tsconfig:
        if testonly:
            tsconfig = _DEFAULT_TSCONFIG_TEST
        else:
            tsconfig = _DEFAULT_TSCONFIG_BUILD

    if not module_name:
        module_name = _default_module_name(testonly)

    _ts_library(
        tsconfig = tsconfig,
        testonly = testonly,
        deps = deps,
        node_modules = _DEFAULT_TS_TYPINGS,
        module_name = module_name,
        **kwargs
    )

def ng_module(name, tsconfig = None, entry_point = None, testonly = False, deps = [], module_name = None, **kwargs):
    """Default values for ng_module"""
    deps = deps + ["@ngdeps//tslib"]
    if testonly:
        # Match the types[] in //packages:tsconfig-test.json
        deps.append("@ngdeps//@types/jasmine")
        deps.append("@ngdeps//@types/node")
    if not tsconfig:
        if testonly:
            tsconfig = _DEFAULT_TSCONFIG_TEST
        else:
            tsconfig = _DEFAULT_TSCONFIG_BUILD
    if not module_name:
        module_name = _default_module_name(testonly)
    if not entry_point:
        entry_point = "public_api.ts"
    _ng_module(
        name = name,
        flat_module_out_file = name,
        tsconfig = tsconfig,
        entry_point = entry_point,
        testonly = testonly,
        deps = deps,
        compiler = _INTERNAL_NG_MODULE_COMPILER,
        ng_xi18n = _INTERNAL_NG_MODULE_XI18N,
        node_modules = _DEFAULT_TS_TYPINGS,
        module_name = module_name,
        **kwargs
    )

def ng_package(name, readme_md = None, license_banner = None, deps = [], **kwargs):
    """Default values for ng_package"""
    if not readme_md:
        readme_md = "//packages:README.md"
    if not license_banner:
        license_banner = "//packages:license-banner.txt"
    deps = deps + [
        "@ngdeps//tslib",
    ]

    _ng_package(
        name = name,
        deps = deps,
        readme_md = readme_md,
        license_banner = license_banner,
        replacements = PKG_GROUP_REPLACEMENTS,
        ng_packager = _INTERNAL_NG_PACKAGER_PACKAGER,
        **kwargs
    )

def npm_package(name, replacements = {}, **kwargs):
    """Default values for npm_package"""
    _npm_package(
        name = name,
        replacements = dict(replacements, **PKG_GROUP_REPLACEMENTS),
        **kwargs
    )

def ts_web_test_suite(bootstrap = [], deps = [], runtime_deps = [], **kwargs):
    """Default values for ts_web_test_suite"""
    if not bootstrap:
        bootstrap = ["//:web_test_bootstrap_scripts"]
    local_deps = [
        "@ngdeps//node_modules/tslib:tslib.js",
    ] + deps
    local_runtime_deps = [
        "//tools/testing:browser",
    ] + runtime_deps

    _ts_web_test_suite(
        runtime_deps = local_runtime_deps,
        bootstrap = bootstrap,
        deps = local_deps,
        karma = _DEFAULT_KARMA_BIN,
        # Run unit tests on local Chromium by default.
        # You can exclude tests based on tags, e.g. to skip Firefox testing,
        #   `yarn bazel test --test_tag_filters=-browser:firefox-local [targets]`
        browsers = [
            "@io_bazel_rules_webtesting//browsers:chromium-local",
            # Don't test on local Firefox by default, for faster builds.
            # We think that bugs in Angular tend to be caught the same in any
            # evergreen browser.
            # "@io_bazel_rules_webtesting//browsers:firefox-local",
            # TODO(alexeagle): add remote browsers on SauceLabs
        ],
        **kwargs
    )

def nodejs_binary(data = [], **kwargs):
    """Default values for nodejs_binary"""
    _nodejs_binary(
        # Pass-thru --define=compile=foo as an environment variable
        configuration_env_vars = ["compile"],
        data = data + ["@ngdeps//source-map-support"],
        **kwargs
    )

def jasmine_node_test(deps = [], **kwargs):
    """Default values for jasmine_node_test"""
    deps = deps + [
        # Very common dependencies for tests
        "@ngdeps//chokidar",
        "@ngdeps//domino",
        "@ngdeps//jasmine",
        "@ngdeps//jasmine-core",
        "@ngdeps//mock-fs",
        "@ngdeps//reflect-metadata",
        "@ngdeps//source-map-support",
        "@ngdeps//tslib",
        "@ngdeps//xhr2",
    ]
    _jasmine_node_test(
        deps = deps,
        # Pass-thru --define=compile=foo as an environment variable
        configuration_env_vars = ["compile"],
        **kwargs
    )

def ng_rollup_bundle(deps = [], **kwargs):
    """Default values for ng_rollup_bundle"""
    deps = deps + [
        "@ngdeps//tslib",
        "@ngdeps//reflect-metadata",
    ]
    _ng_rollup_bundle(
        deps = deps,
        **kwargs
    )
