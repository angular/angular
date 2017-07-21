load("@bazel_tools//tools/build_defs/repo:git.bzl", "git_repository")

git_repository(
   name = "build_bazel_rules_typescript",
   remote = "https://github.com/bazelbuild/rules_typescript.git",
   tag = "0.0.5",
)

load("@build_bazel_rules_typescript//:defs.bzl", "node_repositories")

node_repositories(package_json = "//:package.json")

git_repository(
    name = "build_bazel_rules_angular",
    remote = "https://github.com/bazelbuild/rules_angular.git",
    tag = "0.0.1",
)