workspace(name = "angular")

http_archive(
    name = "build_bazel_rules_nodejs",
    url = "https://github.com/bazelbuild/rules_nodejs/archive/1931156c232a08356dfda02e9c8b0275c2e63c00.zip",
    strip_prefix = "rules_nodejs-1931156c232a08356dfda02e9c8b0275c2e63c00",
    sha256 = "9cfe33276a6ac0076ee9ee159c4a2576f9851c0f437435b5ac19b2e592493078",
)

load("@build_bazel_rules_nodejs//:defs.bzl", "check_bazel_version", "node_repositories", "yarn_install")

check_bazel_version("0.11.1")
node_repositories(package_json = ["//:package.json"])

yarn_install(
    name = "ts-api-guardian_runtime_deps",
    package_json = "//tools/ts-api-guardian:package.json",
    yarn_lock = "//tools/ts-api-guardian:yarn.lock",
)

http_archive(
    name = "build_bazel_rules_typescript",
    url = "https://github.com/bazelbuild/rules_typescript/archive/0.11.1.zip",
    strip_prefix = "rules_typescript-0.11.1",
    sha256 = "7406bea7954e1c906f075115dfa176551a881119f6820b126ea1eacb09f34a1a",
)

load("@build_bazel_rules_typescript//:defs.bzl", "ts_setup_workspace")

ts_setup_workspace()

local_repository(
    name = "rxjs",
    path = "node_modules/rxjs/src",
)

# Point to the integration test workspace just so that Bazel doesn't descend into it
# when expanding the //... pattern
local_repository(
    name = "bazel_integration_test",
    path = "integration/bazel",
)

# This commit matches the version of buildifier in angular/ngcontainer
# If you change this, also check if it matches the version in the angular/ngcontainer
# version in /.circleci/config.yml
BAZEL_BUILDTOOLS_VERSION = "70bc7843bb9950fece2bc014ed16de03419e36e2"

http_archive(
    name = "com_github_bazelbuild_buildtools",
    url = "https://github.com/bazelbuild/buildtools/archive/%s.zip" % BAZEL_BUILDTOOLS_VERSION,
    strip_prefix = "buildtools-%s" % BAZEL_BUILDTOOLS_VERSION,
    sha256 = "367c23a5fe7fc2a7cb57863d3718b4149f0e57426c48c8ad54c45348a0b53cc1",
)

http_archive(
    name = "io_bazel_rules_go",
    url = "https://github.com/bazelbuild/rules_go/releases/download/0.10.3/rules_go-0.10.3.tar.gz",
    sha256 = "feba3278c13cde8d67e341a837f69a029f698d7a27ddbb2a202be7a10b22142a",
)

load("@io_bazel_rules_go//go:def.bzl", "go_rules_dependencies", "go_register_toolchains")

go_rules_dependencies()

go_register_toolchains()

# Fetching the Bazel source code allows us to compile the Skylark linter
http_archive(
    name = "io_bazel",
    url = "https://github.com/bazelbuild/bazel/archive/5a35e72f9e97c06540c479f8c31512fb4656202f.zip",
    strip_prefix = "bazel-5a35e72f9e97c06540c479f8c31512fb4656202f",
    sha256 = "ed33a52874c14e3b487fb50f390c541fab9c81a33d986d38fb01766a66dbcd21",
)

# We have a source dependency on the Devkit repository, because it's built with
# Bazel.
# This allows us to edit sources and have the effect appear immediately without
# re-packaging or "npm link"ing.
# Even better, things like aspects will visit the entire graph including
# ts_library rules in the devkit repository.
http_archive(
    name = "angular_devkit",
    url = "https://github.com/angular/devkit/archive/v0.3.1.zip",
    strip_prefix = "devkit-0.3.1",
    sha256 = "31d4b597fe9336650acf13df053c1c84dcbe9c29c6a833bcac3819cd3fd8cad3",
)

http_archive(
    name = "org_brotli",
    url = "https://github.com/google/brotli/archive/c6333e1e79fb62ea088443f192293f964409b04e.zip",
    strip_prefix = "brotli-c6333e1e79fb62ea088443f192293f964409b04e",
    sha256 = "3f781988dee7dd3bcce2bf238294663cfaaf3b6433505bdb762e24d0a284d1dc",
)
