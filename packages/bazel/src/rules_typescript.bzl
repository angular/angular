"""Allows different paths for these imports in google3.
"""

load("@build_bazel_rules_typescript//internal:build_defs.bzl",
    _tsc_wrapped_tsconfig = "tsc_wrapped_tsconfig",
)

load("@build_bazel_rules_typescript//internal:common/compilation.bzl",
    _COMMON_ATTRIBUTES = "COMMON_ATTRIBUTES",
    _COMMON_OUTPUTS = "COMMON_OUTPUTS",
    _compile_ts = "compile_ts",
    _DEPS_ASPECTS = "DEPS_ASPECTS",
    _ts_providers_dict_to_struct = "ts_providers_dict_to_struct",
)

load("@build_bazel_rules_typescript//internal:common/json_marshal.bzl",
    _json_marshal = "json_marshal",
)

tsc_wrapped_tsconfig = _tsc_wrapped_tsconfig
COMMON_ATTRIBUTES = _COMMON_ATTRIBUTES
COMMON_OUTPUTS = _COMMON_OUTPUTS
compile_ts = _compile_ts
DEPS_ASPECTS = _DEPS_ASPECTS
ts_providers_dict_to_struct = _ts_providers_dict_to_struct
json_marshal = _json_marshal
