workspace(
    name = "angular",
    managed_directories = {"@npm": ["node_modules"]},
)

load("@bazel_tools//tools/build_defs/repo:http.bzl", "http_archive")

# Fetch rules_nodejs so we can install our npm dependencies
http_archive(
    name = "build_bazel_rules_nodejs",
    sha256 = "bfacf15161d96a6a39510e7b3d3b522cf61cb8b82a31e79400a84c5abcab5347",
    urls = ["https://github.com/bazelbuild/rules_nodejs/releases/download/3.2.1/rules_nodejs-3.2.1.tar.gz"],
)

# Check the rules_nodejs version and download npm dependencies
# Note: bazel (version 2 and after) will check the .bazelversion file so we don't need to
# assert on that.
load("@build_bazel_rules_nodejs//:index.bzl", "check_rules_nodejs_version", "node_repositories", "yarn_install")

check_rules_nodejs_version(minimum_version_string = "2.2.0")

# Setup the Node.js toolchain
node_repositories(
    node_version = "12.14.1",
    package_json = ["//:package.json"],
)

load("//integration:angular_integration_test.bzl", "npm_package_archives")

yarn_install(
    name = "npm",
    manual_build_file_contents = npm_package_archives(),
    package_json = "//:package.json",
    yarn_lock = "//:yarn.lock",
)

# Load angular dependencies
load("//packages/bazel:package.bzl", "rules_angular_dev_dependencies")

rules_angular_dev_dependencies()

# Load protractor dependencies
load("@npm//@bazel/protractor:package.bzl", "npm_bazel_protractor_dependencies")

npm_bazel_protractor_dependencies()

# Setup the rules_webtesting toolchain
load("@io_bazel_rules_webtesting//web:repositories.bzl", "web_test_repositories")

web_test_repositories()

load("//dev-infra/browsers:browser_repositories.bzl", "browser_repositories")

browser_repositories()

# Setup the rules_sass toolchain
load("@io_bazel_rules_sass//:defs.bzl", "sass_repositories")

sass_repositories()

# Setup the skydoc toolchain
load("@io_bazel_skydoc//skylark:skylark.bzl", "skydoc_repositories")

skydoc_repositories()

load("@bazel_toolchains//rules:environments.bzl", "clang_env")
load("@bazel_toolchains//rules:rbe_repo.bzl", "rbe_autoconfig")

rbe_autoconfig(
    name = "rbe_ubuntu1604_angular",
    # Need to specify a base container digest in order to ensure that we can use the checked-in
    # platform configurations for the "ubuntu16_04" image. Otherwise the autoconfig rule would
    # need to pull the image and run it in order determine the toolchain configuration. See:
    # https://github.com/bazelbuild/bazel-toolchains/blob/4.0.0/configs/ubuntu16_04_clang/versions.bzl
    base_container_digest = "sha256:f6568d8168b14aafd1b707019927a63c2d37113a03bcee188218f99bd0327ea1",
    # Note that if you change the `digest`, you might also need to update the
    # `base_container_digest` to make sure marketplace.gcr.io/google/rbe-ubuntu16-04-webtest:<digest>
    # and marketplace.gcr.io/google/rbe-ubuntu16-04:<base_container_digest> have
    # the same Clang and JDK installed. Clang is needed because of the dependency on
    # @com_google_protobuf. Java is needed for the Bazel's test executor Java tool.
    digest = "sha256:dddaaddbe07a61c2517f9b08c4977fc23c4968fcb6c0b8b5971e955d2de7a961",
    env = clang_env(),
    registry = "marketplace.gcr.io",
    # We can't use the default "ubuntu16_04" RBE image provided by the autoconfig because we need
    # a specific Linux kernel that comes with "libx11" in order to run headless browser tests.
    repository = "google/rbe-ubuntu16-04-webtest",
    use_checked_in_confs = "Force",
)
