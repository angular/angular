workspace(name = "angular_material")

load("@bazel_tools//tools/build_defs/repo:http.bzl", "http_archive")

# Add NodeJS rules (explicitly used for sass bundle rules)
http_archive(
  name = "build_bazel_rules_nodejs",
  url = "https://github.com/bazelbuild/rules_nodejs/archive/0.16.3.zip",
  strip_prefix = "rules_nodejs-0.16.3",
)

# Add TypeScript rules
http_archive(
  name = "build_bazel_rules_typescript",
  url = "https://github.com/bazelbuild/rules_typescript/archive/0.21.0.zip",
  strip_prefix = "rules_typescript-0.21.0",
)

# Add Angular source and Bazel rules.
http_archive(
  name = "angular",
  url = "https://github.com/angular/angular/archive/7.1.2.zip",
  strip_prefix = "angular-7.1.2",
)

# Add RxJS as repository because those are needed in order to build Angular from source.
# Also we cannot refer to the RxJS version from the node modules because self-managed
# node modules are not guaranteed to be installed.
# TODO(gmagolan): remove this once rxjs ships with an named UMD bundle and we
# are no longer building it from source.
http_archive(
  name = "rxjs",
  url = "https://registry.yarnpkg.com/rxjs/-/rxjs-6.3.3.tgz",
  strip_prefix = "package/src",
  sha256 = "72b0b4e517f43358f554c125e40e39f67688cd2738a8998b4a266981ed32f403",
)

# We need to create a local repository called "npm" because currently Angular Material
# stores all of it's NPM dependencies in the "@matdeps" repository. This is necessary because
# we don't want to reserve the "npm" repository that is commonly used by downstream projects.
# Since we still need the "npm" repository in order to use the Angular or TypeScript Bazel
# rules, we create a local repository that is just defined in **this** workspace and is not
# being shipped to downstream projects. This can be removed once downstream projects can
# consume Angular Material completely from NPM.
# TODO(devversion): remove once Angular Material can be consumed from NPM with Bazel.
local_repository(
  name = "npm",
  path = "tools/npm-workspace"
)

# Add sass rules
http_archive(
  name = "io_bazel_rules_sass",
  url = "https://github.com/bazelbuild/rules_sass/archive/1.15.2.zip",
  strip_prefix = "rules_sass-1.15.2",
)

# Since we are explitly fetching @build_bazel_rules_typescript, we should explicitly ask for
# its transitive dependencies in case those haven't been fetched yet.
load("@build_bazel_rules_typescript//:package.bzl", "rules_typescript_dependencies")
rules_typescript_dependencies()

# Since we are explitly fetching @build_bazel_rules_nodejs, we should explicitly ask for
# its transitive dependencies in case those haven't been fetched yet.
load("@build_bazel_rules_nodejs//:package.bzl", "rules_nodejs_dependencies")
rules_nodejs_dependencies()

# Fetch transitive dependencies which are needed by the Angular build targets.
load("@angular//packages/bazel:package.bzl", "rules_angular_dependencies")
rules_angular_dependencies()

# Fetch transitive dependencies which are needed to use the Sass rules.
load("@io_bazel_rules_sass//:package.bzl", "rules_sass_dependencies")
rules_sass_dependencies()

load("@build_bazel_rules_nodejs//:defs.bzl", "check_bazel_version", "node_repositories")

# The minimum bazel version to use with this repo is 0.18.0
check_bazel_version("0.18.0")

node_repositories(
  # For deterministic builds, specify explicit NodeJS and Yarn versions.
  node_version = "10.10.0",
  # Use latest yarn version to support integrity field (added in yarn 1.10)
  yarn_version = "1.12.1",
)

# Setup TypeScript Bazel workspace
load("@build_bazel_rules_typescript//:defs.bzl", "ts_setup_workspace")
ts_setup_workspace()

# Setup the Sass rule repositories.
load("@io_bazel_rules_sass//:defs.bzl", "sass_repositories")
sass_repositories()

# Setup Angular workspace for building (Bazel managed node modules)
load("@angular//:index.bzl", "ng_setup_workspace")
ng_setup_workspace()

load("@angular_material//:index.bzl", "angular_material_setup_workspace")
angular_material_setup_workspace()

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
