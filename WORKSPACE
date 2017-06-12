load("@bazel_tools//tools/build_defs/repo:git.bzl", "git_repository")

git_repository(
    name = "io_bazel_rules_typescript",
    remote = "https://github.com/bazelbuild/rules_typescript.git",
    commit = "804c5da",
)

load("@io_bazel_rules_typescript//:defs.bzl", "node_repositories", "npm_install")

node_repositories()
npm_install(package_json = "//:package.json")
