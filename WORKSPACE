workspace(
    name = "angular",
    managed_directories = {
        "@npm": ["node_modules"],
    },
)

load("@bazel_tools//tools/build_defs/repo:http.bzl", "http_archive")
load("//:yarn.bzl", "YARN_LABEL")

http_archive(
    name = "build_bazel_rules_nodejs",
    patches = [
        "//tools/esm-interop:patches/bazel/nodejs_binary_esm_support.patch",
    ],
    sha256 = "5dd1e5dea1322174c57d3ca7b899da381d516220793d0adef3ba03b9d23baa8e",
    urls = ["https://github.com/bazelbuild/rules_nodejs/releases/download/v6.3.0/rules_nodejs-5.8.3.tar.gz"],
)

load("@build_bazel_rules_nodejs//:repositories.bzl", "build_bazel_rules_nodejs_dependencies")

build_bazel_rules_nodejs_dependencies()

# The PKG rules are needed to build tar packages for integration tests. The builtin
# rule in `@bazel_tools` is not Windows compatible and outdated.
# NOTE: We cannot move past version 0.6.0 as pkg_tar no longer works on directories, which rules_nodejs
#       relies on for node_modules setup.
http_archive(
    name = "rules_pkg",
    sha256 = "62eeb544ff1ef41d786e329e1536c1d541bb9bcad27ae984d57f18f314018e66",
    urls = [
        "https://mirror.bazel.build/github.com/bazelbuild/rules_pkg/releases/download/0.6.0/rules_pkg-0.6.0.tar.gz",
        "https://github.com/bazelbuild/rules_pkg/releases/download/0.6.0/rules_pkg-0.6.0.tar.gz",
    ],
)

# Fetch Aspect lib for utilities like write_source_files
# NOTE: We cannot move past version 1.23.2 of aspect_bazel_lib because it requires us to move to bazel 6.0.0 which
#       breaks our usage of managed_directories
http_archive(
    name = "aspect_bazel_lib",
    sha256 = "4b2e774387bae6242879820086b7b738d49bf3d0659522ea5d9363be01a27582",
    strip_prefix = "bazel-lib-1.23.2",
    url = "https://github.com/aspect-build/bazel-lib/archive/refs/tags/v1.23.2.tar.gz",
)

# Setup the Node.js toolchain.
load("@rules_nodejs//nodejs:repositories.bzl", "nodejs_register_toolchains")

nodejs_register_toolchains(
    name = "nodejs",
    node_repositories = {
        "18.20.0-darwin_arm64": ("node-v18.20.0-darwin-arm64.tar.gz", "node-v18.20.0-darwin-arm64", "10066ad4dd9e03ea5c4c45ef8775420ff37b860de09bbdf87b97e0c07b1ea036"),
        "18.20.0-darwin_amd64": ("node-v18.20.0-darwin-x64.tar.gz", "node-v18.20.0-darwin-x64", "062ba71618e88e06321de5caa038843c350aababa2d315f3ca7b8551f8e66c1c"),
        "18.20.0-linux_arm64": ("node-v18.20.0-linux-arm64.tar.xz", "node-v18.20.0-linux-arm64", "afe51da9ffb38ac1e3a20d9a06efd403ced4bf8831ab554a02a088dd8392fd79"),
        "18.20.0-linux_ppc64le": ("node-v18.20.0-linux-ppc64le.tar.xz", "node-v18.20.0-linux-ppc64le", "9e652bbf53a3e37285b11dfb9d6a9bb8b02010c3b50e5c8229d4cc10e72681da"),
        "18.20.0-linux_s390x": ("node-v18.20.0-linux-s390x.tar.xz", "node-v18.20.0-linux-s390x", "a6c2a5796b9d9e9bf21da62ec89ff30b41a8108880b9eaa3c912f1ce795a7743"),
        "18.20.0-linux_amd64": ("node-v18.20.0-linux-x64.tar.xz", "node-v18.20.0-linux-x64", "03eea148e56785babb27930b05ed6bf311aaa3bc573c0399dd63cad2fe5713c7"),
        "18.20.0-windows_amd64": ("node-v18.20.0-win-x64.zip", "node-v18.20.0-win-x64", "1c0aab05cc6836a8f5148cca345b92ebc948a4a2013f18d117b7ade6ff05aca6"),
    },
    # We need at least Node 18.17 due to some transitive dependencies.
    node_version = "18.20.0",
)

# Download npm dependencies.
load("@build_bazel_rules_nodejs//:index.bzl", "yarn_install")
load("//integration:npm_package_archives.bzl", "npm_package_archives")

