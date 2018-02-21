"""Re-export of some bazel rules with repository-wide defaults."""
load("@build_bazel_rules_typescript//:defs.bzl", _ts_library = "ts_library")
load("//packages/bazel:index.bzl", _ng_module = "ng_module")

DEFAULT_TSCONFIG = "//packages:tsconfig-build.json"

def ts_library(tsconfig = None, **kwargs):
  if not tsconfig:
    tsconfig = DEFAULT_TSCONFIG
  _ts_library(tsconfig = tsconfig, **kwargs)

def ng_module(name, tsconfig = None, **kwargs):
  if not tsconfig:
    tsconfig = DEFAULT_TSCONFIG
  _ng_module(name = name, tsconfig = tsconfig, **kwargs)
