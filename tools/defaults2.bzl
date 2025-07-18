load("@aspect_rules_js//js:defs.bzl", _js_binary = "js_binary", _js_test = "js_test")
load("@aspect_rules_js//npm:defs.bzl", _npm_package = "npm_package")
load("@aspect_rules_ts//ts:defs.bzl", _ts_config = "ts_config")
load("@devinfra//bazel/http-server:index.bzl", _http_server = "http_server")
load("@rules_angular//src/ng_project:index.bzl", _ng_project = "ng_project")
load("@rules_sass//src:index.bzl", _npm_sass_library = "npm_sass_library", _sass_binary = "sass_binary", _sass_library = "sass_library")
load("//tools/bazel:api_golden_test.bzl", _api_golden_test = "api_golden_test", _api_golden_test_npm_package = "api_golden_test_npm_package")
load("//tools/bazel:esbuild.bzl", _esbuild_checked_in = "esbuild_checked_in")
load("//tools/bazel:jasmine_test.bzl", _angular_jasmine_test = "angular_jasmine_test", _jasmine_test = "jasmine_test", _zone_compatible_jasmine_test = "zone_compatible_jasmine_test", _zoneless_jasmine_test = "zoneless_jasmine_test")
load("//tools/bazel:module_name.bzl", "compute_module_name")
load("//tools/bazel:ng_package.bzl", _ng_package = "ng_package")
load("//tools/bazel:protractor_test.bzl", _protractor_web_test_suite = "protractor_web_test_suite")
load("//tools/bazel:ts_project_interop.bzl", _ts_project = "ts_project")
load("//tools/bazel:web_test.bzl", _ng_web_test_suite = "ng_web_test_suite", _zoneless_web_test_suite = "zoneless_web_test_suite")

js_binary = _js_binary
js_test = _js_test
npm_package = _npm_package
ts_config = _ts_config
ng_package = _ng_package
jasmine_test = _jasmine_test
angular_jasmine_test = _angular_jasmine_test
zone_compatible_jasmine_test = _zone_compatible_jasmine_test
zoneless_jasmine_test = _zoneless_jasmine_test
ng_web_test_suite = _ng_web_test_suite
zoneless_web_test_suite = _zoneless_web_test_suite
sass_binary = _sass_binary
sass_library = _sass_library
npm_sass_library = _npm_sass_library
protractor_web_test_suite = _protractor_web_test_suite
esbuild_checked_in = _esbuild_checked_in
http_server = _http_server
api_golden_test = _api_golden_test
api_golden_test_npm_package = _api_golden_test_npm_package

def _determine_tsconfig(testonly):
    if native.package_name().startswith("packages/compiler-cli"):
        return "//packages/compiler-cli:tsconfig_test" if testonly else "//packages/compiler-cli:tsconfig_build"

    if native.package_name().startswith("packages/service-worker"):
        return "//packages:tsconfig_test" if testonly else "//packages/service-worker:tsconfig_build"

    if native.package_name().startswith("packages/core/schematics"):
        return "//packages/core/schematics:tsconfig_test" if testonly else "//packages/core/schematics:tsconfig_build"

    if native.package_name().startswith("packages/core"):
        return "//packages/core:tsconfig_test" if testonly else "//packages/core:tsconfig_build"

    if native.package_name().startswith("packages/benchpress"):
        return "//packages:tsconfig_test" if testonly else "//packages/benchpress:tsconfig_build"

    if native.package_name().startswith("packages/language-service"):
        return "//packages:tsconfig_test" if testonly else "//packages/language-service:tsconfig_build"

    if native.package_name().startswith("packages/localize/tools"):
        return "//packages:tsconfig_test" if testonly else "//packages/localize/tools:tsconfig_build"

    if native.package_name().startswith("packages/common/locales/generate-locales-tool"):
        return "//packages:tsconfig_test" if testonly else "//packages/common/locales/generate-locales-tool:tsconfig_build"

    if native.package_name().startswith("packages/examples"):
        return "//packages/examples:tsconfig_test" if testonly else "//packages/examples:tsconfig_build"

    if native.package_name().startswith("packages/zone.js"):
        return "//packages/zone.js:tsconfig_test" if testonly else "//packages/zone.js:tsconfig_build"

    if native.package_name().startswith("packages"):
        return "//packages:tsconfig_test" if testonly else "//packages:tsconfig_build"

    if native.package_name().startswith("tools"):
        return "//tools:tsconfig_test" if testonly else "//tools:tsconfig_build"

    fail("Failing... a tsconfig value must be provided.")

def ts_project(
        name,
        source_map = True,
        testonly = False,
        tsconfig = None,
        **kwargs):
    module_name = kwargs.pop("module_name", compute_module_name(testonly))

    if tsconfig == None:
        tsconfig = _determine_tsconfig(testonly)

    _ts_project(
        name,
        source_map = source_map,
        module_name = module_name,
        testonly = testonly,
        tsconfig = tsconfig,
        **kwargs
    )

def ng_project(
        name,
        source_map = True,
        testonly = False,
        tsconfig = None,
        **kwargs):
    module_name = kwargs.pop("module_name", compute_module_name(testonly))

    if tsconfig == None:
        tsconfig = _determine_tsconfig(testonly)

    _ts_project(
        name,
        source_map = source_map,
        module_name = module_name,
        rule_impl = _ng_project,
        testonly = testonly,
        tsconfig = tsconfig,
        **kwargs
    )
