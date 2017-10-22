workspace(name = "angular_src")

load("@bazel_tools//tools/build_defs/repo:git.bzl", "git_repository")

git_repository(
    name = "build_bazel_rules_nodejs",
    remote = "https://github.com/bazelbuild/rules_nodejs.git",
    # TODO(alexeagle): use the correct tag here.
    commit = "2c6243df53fd33fdab283ebdd01582e4eb815db8",
)

load("@build_bazel_rules_nodejs//:defs.bzl", "node_repositories")

node_repositories(package_json = ["//:package.json"])

local_repository(
    name = "build_bazel_rules_typescript",
    path = "node_modules/@bazel/typescript",
)

local_repository(
    name = "angular",
    path = "packages/bazel",
)
