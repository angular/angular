workspace(
    name = "angular",
)

load("@bazel_tools//tools/build_defs/repo:git.bzl", "git_repository")
load("@bazel_tools//tools/build_defs/repo:http.bzl", "http_archive")
load("//:yarn.bzl", "YARN_LABEL")

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

http_archive(
    name = "aspect_rules_js",
    sha256 = "75c25a0f15a9e4592bbda45b57aa089e4bf17f9176fd735351e8c6444df87b52",
    strip_prefix = "rules_js-2.1.0",
    url = "https://github.com/aspect-build/rules_js/releases/download/v2.1.0/rules_js-v2.1.0.tar.gz",
)

load("@aspect_rules_js//js:repositories.bzl", "rules_js_dependencies")

rules_js_dependencies()

# Setup the Node.js toolchain.
load("@rules_nodejs//nodejs:repositories.bzl", "nodejs_register_toolchains")

NODE_VERSION = "18.20.5"

NODE_18_REPO = {
    "18.20.5-darwin_arm64": ("node-v18.20.5-darwin-arm64.tar.gz", "node-v18.20.5-darwin-arm64", "bdfeaf59dbf29aec08c0c66130edf0a8a17014b4f2997727641dfd0b58b51f48"),
    "18.20.5-darwin_amd64": ("node-v18.20.5-darwin-x64.tar.gz", "node-v18.20.5-darwin-x64", "dff01068da7d3fe7b515f72a3903dca96a34dc377f6f426b6a813901274b6441"),
    "18.20.5-linux_arm64": ("node-v18.20.5-linux-arm64.tar.xz", "node-v18.20.5-linux-arm64", "a77db6ab34267f3bc80e02ed68abf51b7065eb5c82fcd69adc4b40e390d9b116"),
    "18.20.5-linux_ppc64le": ("node-v18.20.5-linux-ppc64le.tar.xz", "node-v18.20.5-linux-ppc64le", "63b4c6801c96fb452e3bd8125e8b5b195ecacc4fa2505e47a128e94587999aeb"),
    "18.20.5-linux_s390x": ("node-v18.20.5-linux-s390x.tar.xz", "node-v18.20.5-linux-s390x", "617d7456e16534a4b4e03f5285cc8d13581f39cdad9196efff2516d6588de319"),
    "18.20.5-linux_amd64": ("node-v18.20.5-linux-x64.tar.xz", "node-v18.20.5-linux-x64", "e4a3a21e5ac7e074ed50d2533dd0087d8460647ab567464867141a2b643f3fb3"),
    "18.20.5-windows_amd64": ("node-v18.20.5-win-x64.zip", "node-v18.20.5-win-x64", "910237449895b4de61026568dc076fa6c3ffcd667563ed03112a4a77e1f1556b"),
}

nodejs_register_toolchains(
    name = "nodejs",
    node_repositories = NODE_18_REPO,
    node_version = NODE_VERSION,
)

load("@aspect_rules_js//js:toolchains.bzl", "rules_js_register_toolchains")

rules_js_register_toolchains(
    node_repositories = NODE_18_REPO,
    node_version = NODE_VERSION,
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
        "//:tools/npm-patches/@angular+ng-dev+0.0.0-a6dcd24107d12114198251ee5d20cda814a1986a.patch",
        "//:tools/npm-patches/@angular+ssr+19.2.0-next.2.patch",
        "//:tools/npm-patches/@bazel+jasmine+5.8.1.patch",
        "//tools:postinstall-patches.js",
        "//tools/esm-interop:patches/npm/@angular+build-tooling+0.0.0-2670abf637fa155971cdd1f7e570a7f234922a65.patch",
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
    yarn = YARN_LABEL,
    yarn_lock = "//:yarn.lock",
)

load("@aspect_rules_js//npm:repositories.bzl", "npm_translate_lock")

