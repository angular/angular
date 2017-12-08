workspace(name = "angular_src")

load("@bazel_tools//tools/build_defs/repo:git.bzl", "git_repository")

git_repository(
    name = "build_bazel_rules_nodejs",
    remote = "https://github.com/bazelbuild/rules_nodejs.git",
    tag = "0.3.1",
)

load("@build_bazel_rules_nodejs//:defs.bzl", "check_bazel_version", "node_repositories")

check_bazel_version("0.8.1")
node_repositories(package_json = ["//:package.json"])

git_repository(
    name = "build_bazel_rules_typescript",
    remote = "https://github.com/bazelbuild/rules_typescript.git",
    tag = "0.6.0",
)

load("@build_bazel_rules_typescript//:defs.bzl", "ts_repositories")

ts_repositories()

local_repository(
    name = "angular",
    path = "packages/bazel",
)

local_repository(
    name = "rxjs",
    path = "node_modules/rxjs/src",
)
