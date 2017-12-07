workspace(name = "angular_material_src")

# Add nodejs rules
git_repository(
  name = "build_bazel_rules_nodejs",
  remote = "https://github.com/bazelbuild/rules_nodejs.git",
  commit = "0.3.1",
)

# NOTE: this rule installs nodejs, npm, and yarn, but does NOT install
# your npm dependencies. You must still run the package manager.
load("@build_bazel_rules_nodejs//:defs.bzl", "node_repositories")
node_repositories(package_json = ["//:package.json"])

# Add sass rules
git_repository(
  name = "io_bazel_rules_sass",
  remote = "https://github.com/bazelbuild/rules_sass.git",
  tag = "0.0.2",
)

load("@io_bazel_rules_sass//sass:sass.bzl", "sass_repositories")
sass_repositories()

# Add TypeScript rules
git_repository(
  name = "build_bazel_rules_typescript",
  remote = "https://github.com/bazelbuild/rules_typescript.git",
  tag = "0.6.0",
)

load("@build_bazel_rules_typescript//:defs.bzl", "ts_repositories")
ts_repositories()

# Add Angular rules
local_repository(
  name = "angular",
  path = "node_modules/@angular/bazel",
)

local_repository(
  name = "rxjs",
  path = "node_modules/rxjs/src",
)
