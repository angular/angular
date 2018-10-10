# Re-export of Bazel rules with repository-wide defaults

load("@build_bazel_rules_nodejs//:defs.bzl", _jasmine_node_test = "jasmine_node_test")

def jasmine_node_test(deps = [], **kwargs):
  local_deps = [
    # Workaround for: https://github.com/bazelbuild/rules_nodejs/issues/344
    "@npm//:jasmine",
    "@npm//:source-map-support",
  ] + deps

  _jasmine_node_test(
    deps = local_deps,
    **kwargs
  )
