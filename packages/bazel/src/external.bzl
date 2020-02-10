"""Allows different paths for these imports in google3.
"""

load(
    "@npm_bazel_typescript//internal:build_defs.bzl",
    _tsc_wrapped_tsconfig = "tsc_wrapped_tsconfig",
)
load(
    "@npm_bazel_typescript//internal:common/compilation.bzl",
    _COMMON_ATTRIBUTES = "COMMON_ATTRIBUTES",
    _COMMON_OUTPUTS = "COMMON_OUTPUTS",
    _DEPS_ASPECTS = "DEPS_ASPECTS",
    _compile_ts = "compile_ts",
    _ts_providers_dict_to_struct = "ts_providers_dict_to_struct",
)
load(
    "@npm_bazel_typescript//internal:ts_config.bzl",
    _TsConfigInfo = "TsConfigInfo",
)
load(
    "@build_bazel_rules_nodejs//:providers.bzl",
    _NpmPackageInfo = "NpmPackageInfo",
    _js_ecma_script_module_info = "js_ecma_script_module_info",
    _js_named_module_info = "js_named_module_info",
    _node_modules_aspect = "node_modules_aspect",
)

NpmPackageInfo = _NpmPackageInfo
node_modules_aspect = _node_modules_aspect

tsc_wrapped_tsconfig = _tsc_wrapped_tsconfig
COMMON_ATTRIBUTES = _COMMON_ATTRIBUTES
COMMON_OUTPUTS = _COMMON_OUTPUTS
compile_ts = _compile_ts
DEPS_ASPECTS = _DEPS_ASPECTS
ts_providers_dict_to_struct = _ts_providers_dict_to_struct

DEFAULT_API_EXTRACTOR = "@npm//@angular/bazel/bin:api-extractor"
DEFAULT_NG_COMPILER = "@npm//@angular/bazel/bin:ngc-wrapped"
DEFAULT_NG_XI18N = "@npm//@angular/bazel/bin:xi18n"
FLAT_DTS_FILE_SUFFIX = ".bundle.d.ts"
TsConfigInfo = _TsConfigInfo
js_ecma_script_module_info = _js_ecma_script_module_info
js_named_module_info = _js_named_module_info
