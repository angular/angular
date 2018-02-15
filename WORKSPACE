workspace(name = "angular")

# Using a pre-release snapshot to pick up a commit that makes all nodejs_binary
# programs produce source-mapped stack traces.
RULES_NODEJS_VERSION = "926349cea4cd360afcd5647ccdd09d2d2fb471aa"

http_archive(
    name = "build_bazel_rules_nodejs",
    url = "https://github.com/bazelbuild/rules_nodejs/archive/%s.zip" % RULES_NODEJS_VERSION,
    strip_prefix = "rules_nodejs-%s" % RULES_NODEJS_VERSION,
    sha256 = "5ba3c8c209078c2e3f0c6aa4abd01a1a561f92a5bfda04e25604af5f4734d69d",
)

load("@build_bazel_rules_nodejs//:defs.bzl", "check_bazel_version", "node_repositories")

check_bazel_version("0.9.0")
node_repositories(package_json = ["//:package.json"])

git_repository(
    name = "build_bazel_rules_typescript",
    commit = "d3cc5cd72d89aee0e4c2553ae1b99c707ecbef4e",
    remote = "https://github.com/bazelbuild/rules_typescript",
)

load("@build_bazel_rules_typescript//:defs.bzl", "ts_setup_workspace")

ts_setup_workspace()

local_repository(
    name = "rxjs",
    path = "node_modules/rxjs/src",
)

git_repository(
    name = "com_github_bazelbuild_buildtools",
    remote = "https://github.com/bazelbuild/buildtools.git",
    # Note, this commit matches the version of buildifier in angular/ngcontainer
    # If you change this, also check if it matches the version in the angular/ngcontainer
    # version in /.circleci/config.yml
    commit = "b3b620e8bcff18ed3378cd3f35ebeb7016d71f71",
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
