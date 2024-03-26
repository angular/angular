workspace(
    name = "angular",
    managed_directories = {
        "@npm": ["node_modules"],
    },
)

load("@bazel_tools//tools/build_defs/repo:http.bzl", "http_archive")
load("//:yarn.bzl", "YARN_LABEL")

# Add a patch fix for rules_webtesting v0.3.5 required for enabling runfiles on Windows.
# TODO: Remove the http_archive for this transitive dependency when a release is cut
# for https://github.com/bazelbuild/rules_webtesting/commit/581b1557e382f93419da6a03b91a45c2ac9a9ec8
# and the version is updated in rules_nodejs.
http_archive(
    name = "io_bazel_rules_webtesting",
    patch_args = ["-p1"],
    patches = [
        "//:tools/bazel-repo-patches/rules_webtesting__windows_runfiles_fix.patch",
    ],
    sha256 = "e9abb7658b6a129740c0b3ef6f5a2370864e102a5ba5ffca2cea565829ed825a",
    urls = ["https://github.com/bazelbuild/rules_webtesting/releases/download/0.3.5/rules_webtesting.tar.gz"],
)

http_archive(
    name = "build_bazel_rules_nodejs",
    patches = [
        "//tools/esm-interop:patches/bazel/nodejs_binary_esm_support.patch",
    ],
    sha256 = "5dd1e5dea1322174c57d3ca7b899da381d516220793d0adef3ba03b9d23baa8e",
    urls = ["https://github.com/bazelbuild/rules_nodejs/releases/download/5.8.3/rules_nodejs-5.8.3.tar.gz"],
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
        "18.18.2-darwin_arm64": ("node-v18.18.2-darwin-arm64.tar.gz", "node-v18.18.2-darwin-arm64", "9f982cc91b28778dd8638e4f94563b0c2a1da7aba62beb72bd427721035ab553"),
        "18.18.2-darwin_amd64": ("node-v18.18.2-darwin-x64.tar.gz", "node-v18.18.2-darwin-x64", "5bb8da908ed590e256a69bf2862238c8a67bc4600119f2f7721ca18a7c810c0f"),
        "18.18.2-linux_arm64": ("node-v18.18.2-linux-arm64.tar.xz", "node-v18.18.2-linux-arm64", "2e630e18548627f61eaf573233da7949dc0a1df5eef3f486fa9820c5f6c121aa"),
        "18.18.2-linux_ppc64le": ("node-v18.18.2-linux-ppc64le.tar.xz", "node-v18.18.2-linux-ppc64le", "b0adff5cf5938266b711d6c724fb134d802e0dee40b3a3f73d162de1b3d11880"),
        "18.18.2-linux_s390x": ("node-v18.18.2-linux-s390x.tar.xz", "node-v18.18.2-linux-s390x", "c70ec2074b5e2b42c55bb4b8105418b67bf8a61c500d9376a07430dfcc341fdb"),
        "18.18.2-linux_amd64": ("node-v18.18.2-linux-x64.tar.xz", "node-v18.18.2-linux-x64", "75aba25ae76999309fc6c598efe56ce53fbfc221381a44a840864276264ab8ac"),
        "18.18.2-windows_amd64": ("node-v18.18.2-win-x64.zip", "node-v18.18.2-win-x64", "3bb0e51e579a41a22b3bf6cb2f3e79c03801aa17acbe0ca00fc555d1282e7acd"),
    },
    # We need at least Node 18.17 due to some transitive dependencies.
    node_version = "18.18.2",
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
        "//tools/esm-interop:patches/npm/@angular+build-tooling+0.0.0-e0ec7b60641d7f6369be45d8d02663fd50f320be.patch",
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

yarn_install(
    name = "aio_example_deps",
    # Rename the default js_library target from "node_modules" as this obscures the
    # the source directory stamped as a filegroup in the manual BUILD contents below.
    all_node_modules_target_name = "node_modules_all",
    data = [
        YARN_LABEL,
        "//:.yarnrc",
    ],
    # Disabled because, when False, yarn_install preserves the node_modules folder
    # with bin symlinks in the external repository. This is needed to link the shared
    # set of deps for example e2es.
    exports_directories_only = False,
    manual_build_file_contents = """\
filegroup(
    name = "node_modules_files",
    srcs = ["node_modules"],
)
""",
    package_json = "//aio/tools/examples/shared:package.json",
    yarn = YARN_LABEL,
    yarn_lock = "//aio/tools/examples/shared:yarn.lock",
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
    sha256 = "5633816e996a79c77f44306f6228b9ef18fc2ecb412d63b4e314a132225facba",
    strip_prefix = "rules_sass-79bd239ce77c101ea1aed575678020bd2999f17d",
    urls = [
        "https://github.com/bazelbuild/rules_sass/archive/79bd239ce77c101ea1aed575678020bd2999f17d.zip",
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
