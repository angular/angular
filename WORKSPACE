workspace(name = "angular_material")

# Add NodeJS rules (explicitly used for sass bundle rules)
http_archive(
  name = "build_bazel_rules_nodejs",
  url = "https://github.com/bazelbuild/rules_nodejs/archive/0.15.3.zip",
  strip_prefix = "rules_nodejs-0.15.3",
  sha256 = "05afbbc13b0b7d5056e412d66c98853978bd46a94bc8e7b71c7fba4349b77eef",
)

# Add TypeScript rules
http_archive(
  name = "build_bazel_rules_typescript",
  url = "https://github.com/bazelbuild/rules_typescript/archive/0.20.3.zip",
  strip_prefix = "rules_typescript-0.20.3",
  sha256 = "2a03b23c30c5109ab0863cfa60acce73ceb56337d41efc2dd67f8455a1c1d5f3",
)

# Fetch transient dependencies of the TypeScript bazel rules.
load("@build_bazel_rules_typescript//:package.bzl", "rules_typescript_dependencies")
rules_typescript_dependencies()

# Add sass rules
http_archive(
  name = "io_bazel_rules_sass",
  url = "https://github.com/bazelbuild/rules_sass/archive/1.14.1.zip",
  strip_prefix = "rules_sass-1.14.1",
  sha256 = "d8b89e47b05092a6eed3fa199f2de7cf671a4b9165d0bf38f12a0363dda928d3",
)

load("@io_bazel_rules_sass//sass:sass_repositories.bzl", "sass_repositories")
sass_repositories()

# Add Angular source and Bazel rules.
http_archive(
  name = "angular",
  # Locked to commit "07b89902d5178afefeedeb18d316f4a1c77c6025" that has been merged after v7.0.0
  # has been released. This explicitly used version of angular/angular includes the latest changes
  # to @angular/bazel that have been merged from the `bazel` branch into `master.`
  # TODO(devversion): start using release archives once 7.0.1 is available w/ the Bazel changes.
  url = "https://github.com/angular/angular/archive/07b89902d5178afefeedeb18d316f4a1c77c6025.zip",
  strip_prefix = "angular-07b89902d5178afefeedeb18d316f4a1c77c6025",
  sha256 = "6439dcd01afa5ef3456f9f454ba546a385f7fc56bbc8b6e4ec990dbd9773ba8f",
)

# Add RxJS as repository because those are needed in order to build Angular from source.
# Also we cannot refer to the RxJS version from the node modules because self-managed
# node modules are not guaranteed to be installed.
http_archive(
  name = "rxjs",
  url = "https://registry.yarnpkg.com/rxjs/-/rxjs-6.3.3.tgz",
  strip_prefix = "package/src",
  sha256 = "72b0b4e517f43358f554c125e40e39f67688cd2738a8998b4a266981ed32f403",
)

# NOTE: this rule installs nodejs, npm, and yarn, but does NOT install
# your npm dependencies. You must still run the package manager.
load("@build_bazel_rules_nodejs//:defs.bzl", "node_repositories", "yarn_install")

node_repositories(
  # For deterministic builds, specify explicit NodeJS and Yarn versions. Keep the Yarn version
  # in sync with the version of Travis.
  node_version = "10.10.0",
  yarn_version = "1.9.4",
)

# Use Bazel managed node modules. See more below: 
# https://github.com/bazelbuild/rules_nodejs#bazel-managed-vs-self-managed-dependencies
yarn_install(
  name = "npm",
  package_json = "//:package.json",
  yarn_lock = "//:yarn.lock",
)

# Setup TypeScript Bazel workspace
load("@build_bazel_rules_typescript//:defs.bzl", "ts_setup_workspace")
ts_setup_workspace()

# Setup Angular bazel rules
load("@angular//packages/bazel:package.bzl", "rules_angular_dependencies")
rules_angular_dependencies()

# Setup Angular workspace for building (Bazel managed node modules)
load("@angular//:index.bzl", "ng_setup_workspace")
ng_setup_workspace()

# Setup Go toolchain (required for Bazel web testing rules)
load("@io_bazel_rules_go//go:def.bzl", "go_rules_dependencies", "go_register_toolchains")
go_rules_dependencies()
go_register_toolchains()

# Setup web testing. We need to setup a browser because the web testing rules for TypeScript need
# a reference to a registered browser (ideally that's a hermetic version of a browser)
load("@io_bazel_rules_webtesting//web:repositories.bzl", "browser_repositories",
  "web_test_repositories")

web_test_repositories()
browser_repositories(
  chromium = True,
)
