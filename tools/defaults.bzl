"""Re-export of some bazel rules with repository-wide defaults."""

load("@build_bazel_rules_nodejs//:defs.bzl", _npm_package = "npm_package")
load("@build_bazel_rules_typescript//:defs.bzl", _ts_library = "ts_library", _ts_web_test_suite = "ts_web_test_suite")
load("//packages/bazel:index.bzl", _ng_module = "ng_module", _ng_package = "ng_package")
load("//packages/bazel/src:ng_module.bzl", _internal_global_ng_module = "internal_global_ng_module")

DEFAULT_TSCONFIG_BUILD = "//packages:tsconfig-build.json"
DEFAULT_TSCONFIG_TEST = "//packages:tsconfig-test.json"
DEFAULT_NODE_MODULES = "@angular_deps//:node_modules"

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

def ts_library(tsconfig = None, node_modules = DEFAULT_NODE_MODULES, testonly = False, **kwargs):
    if not tsconfig:
        if testonly:
            tsconfig = DEFAULT_TSCONFIG_TEST
        else:
            tsconfig = DEFAULT_TSCONFIG_BUILD
    _ts_library(tsconfig = tsconfig, node_modules = node_modules, testonly = testonly, **kwargs)

def ng_module(name, tsconfig = None, entry_point = None, node_modules = DEFAULT_NODE_MODULES, testonly = False, **kwargs):
    if not tsconfig:
        if testonly:
            tsconfig = DEFAULT_TSCONFIG_TEST
        else:
            tsconfig = DEFAULT_TSCONFIG_BUILD
    if not entry_point:
        entry_point = "public_api.ts"
    _ng_module(name = name, flat_module_out_file = name, tsconfig = tsconfig, entry_point = entry_point, node_modules = node_modules, testonly = testonly, **kwargs)

# ivy_ng_module behaves like ng_module, and under --define=compile=legacy it runs ngc with global
# analysis but produces Ivy outputs. Under other compile modes, it behaves as ng_module.
# TODO(alxhub): remove when ngtsc supports the same use cases.
def ivy_ng_module(name, tsconfig = None, entry_point = None, testonly = False, **kwargs):
    if not tsconfig:
        if testonly:
            tsconfig = DEFAULT_TSCONFIG_TEST
        else:
            tsconfig = DEFAULT_TSCONFIG_BUILD
    if not entry_point:
        entry_point = "public_api.ts"
    _internal_global_ng_module(name = name, flat_module_out_file = name, tsconfig = tsconfig, entry_point = entry_point, testonly = testonly, **kwargs)

def ng_package(name, readme_md = None, license_banner = None, **kwargs):
    if not readme_md:
        readme_md = "//packages:README.md"
    if not license_banner:
        license_banner = "//packages:license-banner.txt"

    _ng_package(
        name = name,
        readme_md = readme_md,
        license_banner = license_banner,
        replacements = PKG_GROUP_REPLACEMENTS,
        **kwargs
    )

def npm_package(name, replacements = {}, **kwargs):
    _npm_package(
        name = name,
        replacements = dict(replacements, **PKG_GROUP_REPLACEMENTS),
        **kwargs
    )

def ts_web_test_suite(bootstrap = [], deps = [], **kwargs):
    if not bootstrap:
        bootstrap = ["//:web_test_bootstrap_scripts"]
    local_deps = [
        "@angular_deps//:node_modules/tslib/tslib.js",
        "//tools/testing:browser",
    ] + deps

    _ts_web_test_suite(
        bootstrap = bootstrap,
        deps = local_deps,
        # Run unit tests on local Chromium by default.
        # You can exclude tests based on tags, e.g. to skip Firefox testing,
        #   `bazel test --test_tag_filters=-browser:firefox-local [targets]`
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