npm_translate_lock(
    name = "npm2",
    data = [
        "//:package.json",
        "//:pnpm-workspace.yaml",
        "//packages/compiler:package.json",
        "//packages/compiler-cli:package.json",
        "//tools/bazel/rules_angular_store:package.json",
    ],
    npmrc = "//:.npmrc",
    pnpm_lock = "//:pnpm-lock.yaml",
    update_pnpm_lock = True,
    verify_node_modules_ignored = "//:.bazelignore",
    yarn_lock = "//:yarn.lock",
)

load("@npm2//:repositories.bzl", "npm_repositories")

npm_repositories()

http_archive(
    name = "aspect_rules_ts",
    sha256 = "9acd128abe77397505148eaa6895faed57839560dbf2177dd6285e51235e2724",
    strip_prefix = "rules_ts-3.3.1",
    url = "https://github.com/aspect-build/rules_ts/releases/download/v3.3.1/rules_ts-v3.3.1.tar.gz",
)

load("@aspect_rules_ts//ts:repositories.bzl", "rules_ts_dependencies")

rules_ts_dependencies(
    # Obtained by: curl --silent https://registry.npmjs.org/typescript/5.8.2 | jq -r '.dist.integrity'
    ts_integrity = "sha512-aJn6wq13/afZp/jT9QZmwEjDqqvSGp1VT5GVg+f/t6/oVyrgXM6BY1h9BRh/O5p3PlUPAe+WuiEZOmb/49RqoQ==",
    ts_version_from = "//:package.json",
)

http_archive(
    name = "aspect_rules_rollup",
    sha256 = "c4062681968f5dcd3ce01e09e4ba73670c064744a7046211763e17c98ab8396e",
    strip_prefix = "rules_rollup-2.0.0",
    url = "https://github.com/aspect-build/rules_rollup/releases/download/v2.0.0/rules_rollup-v2.0.0.tar.gz",
)

http_archive(
    name = "aspect_rules_jasmine",
    sha256 = "0d2f9c977842685895020cac721d8cc4f1b37aae15af46128cf619741dc61529",
    strip_prefix = "rules_jasmine-2.0.0",
    url = "https://github.com/aspect-build/rules_jasmine/releases/download/v2.0.0/rules_jasmine-v2.0.0.tar.gz",
)

load("@aspect_rules_jasmine//jasmine:dependencies.bzl", "rules_jasmine_dependencies")

rules_jasmine_dependencies()

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
    sha256 = "bff856619317a388292970a7d4bfea8c9e627a1886fe7132075d378d4067c09e",
    strip_prefix = "rules_sass-cbe5261f925751a465a1a54bf2147e5f696ec567",
    urls = [
        "https://github.com/bazelbuild/rules_sass/archive/cbe5261f925751a465a1a54bf2147e5f696ec567.zip",
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

git_repository(
    name = "devinfra",
    commit = "90560ac34ffbb40189d98d8e54110e9c43575761",
    remote = "https://github.com/angular/dev-infra.git",
)

load("@devinfra//bazel:setup_dependencies_1.bzl", "setup_dependencies_1")

setup_dependencies_1()

load("@devinfra//bazel:setup_dependencies_2.bzl", "setup_dependencies_2")

setup_dependencies_2()

git_repository(
    name = "rules_angular",
    commit = "ad3a2d652f41c953fad8f55c3959fde628fa8ebf",
    remote = "https://github.com/devversion/rules_angular.git",
)

load("@rules_angular//setup:step_1.bzl", "rules_angular_step1")

rules_angular_step1()

load("@rules_angular//setup:step_2.bzl", "rules_angular_step2")

rules_angular_step2()

load("@rules_angular//setup:step_3.bzl", "rules_angular_step3")

rules_angular_step3(
    angular_compiler_cli = "@angular//tools/bazel/rules_angular_store:node_modules/@angular/compiler-cli",
    typescript = "@angular//:node_modules/typescript",
)
