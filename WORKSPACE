workspace(name = "angular_material")

load("@bazel_tools//tools/build_defs/repo:http.bzl", "http_archive")

# Add NodeJS rules (explicitly used for sass bundle rules)
http_archive(
  name = "build_bazel_rules_nodejs",
  sha256 = "5c86b055c57e15bf32d9009a15bcd6d8e190c41b1ff2fb18037b75e0012e4e7c",
  urls = ["https://github.com/bazelbuild/rules_nodejs/releases/download/0.26.0/rules_nodejs-0.26.0.tar.gz"],
)

# Add sass rules
http_archive(
  name = "io_bazel_rules_sass",
  sha256 = "f71709f4c2d39e81c9b452e00f22e554b26d7beacaedc5b85d61f771fd01268d",
  url = "https://github.com/bazelbuild/rules_sass/archive/1.16.1.zip",
  strip_prefix = "rules_sass-1.16.1",
)

load("@build_bazel_rules_nodejs//:defs.bzl", "check_bazel_version", "node_repositories", "yarn_install")

# The minimum bazel version to use with this repo is 0.18.0
check_bazel_version("0.18.0")

node_repositories(
  # For deterministic builds, specify explicit NodeJS and Yarn versions.
  node_version = "10.13.0",
  # Use latest yarn version to support integrity field (added in yarn 1.10)
  yarn_version = "1.12.1",
)

yarn_install(
  name = "npm",
  package_json = "//:package.json",
  # Ensure that the script is available when running `postinstall` in the Bazel sandbox.
  data = [
    "//:tools/npm/check-npm.js",
    "//:angular-tsconfig.json",
  ],
  yarn_lock = "//:yarn.lock",
)

# Install all bazel dependencies of the @ngdeps npm packages
load("@npm//:install_bazel_dependencies.bzl", "install_bazel_dependencies")
install_bazel_dependencies()

# Setup TypeScript Bazel workspace
load("@npm_bazel_typescript//:defs.bzl", "ts_setup_workspace")
ts_setup_workspace()

# Fetch transitive dependencies which are needed to use the karma rules.
load("@npm_bazel_karma//:package.bzl", "rules_karma_dependencies")
rules_karma_dependencies()

# Fetch transitive dependencies which are needed to use the Sass rules.
load("@io_bazel_rules_sass//:package.bzl", "rules_sass_dependencies")
rules_sass_dependencies()

# Setup the Sass rule repositories.
load("@io_bazel_rules_sass//:defs.bzl", "sass_repositories")
sass_repositories()

# Setup web testing. We need to setup a browser because the web testing rules for TypeScript need
# a reference to a registered browser (ideally that's a hermetic version of a browser)
load("@io_bazel_rules_webtesting//web:repositories.bzl", "web_test_repositories")
web_test_repositories()

load("@npm_bazel_karma//:browser_repositories.bzl", "browser_repositories")
browser_repositories()

# Temporarily add Angular sources and its dependencies to consume the ts_api_guardian,
# remote-build-execution, and protractor stuff.
# TODO(jelbourn): remove this once we can do all the same stuff via @npm//@angular
http_archive(
  name = "angular",
  sha256 = "a542f00adf5cafbcad24268d69da8e4746c22619699f29c3b3b0259d0ce52974",
  url = "https://github.com/angular/angular/archive/8.0.0-beta.6.zip",
  strip_prefix = "angular-8.0.0-beta.6",
)
load("@angular//packages/bazel:package.bzl", "rules_angular_dependencies")
rules_angular_dependencies()
load("@angular//:index.bzl", "ng_setup_workspace")
ng_setup_workspace()


# Bring in bazel_toolchains for RBE stuff.
http_archive(
  name = "bazel_toolchains",
  sha256 = "109a99384f9d08f9e75136d218ebaebc68cc810c56897aea2224c57932052d30",
  strip_prefix = "bazel-toolchains-94d31935a2c94fe7e7c7379a0f3393e181928ff7",
  urls = [
      "https://mirror.bazel.build/github.com/bazelbuild/bazel-toolchains/archive/94d31935a2c94fe7e7c7379a0f3393e181928ff7.tar.gz",
      "https://github.com/bazelbuild/bazel-toolchains/archive/94d31935a2c94fe7e7c7379a0f3393e181928ff7.tar.gz",
  ]
)
