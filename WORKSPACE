workspace(
    name = "angular_material",
    managed_directories = {"@npm": ["node_modules"]},
)

load("@bazel_tools//tools/build_defs/repo:http.bzl", "http_archive")

# Add NodeJS rules
http_archive(
    name = "build_bazel_rules_nodejs",
    sha256 = "f533eeefc8fe1ddfe93652ec50f82373d0c431f7faabd5e6323f6903195ef227",
    urls = ["https://github.com/bazelbuild/rules_nodejs/releases/download/3.3.0/rules_nodejs-3.3.0.tar.gz"],
)

# Add sass rules
http_archive(
    name = "io_bazel_rules_sass",
    sha256 = "9ad74e6e75a86939f4349b31d43bb1db4279e4f2a139c5ebaf56cf99feea1faa",
    strip_prefix = "rules_sass-1.32.8",
    urls = [
        "https://github.com/bazelbuild/rules_sass/archive/1.32.8.zip",
        "https://mirror.bazel.build/github.com/bazelbuild/rules_sass/archive/1.32.8.zip",
    ],
)

load("@build_bazel_rules_nodejs//:index.bzl", "check_bazel_version", "node_repositories", "yarn_install")

# The minimum bazel version to use with this repo is v3.1.0.
check_bazel_version("4.0.0")

node_repositories(
    node_version = "14.16.1",
    package_json = ["//:package.json"],
)

yarn_install(
    name = "npm",
    # We add the postinstall patches file, and ngcc main fields update script here so
    # that Yarn will rerun whenever one of these files has been modified.
    data = [
        "//:tools/postinstall/apply-patches.js",
        "//:tools/postinstall/update-ngcc-main-fields.js",
    ],
    package_json = "//:package.json",
    quiet = False,
    yarn_lock = "//:yarn.lock",
)

load("@npm//@bazel/protractor:package.bzl", "npm_bazel_protractor_dependencies")

npm_bazel_protractor_dependencies()

# Setup web testing. We need to setup a browser because the web testing rules for TypeScript need
# a reference to a registered browser (ideally that's a hermetic version of a browser)
load("@io_bazel_rules_webtesting//web:repositories.bzl", "web_test_repositories")

web_test_repositories()

# Fetch transitive dependencies which are needed to use the Sass rules.
load("@io_bazel_rules_sass//:package.bzl", "rules_sass_dependencies")

rules_sass_dependencies()

# Setup the Sass rule repositories.
load("@io_bazel_rules_sass//:defs.bzl", "sass_repositories")

sass_repositories()

# Bring in bazel_toolchains for RBE setup configuration.
http_archive(
    name = "bazel_toolchains",
    # Patch `bazel-toolchains` to always consider the host platform as Linux. This is necessary
    # because the RBE configurations are incorrectly based on the host platform and this breaks
    # cross-platform remote execution. e.g. using RBE on macOS.
    # See: https://github.com/bazelbuild/bazel-toolchains/issues/895
    patches = ["//tools:rbe_cross_platform_workaround.patch"],
    sha256 = "1adf5db506a7e3c465a26988514cfc3971af6d5b3c2218925cd6e71ee443fc3f",
    strip_prefix = "bazel-toolchains-4.0.0",
    urls = [
        "https://mirror.bazel.build/github.com/bazelbuild/bazel-toolchains/releases/download/4.0.0/bazel-toolchains-4.0.0.tar.gz",
        "https://github.com/bazelbuild/bazel-toolchains/releases/download/4.0.0/bazel-toolchains-4.0.0.tar.gz",
    ],
)

load("@bazel_toolchains//repositories:repositories.bzl", bazel_toolchains_repositories = "repositories")

bazel_toolchains_repositories()

load("@bazel_toolchains//rules:rbe_repo.bzl", "rbe_autoconfig")

rbe_autoconfig(
    name = "rbe_default",
    # Need to specify a base container digest in order to ensure that we can use the checked-in
    # platform configurations for the "ubuntu16_04" image. Otherwise the autoconfig rule would
    # need to pull the image and run it in order determine the toolchain configuration.
    # See: https://github.com/bazelbuild/bazel-toolchains/blob/master/configs/ubuntu16_04_clang/versions.bzl#L9
    base_container_digest = "sha256:f6568d8168b14aafd1b707019927a63c2d37113a03bcee188218f99bd0327ea1",
    digest = "sha256:dddaaddbe07a61c2517f9b08c4977fc23c4968fcb6c0b8b5971e955d2de7a961",
    registry = "marketplace.gcr.io",
    # We can't use the default "ubuntu16_04" RBE image provided by the autoconfig because we need
    # a specific Linux kernel that comes with "libx11" in order to run headless browser tests.
    repository = "google/rbe-ubuntu16-04-webtest",
)

# Load pinned rules_webtesting browser versions for tests.
#
# TODO(wagnermaciel): deduplicate browsers - this will load another version of chromium in the
# repository. We probably want to use the chromium version loaded here (from dev-infra) as that
# one has RBE improvements.
load("@npm//@angular/dev-infra-private/browsers:browser_repositories.bzl", _dev_infra_browser_repositories = "browser_repositories")

_dev_infra_browser_repositories()
