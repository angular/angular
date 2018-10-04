workspace(name = "angular_material")

# Add NodeJS rules (explicitly used for sass bundle rules)
http_archive(
  name = "build_bazel_rules_nodejs",
  url = "https://github.com/bazelbuild/rules_nodejs/archive/0.14.2.zip",
  strip_prefix = "rules_nodejs-0.14.2",
  sha256 = "af481421c9e74f754a693a8bf5e9409484e38cf7be6f73f85879bdc7ed1b1d82",
)

# Add TypeScript rules
http_archive(
  name = "build_bazel_rules_typescript",
  url = "https://github.com/bazelbuild/rules_typescript/archive/0.19.1.zip",
  strip_prefix = "rules_typescript-0.19.1",
  sha256 = "91a03623a03a463ffd62cea3f7a384c2f298af6438d5d153fc4d69aa5665b53d",
)

# Fetch transient dependencies of the TypeScript bazel rules.
load("@build_bazel_rules_typescript//:package.bzl", "rules_typescript_dependencies")
rules_typescript_dependencies()

# Add sass rules
http_archive(
  name = "io_bazel_rules_sass",
  url = "https://github.com/bazelbuild/rules_sass/archive/1.13.4.zip",
  strip_prefix = "rules_sass-1.13.4",
  sha256 = "5ddde0d3df96978fa537f76e766538c031dee4d29f91a895f4b1345b5e3f9b16",
)

load("@io_bazel_rules_sass//sass:sass_repositories.bzl", "sass_repositories")
sass_repositories()

# NOTE: this rule installs nodejs, npm, and yarn, but does NOT install
# your npm dependencies. You must still run the package manager.
load("@build_bazel_rules_nodejs//:defs.bzl", "node_repositories", "npm_install")
node_repositories()

# Use Bazel managed node modules. See more below: 
# https://github.com/bazelbuild/rules_nodejs#bazel-managed-vs-self-managed-dependencies
npm_install(
  name = "npm",
  package_json = "//:package.json",
  package_lock_json = "//:package-lock.json",
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
