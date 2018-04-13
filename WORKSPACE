workspace(name = "angular_material")

# Add nodejs rules
http_archive(
  name = "build_bazel_rules_nodejs",
  url = "https://github.com/bazelbuild/rules_nodejs/archive/1931156c232a08356dfda02e9c8b0275c2e63c00.zip",
  strip_prefix = "rules_nodejs-1931156c232a08356dfda02e9c8b0275c2e63c00",
  sha256 = "9cfe33276a6ac0076ee9ee159c4a2576f9851c0f437435b5ac19b2e592493078",
)

# NOTE: this rule installs nodejs, npm, and yarn, but does NOT install
# your npm dependencies. You must still run the package manager.
load("@build_bazel_rules_nodejs//:defs.bzl", "check_bazel_version", "node_repositories")

check_bazel_version("0.9.0")
node_repositories(package_json = ["//:package.json"])

# Add sass rules
git_repository(
  name = "io_bazel_rules_sass",
  remote = "https://github.com/bazelbuild/rules_sass.git",
  tag = "0.0.3",
)

load("@io_bazel_rules_sass//sass:sass.bzl", "sass_repositories")
sass_repositories()

# Add TypeScript rules
http_archive(
  name = "build_bazel_rules_typescript",
  url = "https://github.com/bazelbuild/rules_typescript/archive/0.12.1.zip",
  strip_prefix = "rules_typescript-0.12.1",
  sha256 = "24e2c36f60508c6d270ae4265b89b381e3f66d550e70c367ed3755ad8d7ce3b0",
)

# Setup TypeScript Bazel workspace
load("@build_bazel_rules_typescript//:defs.bzl", "ts_setup_workspace")
ts_setup_workspace()

# Add Angular rules
local_repository(
  name = "angular",
  path = "node_modules/@angular/bazel",
)

# Add rxjs
local_repository(
  name = "rxjs",
  path = "node_modules/rxjs/src",
)
