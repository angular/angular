workspace(
    name = "angular",
    managed_directories = {"@npm": ["node_modules"]},
)

load("@bazel_tools//tools/build_defs/repo:http.bzl", "http_archive")

# Fetch rules_nodejs so we can install our npm dependencies
http_archive(
    name = "build_bazel_rules_nodejs",
    sha256 = "4681ca88d512d57196d064d1441549080d8d17d119174a1229d1717a16a4a489",
    urls = ["https://github.com/bazelbuild/rules_nodejs/releases/download/4.0.0-beta.1/rules_nodejs-4.0.0-beta.1.tar.gz"],
)

# Check the rules_nodejs version and download npm dependencies
# Note: bazel (version 2 and after) will check the .bazelversion file so we don't need to
# assert on that.
load("@build_bazel_rules_nodejs//:index.bzl", "check_rules_nodejs_version", "node_repositories", "yarn_install")

check_rules_nodejs_version(minimum_version_string = "2.2.0")

# Setup the Node.js toolchain
node_repositories(
    node_version = "14.16.1",
    package_json = ["//:package.json"],
)

load("//integration:angular_integration_test.bzl", "npm_package_archives")

yarn_install(
    name = "npm",
    manual_build_file_contents = npm_package_archives(),
    package_json = "//:package.json",
    yarn_lock = "//:yarn.lock",
)

# Load protractor dependencies
load("@npm//@bazel/protractor:package.bzl", "npm_bazel_protractor_dependencies")

npm_bazel_protractor_dependencies()

# Setup the rules_webtesting toolchain
load("@io_bazel_rules_webtesting//web:repositories.bzl", "web_test_repositories")

web_test_repositories()

load("//dev-infra/bazel/browsers:browser_repositories.bzl", "browser_repositories")

browser_repositories()

load("//packages/common/locales/generate-locales-tool:cldr-data.bzl", "cldr_data_repository")

cldr_data_repository(
    name = "cldr_data",
    # Since we use the Github archives for CLDR 37, we need to specify a path
    # to the available locales. This wouldn't be needed with CLDR 39 as that
    # comes with an official JSON archive not containing a version suffix.
    available_locales_path = "cldr-core-37.0.0/availableLocales.json",
    urls = {
        "https://github.com/unicode-cldr/cldr-core/archive/37.0.0.zip": "32b5c49c3874aa342b90412c207b42e7aefb2435295891fb714c34ce58b3c706",
        "https://github.com/unicode-cldr/cldr-dates-full/archive/37.0.0.zip": "e1c410dd8ad7d75df4a5393efaf5d28f0d56c0fa126c5d66e171a3f21a988a1e",
        "https://github.com/unicode-cldr/cldr-numbers-full/archive/37.0.0.zip": "a921b90cf7f436e63fbdd55880f96e39a203acd9e174b0ceafa20a02c242a12e",
    },
)
