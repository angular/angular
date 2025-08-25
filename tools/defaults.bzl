load("@aspect_bazel_lib//lib:copy_to_bin.bzl", _copy_to_bin = "copy_to_bin")
load("@aspect_rules_js//js:defs.bzl", _js_library = "js_library")
load("@aspect_rules_ts//ts:defs.bzl", _ts_config = "ts_config")
load("@devinfra//bazel:extract_types.bzl", _extract_types = "extract_types")
load("@devinfra//bazel/http-server:index.bzl", _http_server = "http_server")
load("@rules_angular//src/ng_project:index.bzl", _ng_project = "ng_project")
load("@rules_sass//src:index.bzl", _npm_sass_library = "npm_sass_library", _sass_binary = "sass_binary", _sass_library = "sass_library")
load("//adev/shared-docs/pipeline/api-gen:generate_api_docs.bzl", _generate_api_docs = "generate_api_docs")
load("//tools/bazel:api_golden_test.bzl", _api_golden_test = "api_golden_test", _api_golden_test_npm_package = "api_golden_test_npm_package")
load("//tools/bazel:esbuild.bzl", _esbuild = "esbuild", _esbuild_checked_in = "esbuild_checked_in")
load("//tools/bazel:jasmine_test.bzl", _angular_jasmine_test = "angular_jasmine_test", _jasmine_test = "jasmine_test", _zone_compatible_jasmine_test = "zone_compatible_jasmine_test", _zoneless_jasmine_test = "zoneless_jasmine_test")
load("//tools/bazel:js_defs.bzl", _js_binary = "js_binary", _js_run_binary = "js_run_binary", _js_test = "js_test")
load("//tools/bazel:npm_packages.bzl", _ng_package = "ng_package", _npm_package = "npm_package")
load("//tools/bazel:protractor_test.bzl", _protractor_web_test_suite = "protractor_web_test_suite")
load("//tools/bazel:ts_project_interop.bzl", _ts_project = "ts_project")
load("//tools/bazel:tsec.bzl", _tsec_test = "tsec_test")
load("//tools/bazel:web_test.bzl", _ng_web_test_suite = "ng_web_test_suite", _web_test = "web_test", _zoneless_web_test_suite = "zoneless_web_test_suite")
load("//tools/bazel/esbuild:zone_bundle.bzl", _zone_bundle = "zone_bundle")

extract_types = _extract_types
esbuild = _esbuild
zone_bundle = _zone_bundle
js_binary = _js_binary
js_run_binary = _js_run_binary
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
web_test = _web_test
sass_binary = _sass_binary
sass_library = _sass_library
npm_sass_library = _npm_sass_library
protractor_web_test_suite = _protractor_web_test_suite
esbuild_checked_in = _esbuild_checked_in
http_server = _http_server
api_golden_test = _api_golden_test
api_golden_test_npm_package = _api_golden_test_npm_package
copy_to_bin = _copy_to_bin
tsec_test = _tsec_test
js_library = _js_library

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
    if tsconfig == None:
        tsconfig = _determine_tsconfig(testonly)

    _ts_project(
        name,
        source_map = source_map,
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
    if tsconfig == None:
        tsconfig = _determine_tsconfig(testonly)

    _ts_project(
        name,
        source_map = source_map,
        rule_impl = _ng_project,
        testonly = testonly,
        tsconfig = tsconfig,
        **kwargs
    )

def generate_api_docs(**kwargs):
    _generate_api_docs(
        # We need to specify import mappings for Angular packages that import other Angular
        # packages.
        import_map = {
            # We only need to specify top-level entry-points, and only those that
            # are imported from other packages.
            "//packages/animations:index.ts": "@angular/animations",
            "//packages/common:index.ts": "@angular/common",
            "//packages/core:index.ts": "@angular/core",
            "//packages/forms:index.ts": "@angular/forms",
            "//packages/localize:index.ts": "@angular/localize",
            "//packages/platform-browser-dynamic:index.ts": "@angular/platform-browser-dynamic",
            "//packages/platform-browser:index.ts": "@angular/platform-browser",
            "//packages/platform-server:index.ts": "@angular/platform-server",
            "//packages/router:index.ts": "@angular/router",
            "//packages/upgrade:index.ts": "@angular/upgrade",
        },
        **kwargs
    )
