load("@aspect_bazel_lib//lib:copy_to_bin.bzl", _copy_to_bin = "copy_to_bin")
load("@aspect_bazel_lib//lib:copy_to_directory.bzl", _copy_to_directory = "copy_to_directory")
load("@aspect_rules_esbuild//esbuild:defs.bzl", _esbuild = "esbuild")
load("@devinfra//bazel/private:path_relative_to_label.bzl", _path_relative_to_label = "path_relative_to_label")
load(
    "//tools:defaults2.bzl",
    _jasmine_test = "jasmine_test",
    _js_binary = "js_binary",
    _js_library = "js_library",
    _js_run_binary = "js_run_binary",
    _ng_package = "ng_package",
    _ng_project = "ng_project",
    _sass_binary = "sass_binary",
    _sass_library = "sass_library",
    _ts_config = "ts_config",
    _ts_project = "ts_project",
    _zoneless_jasmine_test = "zoneless_jasmine_test",
    _zoneless_web_test_suite = "zoneless_web_test_suite",
)

ts_config = _ts_config
ng_package = _ng_package
jasmine_test = _jasmine_test
sass_binary = _sass_binary
sass_library = _sass_library
copy_to_bin = _copy_to_bin
copy_to_directory = _copy_to_directory
esbuild = _esbuild
js_binary = _js_binary
js_library = _js_library
js_run_binary = _js_run_binary
path_relative_to_label = _path_relative_to_label
zoneless_jasmine_test = _zoneless_jasmine_test

def ts_project(name, tsconfig = None, testonly = False, enable_runtime_rnjs_interop = False, **kwargs):
    if tsconfig == None:
        if native.package_name().startswith("adev/shared-docs"):
            tsconfig = "//adev/shared-docs:tsconfig_test" if testonly else "//adev/shared-docs:tsconfig_build"

    _ts_project(
        name = name,
        enable_runtime_rnjs_interop = enable_runtime_rnjs_interop,
        tsconfig = tsconfig,
        testonly = testonly,
        **kwargs
    )

def ng_project(name, tsconfig = None, testonly = False, enable_runtime_rnjs_interop = False, **kwargs):
    if tsconfig == None:
        if native.package_name().startswith("adev/shared-docs"):
            tsconfig = "//adev/shared-docs:tsconfig_test" if testonly else "//adev/shared-docs:tsconfig_build"

    _ng_project(
        name = name,
        enable_runtime_rnjs_interop = enable_runtime_rnjs_interop,
        tsconfig = tsconfig,
        testonly = testonly,
        **kwargs
    )

def zoneless_web_test_suite(deps = [], **kwargs):
    # Provide required modules for the imports in //tools/testing/browser_tests.init.mts
    deps = deps + [
        "//:node_modules/@angular/compiler",
        "//:node_modules/@angular/core",
        "//:node_modules/@angular/platform-browser",
    ]
    _zoneless_web_test_suite(
        deps = deps,
        tsconfig = "//adev/shared-docs:tsconfig_test",
        **kwargs
    )
