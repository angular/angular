workspace(name = "angular_material")

# Load NodeJS rules. Note that this is technically not needed because
# `rules_typescript_dependencies()` would also load the NodeJS rules, but we specifically need
# at least v0.14.1 which includes: https://github.com/bazelbuild/rules_nodejs/pull/341
http_archive(
  name = "build_bazel_rules_nodejs",
  url = "https://github.com/bazelbuild/rules_nodejs/archive/0.14.1.zip",
  strip_prefix = "rules_nodejs-0.14.1",
  sha256 = "813eb51733d3632f456f3bb581d940ed64e80dab417595c93bf5ad19079898e2"
)

# Add TypeScript rules
http_archive(
  name = "build_bazel_rules_typescript",
  url = "https://github.com/bazelbuild/rules_typescript/archive/0.18.0.zip",
  strip_prefix = "rules_typescript-0.18.0",
  sha256 = "4726e07a2f8d23b5e3af166f3b2a6e8aa75adad94b35ab4d959e8fe875f90272",
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
load("@build_bazel_rules_nodejs//:defs.bzl", "check_bazel_version", "node_repositories",
    "npm_install")

check_bazel_version("0.15.0")
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
