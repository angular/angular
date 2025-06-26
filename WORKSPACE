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
    sha256 = "304c51726b727d53277dd28fcda1b8e43b7e46818530b8d6265e7be98d5e2b25",
    strip_prefix = "rules_js-2.3.8",
    url = "https://github.com/aspect-build/rules_js/releases/download/v2.3.8/rules_js-v2.3.8.tar.gz",
)

load("@aspect_rules_js//js:repositories.bzl", "rules_js_dependencies")

rules_js_dependencies()

# Setup the Node.js toolchain.
load("@rules_nodejs//nodejs:repositories.bzl", "nodejs_register_toolchains")

NODE_VERSION = "20.19.0"

NODE_20_REPO = {
    "20.19.0-darwin_arm64": ("node-v20.19.0-darwin-arm64.tar.gz", "node-v20.19.0-darwin-arm64", "c016cd1975a264a29dc1b07c6fbe60d5df0a0c2beb4113c0450e3d998d1a0d9c"),
    "20.19.0-darwin_amd64": ("node-v20.19.0-darwin-x64.tar.gz", "node-v20.19.0-darwin-x64", "a8554af97d6491fdbdabe63d3a1cfb9571228d25a3ad9aed2df856facb131b20"),
    "20.19.0-linux_arm64": ("node-v20.19.0-linux-arm64.tar.xz", "node-v20.19.0-linux-arm64", "dbe339e55eb393955a213e6b872066880bb9feceaa494f4d44c7aac205ec2ab9"),
    "20.19.0-linux_ppc64le": ("node-v20.19.0-linux-ppc64le.tar.xz", "node-v20.19.0-linux-ppc64le", "84937108f005679e60b486ed8e801cebfe923f02b76d8e710463d32f82181f65"),
    "20.19.0-linux_s390x": ("node-v20.19.0-linux-s390x.tar.xz", "node-v20.19.0-linux-s390x", "11f8ee99d792a83bba7b29911e0229dd6cd5e88987d7416346067db1cc76d89a"),
    "20.19.0-linux_amd64": ("node-v20.19.0-linux-x64.tar.xz", "node-v20.19.0-linux-x64", "b4e336584d62abefad31baecff7af167268be9bb7dd11f1297112e6eed3ca0d5"),
    "20.19.0-windows_amd64": ("node-v20.19.0-win-x64.zip", "node-v20.19.0-win-x64", "be72284c7bc62de07d5a9fd0ae196879842c085f11f7f2b60bf8864c0c9d6a4f"),
}

nodejs_register_toolchains(
    name = "nodejs",
    node_repositories = NODE_20_REPO,
    node_version = NODE_VERSION,
)

load("@aspect_rules_js//js:toolchains.bzl", "rules_js_register_toolchains")

rules_js_register_toolchains(
    node_repositories = NODE_20_REPO,
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
        "//:.pnpmfile.cjs",
        "//:package.json",
        "//:pnpm-workspace.yaml",
        "//adev/shared-docs/pipeline/api-gen:package.json",
        "//integration:package.json",
        "//modules:package.json",
        "//packages/animations:package.json",
        "//packages/common:package.json",
        "//packages/compiler:package.json",
        "//packages/compiler-cli:package.json",
        "//packages/compiler-cli/linker/babel/test:package.json",
        "//packages/core:package.json",
        "//packages/core/test/bundling:package.json",
        "//packages/forms:package.json",
        "//packages/localize:package.json",
        "//packages/platform-browser:package.json",
        "//packages/platform-browser-dynamic:package.json",
        "//packages/router:package.json",
        "//packages/upgrade:package.json",
        "//packages/zone.js:package.json",
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
    sha256 = "6b15ac1c69f2c0f1282e41ab469fd63cd40eb2e2d83075e19b68a6a76669773f",
    strip_prefix = "rules_ts-3.6.0",
    url = "https://github.com/aspect-build/rules_ts/releases/download/v3.6.0/rules_ts-v3.6.0.tar.gz",
)

load("@aspect_rules_ts//ts:repositories.bzl", "rules_ts_dependencies")

rules_ts_dependencies(
    # Obtained by: curl --silent https://registry.npmjs.org/typescript/5.8.2 | jq -r '.dist.integrity'
    ts_integrity = "sha512-p1diW6TqL9L07nNxvRMM7hMMw4c5XOo/1ibL4aAIGmSAt9slTE1Xgw5KWuof2uTOvCg9BY7ZRi+GaF+7sfgPeQ==",
    ts_version_from = "//:package.json",
)

http_archive(
    name = "aspect_rules_rollup",
    sha256 = "0b8ac7d97cd660eb9a275600227e9c4268f5904cba962939d1a6ce9a0a059d2e",
    strip_prefix = "rules_rollup-2.0.1",
    url = "https://github.com/aspect-build/rules_rollup/releases/download/v2.0.1/rules_rollup-v2.0.1.tar.gz",
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
    commit = "110186fb5b3fc7646e804e67d4b89122e1421b5f",
    remote = "https://github.com/angular/dev-infra.git",
)

load("@devinfra//bazel:setup_dependencies_1.bzl", "setup_dependencies_1")

setup_dependencies_1()

load("@devinfra//bazel:setup_dependencies_2.bzl", "setup_dependencies_2")

setup_dependencies_2()

git_repository(
    name = "rules_angular",
    commit = "88ddcf8cccbfef57f8cc3dda4881f18ec739428e",
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

git_repository(
    name = "rules_browsers",
    commit = "0952071cdc67acf1124c20c32a9b7e2e85da0aa3",
    remote = "https://github.com/devversion/rules_browsers.git",
)

load("@rules_browsers//setup:step_1.bzl", "rules_browsers_setup_1")

rules_browsers_setup_1()

load("@rules_browsers//setup:step_2.bzl", "rules_browsers_setup_2")

rules_browsers_setup_2()

http_archive(
    name = "aspect_rules_esbuild",
    sha256 = "530adfeae30bbbd097e8af845a44a04b641b680c5703b3bf885cbd384ffec779",
    strip_prefix = "rules_esbuild-0.22.1",
    url = "https://github.com/aspect-build/rules_esbuild/releases/download/v0.22.1/rules_esbuild-v0.22.1.tar.gz",
)

load("@aspect_rules_esbuild//esbuild:dependencies.bzl", "rules_esbuild_dependencies")

rules_esbuild_dependencies()

load("@aspect_rules_esbuild//esbuild:repositories.bzl", "LATEST_ESBUILD_VERSION", "esbuild_register_toolchains")

esbuild_register_toolchains(
    name = "esbuild",
    esbuild_version = LATEST_ESBUILD_VERSION,
)

# Register git toolchains
register_toolchains(
    "@devinfra//bazel/git-toolchain:git_linux_toolchain",
    "@devinfra//bazel/git-toolchain:git_macos_x86_toolchain",
    "@devinfra//bazel/git-toolchain:git_macos_arm64_toolchain",
    "@devinfra//bazel/git-toolchain:git_windows_toolchain",
)

git_repository(
    name = "rules_sass",
    commit = "cafb5de3136cd4e1d832e8814ad5733d68dbad10",
    remote = "https://github.com/devversion/rules_sass.git",
)

load("@rules_sass//src/toolchain:repositories.bzl", "setup_rules_sass")

setup_rules_sass()
