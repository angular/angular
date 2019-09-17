workspace(name = "angular_material")

load("@bazel_tools//tools/build_defs/repo:http.bzl", "http_archive")

# Add NodeJS rules (explicitly used for sass bundle rules)
http_archive(
    name = "build_bazel_rules_nodejs",
    sha256 = "3356c6b767403392bab018ce91625f6d15ff8f11c6d772dc84bc9cada01c669a",
    # Note that we cannot update to rules_nodejs#0.36.2 as it contains a bug where
    # node output binaries cannot be launched on windows. We can update once the
    # fix is released: https://github.com/bazelbuild/rules_nodejs/pull/1104.
    urls = ["https://github.com/bazelbuild/rules_nodejs/releases/download/0.36.1/rules_nodejs-0.36.1.tar.gz"],
)

# Add sass rules
http_archive(
    name = "io_bazel_rules_sass",
    sha256 = "ad08e8c82aa1f48b72dc295cb83bba33f514cdf24cc7b0e21e9353f20f0dc147",
    strip_prefix = "rules_sass-5d1b26f8cd12c5d75dd359f9291090b341e8fd52",
    # We need to use a version that includes SHA 5d1b26f8cd12c5d75dd359f9291090b341e8fd52 of
    # the "rules_sass" repository as it adds support for workers.
    url = "https://github.com/bazelbuild/rules_sass/archive/5d1b26f8cd12c5d75dd359f9291090b341e8fd52.zip",
)

load("@build_bazel_rules_nodejs//:defs.bzl", "check_bazel_version", "node_repositories", "yarn_install")

# The minimum bazel version to use with this repo is 0.27.0
check_bazel_version("0.27.0")

node_repositories(
    # For deterministic builds, specify explicit NodeJS and Yarn versions.
    node_version = "10.16.0",
    yarn_repositories = {
        "1.17.3": ("yarn-v1.17.3.tar.gz", "yarn-v1.17.3", "e3835194409f1b3afa1c62ca82f561f1c29d26580c9e220c36866317e043c6f3"),
    },
    yarn_version = "1.17.3",
)

yarn_install(
    name = "npm",
    # Ensure that all resources are available when the "postinstall" or "preinstall" scripts
    # are executed in the Bazel sandbox.
    data = [
        "//:angular-tsconfig.json",
        "//:tools/bazel/flat_module_factory_resolution.patch",
        "//:tools/bazel/postinstall-patches.js",
        "//:tools/bazel/rollup_windows_arguments.patch",
        "//:tools/npm/check-npm.js",
    ],
    package_json = "//:package.json",
    # Temporarily disable node_modules symlinking until the fix for
    # https://github.com/bazelbuild/bazel/issues/8487 makes it into a
    # future Bazel release
    symlink_node_modules = False,
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

# Setup web testing. We need to setup a browser because the web testing rules for TypeScript need
# a reference to a registered browser (ideally that's a hermetic version of a browser)
load("@io_bazel_rules_webtesting//web:repositories.bzl", "web_test_repositories")

web_test_repositories()

load("@npm_bazel_karma//:browser_repositories.bzl", "browser_repositories")

browser_repositories()

# Fetch transitive dependencies which are needed to use the Sass rules.
load("@io_bazel_rules_sass//:package.bzl", "rules_sass_dependencies")

rules_sass_dependencies()

# Setup the Sass rule repositories.
load("@io_bazel_rules_sass//:defs.bzl", "sass_repositories")

sass_repositories()

# Bring in bazel_toolchains for RBE setup configuration.
http_archive(
    name = "bazel_toolchains",
    sha256 = "ab0d8aaeaeeef413ddb03922dbdb99bbae9e1b2c157a87c77d70d45a830be5b0",
    strip_prefix = "bazel-toolchains-0.29.1",
    url = "https://github.com/bazelbuild/bazel-toolchains/archive/0.29.1.tar.gz",
)

load("@bazel_toolchains//repositories:repositories.bzl", bazel_toolchains_repositories = "repositories")

bazel_toolchains_repositories()

load("@bazel_toolchains//rules:rbe_repo.bzl", "rbe_autoconfig")

rbe_autoconfig(
    name = "rbe_default",
    # Need to specify a base container digest in order to ensure that we can use the checked-in
    # platform configurations for the "ubuntu16_04" image. Otherwise the autoconfig rule would
    # need to pull the image and run it in order determine the toolchain configuration.
    # See: https://github.com/bazelbuild/bazel-toolchains/blob/master/rules/rbe_repo.bzl#L229
    base_container_digest = "sha256:3e98e2e1233de1aed4ed7d7e05450a3f75b8c8d6f6bf53f1b390b5131c790f6f",
    digest = "sha256:76e2e4a894f9ffbea0a0cb2fbde741b5d223d40f265dbb9bca78655430173990",
    registry = "marketplace.gcr.io",
    # We can't use the default "ubuntu16_04" RBE image provided by the autoconfig because we need
    # a specific Linux kernel that comes with "libx11" in order to run headless browser tests.
    repository = "google/rbe-ubuntu16-04-webtest",
)
