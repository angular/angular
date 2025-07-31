# Re-export of Bazel rules with devtools-wide defaults

load("@aspect_bazel_lib//lib:copy_to_bin.bzl", _copy_to_bin = "copy_to_bin")
load("@aspect_bazel_lib//lib:copy_to_directory.bzl", _copy_to_directory = "copy_to_directory")
load("@aspect_rules_esbuild//esbuild:defs.bzl", _esbuild = "esbuild")
load("@aspect_rules_js//js:defs.bzl", _js_library = "js_library")
load("@bazel_skylib//rules:common_settings.bzl", _string_flag = "string_flag")
load("@build_bazel_rules_nodejs//:index.bzl", _pkg_web = "pkg_web")
load(
    "//tools:defaults2.bzl",
    _http_server = "http_server",
    _ng_project = "ng_project",
    _ng_web_test_suite = "ng_web_test_suite",
    _npm_sass_library = "npm_sass_library",
    _sass_binary = "sass_binary",
    _sass_library = "sass_library",
    _ts_config = "ts_config",
    _ts_project = "ts_project",
)

sass_binary = _sass_binary
sass_library = _sass_library
npm_sass_library = _npm_sass_library
http_server = _http_server
js_library = _js_library
esbuild = _esbuild
copy_to_bin = _copy_to_bin
copy_to_directory = _copy_to_directory
string_flag = _string_flag
pkg_web = _pkg_web
ts_config = _ts_config

def ng_web_test_suite(deps = [], **kwargs):
    # Provide required modules for the imports in //tools/testing/browser_tests.init.mts
    deps = deps + [
        "//:node_modules/@angular/compiler",
        "//:node_modules/@angular/core",
        "//:node_modules/@angular/platform-browser",
    ]
    _ng_web_test_suite(
        # TODO: Reenable firefox tests once spaces in file paths are not a problem
        firefox = False,
        deps = deps,
        tsconfig = "//devtools:tsconfig_test",
        **kwargs
    )

def ng_project(name, srcs = [], angular_assets = [], **kwargs):
    deps = kwargs.pop("deps", []) + [
        "//:node_modules/tslib",
    ]

    _ng_project(
        name = name,
        tsconfig = "//devtools:tsconfig_build",
        srcs = srcs,
        assets = angular_assets,
        deps = deps,
        **kwargs
    )

def ts_project(name, **kwargs):
    _ts_project(
        name = name,
        tsconfig = "//devtools:tsconfig_build",
        **kwargs
    )

def ts_test_library(name, deps = [], **kwargs):
    _ts_project(
        name = name,
        tsconfig = "//devtools:tsconfig_test",
        testonly = 1,
        deps = deps + [
            "//:node_modules/@types/jasmine",
        ],
        **kwargs
    )