yarn_install(
    name = "npm",
    # Note that we add the postinstall scripts here so that the dependencies are re-installed
    # when the postinstall patches are modified.
    data = [
        YARN_LABEL,
        "//:.yarnrc",
        "//:tools/npm-patches/@bazel+jasmine+5.8.1.patch",
        "//tools:postinstall-patches.js",
        "//tools/esm-interop:patches/npm/@angular+build-tooling+0.0.0-d30a56c19bafaac67cf44e605ed8c2c0e45b0a51.patch",
        "//tools/esm-interop:patches/npm/@bazel+concatjs+5.8.1.patch",
        "//tools/esm-interop:patches/npm/@bazel+esbuild+5.7.1.patch",
        "//tools/esm-interop:patches/npm/@bazel+protractor+5.7.1.patch",
        "//tools/esm-interop:patches/npm/rxjs+6.6.7.patch",
    ],
    # Currently disabled due to:
    #  1. Missing Windows support currently.
    #  2. Incompatibilites with the `ts_library` rule.
    exports_directories_only = False,
    manual_build_file_contents = npm_package_archives(),
    package_json = "//:package.json",
    # We prefer to symlink the `node_modules` to only maintain a single install.
    # See https://github.com/angular/dev-infra/pull/446#issuecomment-1059820287 for details.
    symlink_node_modules = True,
    yarn = YARN_LABEL,
    yarn_lock = "//:yarn.lock",
)

load("@aspect_bazel_lib//lib:repositories.bzl", "aspect_bazel_lib_dependencies")

aspect_bazel_lib_dependencies()

# Load protractor dependencies
load("@npm//@bazel/protractor:package.bzl", "npm_bazel_protractor_dependencies")

npm_bazel_protractor_dependencies()

# Setup the rules_webtesting toolchain
load("@io_bazel_rules_webtesting//web:repositories.bzl", "web_test_repositories")

web_test_repositories()

load("@npm//@angular/build-tooling/bazel/browsers:browser_repositories.bzl", "browser_repositories")

browser_repositories()

load("@build_bazel_rules_nodejs//toolchains/esbuild:esbuild_repositories.bzl", "esbuild_repositories")

esbuild_repositories(
    npm_repository = "npm",
)

load("@rules_pkg//:deps.bzl", "rules_pkg_dependencies")

rules_pkg_dependencies()

load("//packages/common/locales/generate-locales-tool:cldr-data.bzl", "cldr_json_data_repository", "cldr_xml_data_repository")

cldr_major_version = "41"

cldr_json_data_repository(
    name = "cldr_json_data",
    urls = {
        "https://github.com/unicode-org/cldr-json/releases/download/%s.0.0/cldr-%s.0.0-json-full.zip" % (cldr_major_version, cldr_major_version): "649b76647269e32b1b0a5f7b6eed52e9e63a1581f1afdcf4f6771e49c9713614",
    },
)

cldr_xml_data_repository(
    name = "cldr_xml_data",
    urls = {
        "https://github.com/unicode-org/cldr/releases/download/release-%s/cldr-common-%s.0.zip" % (cldr_major_version, cldr_major_version): "823c6170c41e2de2c229574e8a436332d25f1c9723409867fe721e00bc92d853",
    },
)

# sass rules
http_archive(
    name = "io_bazel_rules_sass",
    sha256 = "02116bcc66fd5c3e89e1b85cec6cdc05014ad02c308a4871727d997b9419f475",
    strip_prefix = "rules_sass-7bceee9f60c92599c8293b44cd9dccc67ba93f12",
    urls = [
        "https://github.com/bazelbuild/rules_sass/archive/7bceee9f60c92599c8293b44cd9dccc67ba93f12.zip",
    ],
)

# Setup the rules_sass toolchain
load("@io_bazel_rules_sass//sass:sass_repositories.bzl", "sass_repositories")

sass_repositories(
    yarn_script = YARN_LABEL,
)

# Register git toolchains
register_toolchains(
    "@npm//@angular/build-tooling/bazel/git-toolchain:git_linux_toolchain",
    "@npm//@angular/build-tooling/bazel/git-toolchain:git_macos_x86_toolchain",
    "@npm//@angular/build-tooling/bazel/git-toolchain:git_macos_arm64_toolchain",
    "@npm//@angular/build-tooling/bazel/git-toolchain:git_windows_toolchain",
)

# Fetch sauce connect (tool to open Saucelabs tunnel for Saucelabs browser tests)
http_archive(
    name = "sauce_connect_linux_amd64",
    build_file_content = """exports_files(["bin/sc"], visibility = ["//visibility:public"])""",
    sha256 = "26b9c3630f441b47854b6032f7eca6f1d88d3f62e50ee44c27015d71a5155c36",
    strip_prefix = "sc-4.8.2-linux",
    url = "https://saucelabs.com/downloads/sc-4.8.2-linux.tar.gz",
)

http_archive(
    name = "sauce_connect_mac",
    build_file_content = """exports_files(["bin/sc"], visibility = ["//visibility:public"])""",
    sha256 = "28277ce81ef9ab84f5b87b526258920a8ead44789a5034346e872629bbf38089",
    strip_prefix = "sc-4.8.2-osx",
    url = "https://saucelabs.com/downloads/sc-4.8.2-osx.zip",
)

yarn_install(
    name = "npm_ts_versions",
    data = [
        YARN_LABEL,
        "//:.yarnrc",
    ],
    exports_directories_only = False,
    package_json = "//packages/core/schematics/migrations/signal-migration/test/ts-versions:package.json",
    yarn = YARN_LABEL,
    yarn_lock = "//packages/core/schematics/migrations/signal-migration/test/ts-versions:yarn.lock",
)
