workspace(
    name = "angular",
    managed_directories = {
        "@npm": ["node_modules"],
        "@aio_npm": ["aio/node_modules"],
    },
)

load("@bazel_tools//tools/build_defs/repo:http.bzl", "http_archive")

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
    sha256 = "c78216f5be5d451a42275b0b7dc809fb9347e2b04a68f68bad620a2b01f5c774",
    urls = ["https://github.com/bazelbuild/rules_nodejs/releases/download/5.5.2/rules_nodejs-5.5.2.tar.gz"],
)

load("@build_bazel_rules_nodejs//:repositories.bzl", "build_bazel_rules_nodejs_dependencies")

build_bazel_rules_nodejs_dependencies()

# The PKG rules are needed to build tar packages for integration tests. The builtin
# rule in `@bazel_tools` is not Windows compatible and outdated.
http_archive(
    name = "rules_pkg",
    sha256 = "62eeb544ff1ef41d786e329e1536c1d541bb9bcad27ae984d57f18f314018e66",
    urls = [
        "https://mirror.bazel.build/github.com/bazelbuild/rules_pkg/releases/download/0.6.0/rules_pkg-0.6.0.tar.gz",
        "https://github.com/bazelbuild/rules_pkg/releases/download/0.6.0/rules_pkg-0.6.0.tar.gz",
    ],
)

# Fetch Aspect lib for utilities like write_source_files
http_archive(
    name = "aspect_bazel_lib",
    sha256 = "5f5f1237601d41d61608ad0b9541614935839232940010f9e62163c3e53dc1b7",
    strip_prefix = "bazel-lib-0.5.0",
    url = "https://github.com/aspect-build/bazel-lib/archive/refs/tags/v0.5.0.tar.gz",
)

# Setup the Node.js toolchain.
load("@rules_nodejs//nodejs:repositories.bzl", "nodejs_register_toolchains")

nodejs_register_toolchains(
    name = "nodejs",
    node_version = "16.10.0",
)

# Download npm dependencies.
load("@build_bazel_rules_nodejs//:index.bzl", "yarn_install")
load("//integration:npm_package_archives.bzl", "npm_package_archives")

yarn_install(
    name = "npm",
    # Note that we add the postinstall scripts here so that the dependencies are re-installed
    # when the postinstall patches are modified.
    data = [
        "//:.yarn/releases/yarn-1.22.17.cjs",
        "//:.yarnrc",
        "//:scripts/puppeteer-chromedriver-versions.js",
        "//:scripts/webdriver-manager-update.js",
        "//tools:postinstall-patches.js",
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
    yarn = "//:.yarn/releases/yarn-1.22.17.cjs",
    yarn_lock = "//:yarn.lock",
)

yarn_install(
    name = "aio_npm",
    # Note that we add the postinstall scripts here so that the dependencies are re-installed
    # when the postinstall patches are modified.
    data = [
        "//:.yarn/releases/yarn-1.22.17.cjs",
        "//:.yarnrc",
        "//aio:tools/cli-patches/patch.js",
    ],
    # Currently disabled due to:
    #  1. Missing Windows support currently.
    #  2. Incompatibilites with the `ts_library` rule.
    exports_directories_only = False,
    manual_build_file_contents = npm_package_archives(),
    package_json = "//aio:package.json",
    # We prefer to symlink the `node_modules` to only maintain a single install.
    # See https://github.com/angular/dev-infra/pull/446#issuecomment-1059820287 for details.
    symlink_node_modules = True,
    yarn = "//:.yarn/releases/yarn-1.22.17.cjs",
    yarn_lock = "//aio:yarn.lock",
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
    sha256 = "a5ff47737667d644dba00af5444b6723fd5ddae2db80ee2f1e202bf0ccfcd4ef",
    strip_prefix = "rules_sass-f3874ae3ddbdab73a0a0e7bc14909d498c464ad9",
    urls = [
        "https://github.com/bazelbuild/rules_sass/archive/f3874ae3ddbdab73a0a0e7bc14909d498c464ad9.zip",
    ],
)

# Setup the rules_sass toolchain
load("@io_bazel_rules_sass//sass:sass_repositories.bzl", "sass_repositories")

sass_repositories(
    yarn_script = "//:.yarn/releases/yarn-1.22.17.cjs",
)
