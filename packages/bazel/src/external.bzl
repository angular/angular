"""Allows different paths for these imports in google3.
"""

load(
    # Replaced with "//@bazel/concatjs/internal:..." in published package
    "@npm//@bazel/concatjs/internal:build_defs.bzl",
    _tsc_wrapped_tsconfig = "tsc_wrapped_tsconfig",
)
load(
    # Replaced with "//@bazel/concatjs/internal:..." in published package
    "@npm//@bazel/concatjs/internal:common/compilation.bzl",
    _COMMON_ATTRIBUTES = "COMMON_ATTRIBUTES",
    _COMMON_OUTPUTS = "COMMON_OUTPUTS",
    _DEPS_ASPECTS = "DEPS_ASPECTS",
    _compile_ts = "compile_ts",
    _ts_providers_dict_to_struct = "ts_providers_dict_to_struct",
)
load(
    # Replaced with "//@bazel/concatjs/internal:..." in published package
    "@npm//@bazel/concatjs/internal:ts_config.bzl",
    _TsConfigInfo = "TsConfigInfo",
)
load(
    "@build_bazel_rules_nodejs//:providers.bzl",
    _LinkablePackageInfo = "LinkablePackageInfo",
    _NpmPackageInfo = "NpmPackageInfo",
    _js_ecma_script_module_info = "js_ecma_script_module_info",
    _js_named_module_info = "js_named_module_info",
    _node_modules_aspect = "node_modules_aspect",
)
load(
    "@rules_nodejs//nodejs:providers.bzl",
    _js_module_info = "js_module_info",
)

LinkablePackageInfo = _LinkablePackageInfo
NpmPackageInfo = _NpmPackageInfo
node_modules_aspect = _node_modules_aspect

tsc_wrapped_tsconfig = _tsc_wrapped_tsconfig
COMMON_ATTRIBUTES = _COMMON_ATTRIBUTES
COMMON_OUTPUTS = _COMMON_OUTPUTS
compile_ts = _compile_ts
DEPS_ASPECTS = _DEPS_ASPECTS
ts_providers_dict_to_struct = _ts_providers_dict_to_struct

# Should be defined as `BuildSettingInfo` from Skylib, but a dependency on
# Skylib is not necessary here because this is only used in google3 where Skylib
# is loaded differently anyways where this file is overridden.
BuildSettingInfo = provider(doc = "Not used outside google3.")

DEFAULT_API_EXTRACTOR = (
    # BEGIN-DEV-ONLY
    "@npm" +
    # END-DEV-ONLY
    "//@angular/bazel/bin:api-extractor"
)
DEFAULT_NG_COMPILER = (
    # BEGIN-DEV-ONLY
    "@npm" +
    # END-DEV-ONLY
    "//@angular/bazel/bin:ngc-wrapped"
)
DEFAULT_NG_XI18N = (
    # BEGIN-DEV-ONLY
    "@npm" +
    # END-DEV-ONLY
    "//@angular/bazel/bin:xi18n"
)
FLAT_DTS_FILE_SUFFIX = ".bundle.d.ts"
TsConfigInfo = _TsConfigInfo

js_ecma_script_module_info = _js_ecma_script_module_info
js_module_info = _js_module_info
js_named_module_info = _js_named_module_info
