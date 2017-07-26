# Allows different paths for these imports in google3
load("@build_bazel_rules_typescript//internal:build_defs.bzl", "tsc_wrapped_tsconfig")

load("@build_bazel_rules_typescript//internal:common/compilation.bzl",
    "COMMON_ATTRIBUTES",
    "COMMON_OUTPUTS",
    "compile_ts",
    "DEPS_ASPECTS",
    "ts_providers_dict_to_struct",
)

load("@build_bazel_rules_typescript//internal:common/json_marshal.bzl", "json_marshal")
