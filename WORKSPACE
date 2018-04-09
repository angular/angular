workspace(name = "angular_material")

# Add nodejs rules
http_archive(
  name = "build_bazel_rules_nodejs",
  url = "https://github.com/bazelbuild/rules_nodejs/archive/99166f8eb7fc628ca561acf9f9a51a1c26edadad.zip",
  strip_prefix = "rules_nodejs-99166f8eb7fc628ca561acf9f9a51a1c26edadad",
  sha256 = "338e8495e5d1fa16de7190106c5675372ff4a347f6004e203e84a168db96281e",
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
  url = "https://github.com/bazelbuild/rules_typescript/archive/0.11.1.zip",
  strip_prefix = "rules_typescript-0.11.1",
  sha256 = "7406bea7954e1c906f075115dfa176551a881119f6820b126ea1eacb09f34a1a",
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
