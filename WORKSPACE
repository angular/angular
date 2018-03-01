workspace(name = "angular")

# Using a pre-release snapshot to pick up a commit that makes all nodejs_binary
# programs produce source-mapped stack traces and uglify sourcemaps.
RULES_NODEJS_VERSION = "4303cbef12e5e252ad66cc35cff1123e3a44ee83"

http_archive(
    name = "build_bazel_rules_nodejs",
    url = "https://github.com/bazelbuild/rules_nodejs/archive/%s.zip" % RULES_NODEJS_VERSION,
    strip_prefix = "rules_nodejs-%s" % RULES_NODEJS_VERSION,
    sha256 = "fccb9a7122f339d89c9994dc0fea33c737dd76e66281d0da0cb841da5f1edec7",
)

load("@build_bazel_rules_nodejs//:defs.bzl", "check_bazel_version", "node_repositories")

check_bazel_version("0.9.0")
node_repositories(package_json = ["//:package.json"])

RULES_TYPESCRIPT_VERSION = "d3cc5cd72d89aee0e4c2553ae1b99c707ecbef4e"

http_archive(
    name = "build_bazel_rules_typescript",
    url = "https://github.com/bazelbuild/rules_typescript/archive/%s.zip" % RULES_TYPESCRIPT_VERSION,
    strip_prefix = "rules_typescript-%s" % RULES_TYPESCRIPT_VERSION,
    sha256 = "a233fcca41c3e59f639ac71c396edb30e9e9716cf8ed5fb20b51ff8910d5d895",
)

load("@build_bazel_rules_typescript//:defs.bzl", "ts_setup_workspace")

ts_setup_workspace()

local_repository(
    name = "rxjs",
    path = "node_modules/rxjs/src",
)

# This commit matches the version of buildifier in angular/ngcontainer
# If you change this, also check if it matches the version in the angular/ngcontainer
# version in /.circleci/config.yml
BAZEL_BUILDTOOLS_VERSION = "b3b620e8bcff18ed3378cd3f35ebeb7016d71f71"

http_archive(
    name = "com_github_bazelbuild_buildtools",
    url = "https://github.com/bazelbuild/buildtools/archive/%s.zip" % BAZEL_BUILDTOOLS_VERSION,
    strip_prefix = "buildtools-%s" % BAZEL_BUILDTOOLS_VERSION,
    sha256 = "dad19224258ed67cbdbae9b7befb785c3b966e5a33b04b3ce58ddb7824b97d73",
)

http_archive(
    name = "io_bazel_rules_go",
    url = "https://github.com/bazelbuild/rules_go/releases/download/0.7.1/rules_go-0.7.1.tar.gz",
    sha256 = "341d5eacef704415386974bc82a1783a8b7ffbff2ab6ba02375e1ca20d9b031c",
)

load("@io_bazel_rules_go//go:def.bzl", "go_rules_dependencies", "go_register_toolchains")

go_rules_dependencies()

go_register_toolchains()

# Fetching the Bazel source code allows us to compile the Skylark linter
http_archive(
    name = "io_bazel",
    url = "https://github.com/bazelbuild/bazel/archive/9755c72b48866ed034bd28aa033e9abd27431b1e.zip",
    strip_prefix = "bazel-9755c72b48866ed034bd28aa033e9abd27431b1e",
    sha256 = "5b8443fc3481b5fcd9e7f348e1dd93c1397f78b223623c39eb56494c55f41962",
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
    url = "https://github.com/google/brotli/archive/v1.0.2.zip",
    strip_prefix = "brotli-1.0.2",
    sha256 = "b43d5d6bc40f2fa6c785b738d86c6bbe022732fe25196ebbe43b9653a025920d",
)
