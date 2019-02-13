workspace(name = "angular")

load("@bazel_tools//tools/build_defs/repo:http.bzl", "http_archive")

# Uncomment for local bazel rules development
#local_repository(
#    name = "build_bazel_rules_nodejs",
#    path = "../rules_nodejs",
#)
#local_repository(
#    name = "build_bazel_rules_typescript",
#    path = "../rules_typescript",
#)

# Fetch rules_nodejs so we can install our npm dependencies
http_archive(
    name = "build_bazel_rules_nodejs",
    sha256 = "1416d03823fed624b49a0abbd9979f7c63bbedfd37890ddecedd2fe25cccebc6",
    urls = ["https://github.com/bazelbuild/rules_nodejs/releases/download/0.18.6/rules_nodejs-0.18.6.tar.gz"],
)

# Fetch the rxjs repository since we build rxjs from source
# TODO(gregmagolan): use rxjs bundles in the bazel build
http_archive(
    name = "rxjs",
    sha256 = "72b0b4e517f43358f554c125e40e39f67688cd2738a8998b4a266981ed32f403",
    strip_prefix = "package/src",
    url = "https://registry.yarnpkg.com/rxjs/-/rxjs-6.3.3.tgz",
)

# Use a mock @npm repository while we are building angular from source
# downstream. Angular will get its npm dependencies with in @ngdeps which
# is setup in ng_setup_workspace().
# TODO(gregmagolan): remove @ngdeps once angular is no longer build from source
#   downstream and have build use @npm for npm dependencies
local_repository(
    name = "npm",
    path = "tools/npm_workspace",
)

# Check the bazel version and download npm dependencies
load("@build_bazel_rules_nodejs//:defs.bzl", "check_bazel_version", "node_repositories")

# Bazel version must be at least v0.21.0 because:
#   - 0.21.0 Using --incompatible_strict_action_env flag fixes cache when running `yarn bazel`
#            (see https://github.com/angular/angular/issues/27514#issuecomment-451438271)
check_bazel_version("0.21.0", """
You no longer need to install Bazel on your machine.
Angular has a dependency on the @bazel/bazel package which supplies it.
Try running `yarn bazel` instead.
    (If you did run that, check that you've got a fresh `yarn install`)

""")

# Setup the Node.js toolchain
node_repositories(
    node_version = "10.9.0",
    package_json = ["//:package.json"],
    preserve_symlinks = True,
    yarn_version = "1.12.1",
)

# Setup the angular toolchain which installs npm dependencies into @ngdeps
load("//tools:ng_setup_workspace.bzl", "ng_setup_workspace")

ng_setup_workspace()

# Install all bazel dependencies of the @ngdeps npm packages
load("@ngdeps//:install_bazel_dependencies.bzl", "install_bazel_dependencies")

install_bazel_dependencies()

# Load angular dependencies
load("//packages/bazel:package.bzl", "rules_angular_dev_dependencies")

rules_angular_dev_dependencies()

# Load karma dependencies
load("@build_bazel_rules_karma//:package.bzl", "rules_karma_dependencies")

rules_karma_dependencies()

# Setup the rules_webtesting toolchain
load("@io_bazel_rules_webtesting//web:repositories.bzl", "web_test_repositories")

web_test_repositories()

# Temporary work-around for https://github.com/angular/angular/issues/28681
# TODO(gregmagolan): go back to @io_bazel_rules_webtesting browser_repositories
load("@angular//:browser_repositories.bzl", "browser_repositories")

browser_repositories()

# Setup the rules_typescript tooolchain
load("@build_bazel_rules_typescript//:defs.bzl", "ts_setup_workspace")

ts_setup_workspace()

# Setup the rules_sass toolchain
load("@io_bazel_rules_sass//sass:sass_repositories.bzl", "sass_repositories")

sass_repositories()

# Setup the skydoc toolchain
load("@io_bazel_skydoc//skylark:skylark.bzl", "skydoc_repositories")

skydoc_repositories()
