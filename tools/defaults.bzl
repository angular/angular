# Re-export of Bazel rules with repository-wide defaults

load("@angular//:index.bzl", _ng_module = "ng_module")
load("@build_bazel_rules_nodejs//:defs.bzl", _jasmine_node_test = "jasmine_node_test")
load("@build_bazel_rules_typescript//:defs.bzl", _ts_library = "ts_library")

def ts_library(deps = [], **kwargs):
  ts_library(**kwargs)

def ng_module(deps = [], **kwargs):
  local_deps = [
    # Since we use the TypeScript import helpers (tslib) for each TypeScript configuration,
    # we declare TSLib as default dependency
    "@npm//tslib",
  ] + deps

  _ng_module(
    deps = local_deps,
    **kwargs
  )

def jasmine_node_test(deps = [], **kwargs):
  local_deps = [
    # Workaround for: https://github.com/bazelbuild/rules_nodejs/issues/344
    "@npm//jasmine",
    "@npm//source-map-support",
  ] + deps

  _jasmine_node_test(
    deps = local_deps,
    **kwargs
  )
