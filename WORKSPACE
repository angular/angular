workspace(name = "angular")

#
# Download Bazel toolchain dependencies as needed by build actions
#
http_archive(
    name = "build_bazel_rules_typescript",
    sha256 = "1626ee2cc9770af6950bfc77dffa027f9aedf330fe2ea2ee7e504428927bd95d",
    strip_prefix = "rules_typescript-0.17.0",
    url = "https://github.com/bazelbuild/rules_typescript/archive/0.17.0.zip",
)

load("@build_bazel_rules_typescript//:package.bzl", "rules_typescript_dependencies")

rules_typescript_dependencies()

http_archive(
    name = "bazel_toolchains",
    sha256 = "c3b08805602cd1d2b67ebe96407c1e8c6ed3d4ce55236ae2efe2f1948f38168d",
    strip_prefix = "bazel-toolchains-5124557861ebf4c0b67f98180bff1f8551e0b421",
    urls = [
        "https://mirror.bazel.build/github.com/bazelbuild/bazel-toolchains/archive/5124557861ebf4c0b67f98180bff1f8551e0b421.tar.gz",
        "https://github.com/bazelbuild/bazel-toolchains/archive/5124557861ebf4c0b67f98180bff1f8551e0b421.tar.gz",
    ],
)

http_archive(
    name = "io_bazel_rules_sass",
    sha256 = "dbe9fb97d5a7833b2a733eebc78c9c1e3880f676ac8af16e58ccf2139cbcad03",
    strip_prefix = "rules_sass-1.11.0",
    url = "https://github.com/bazelbuild/rules_sass/archive/1.11.0.zip",
)

# This commit matches the version of buildifier in angular/ngcontainer
# If you change this, also check if it matches the version in the angular/ngcontainer
# version in /.circleci/config.yml
BAZEL_BUILDTOOLS_VERSION = "49a6c199e3fbf5d94534b2771868677d3f9c6de9"

http_archive(
    name = "com_github_bazelbuild_buildtools",
    sha256 = "edf39af5fc257521e4af4c40829fffe8fba6d0ebff9f4dd69a6f8f1223ae047b",
    strip_prefix = "buildtools-%s" % BAZEL_BUILDTOOLS_VERSION,
    url = "https://github.com/bazelbuild/buildtools/archive/%s.zip" % BAZEL_BUILDTOOLS_VERSION,
)

# Fetching the Bazel source code allows us to compile the Skylark linter
http_archive(
    name = "io_bazel",
    sha256 = "ace8cced3b21e64a8fdad68508e9b0644201ec848ad583651719841d567fc66d",
    strip_prefix = "bazel-0.17.1",
    url = "https://github.com/bazelbuild/bazel/archive/0.17.1.zip",
)

http_archive(
    name = "io_bazel_skydoc",
    sha256 = "7bfb5545f59792a2745f2523b9eef363f9c3e7274791c030885e7069f8116016",
    strip_prefix = "skydoc-fe2e9f888d28e567fef62ec9d4a93c425526d701",
    # TODO: switch to upstream when https://github.com/bazelbuild/skydoc/pull/103 is merged
    url = "https://github.com/alexeagle/skydoc/archive/fe2e9f888d28e567fef62ec9d4a93c425526d701.zip",
)

# We have a source dependency on the Devkit repository, because it's built with
# Bazel.
# This allows us to edit sources and have the effect appear immediately without
# re-packaging or "npm link"ing.
# Even better, things like aspects will visit the entire graph including
# ts_library rules in the devkit repository.
http_archive(
    name = "angular_cli",
    sha256 = "8cf320ea58c321e103f39087376feea502f20eaf79c61a4fdb05c7286c8684fd",
    strip_prefix = "angular-cli-6.1.0-rc.0",
    url = "https://github.com/angular/angular-cli/archive/v6.1.0-rc.0.zip",
)

http_archive(
    name = "org_brotli",
    sha256 = "774b893a0700b0692a76e2e5b7e7610dbbe330ffbe3fe864b4b52ca718061d5a",
    strip_prefix = "brotli-1.0.5",
    url = "https://github.com/google/brotli/archive/v1.0.5.zip",
)

#
# Point Bazel to WORKSPACEs that live in subdirectories
#

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

#
# Load and install our dependencies downloaded above.
#

load("@build_bazel_rules_nodejs//:defs.bzl", "check_bazel_version", "node_repositories")

check_bazel_version("0.17.0", """
If you are on a Mac and using Homebrew, there is a breaking change to the installation in Bazel 0.16
See https://blog.bazel.build/2018/08/22/bazel-homebrew.html

""")

node_repositories(
    node_version = "10.9.0",
    package_json = ["//:package.json"],
    preserve_symlinks = True,
    yarn_version = "1.9.2",
)

load("@io_bazel_rules_go//go:def.bzl", "go_rules_dependencies", "go_register_toolchains")

go_rules_dependencies()

go_register_toolchains()

load("@io_bazel_rules_webtesting//web:repositories.bzl", "browser_repositories", "web_test_repositories")

web_test_repositories()

browser_repositories(
    chromium = True,
    firefox = True,
)

load("@build_bazel_rules_typescript//:defs.bzl", "ts_setup_workspace")

ts_setup_workspace()

load("@angular//:index.bzl", "ng_setup_workspace")

ng_setup_workspace()

##################################
# Skylark documentation generation

load("@io_bazel_rules_sass//sass:sass_repositories.bzl", "sass_repositories")

sass_repositories()

load("@io_bazel_skydoc//skylark:skylark.bzl", "skydoc_repositories")

skydoc_repositories()

##################################
# Prevent Bazel from trying to build rxjs under angular devkit
local_repository(
    name = "rxjs_ignore_nested_1",
    path = "node_modules/@angular-devkit/core/node_modules/rxjs/src",
)
local_repository(
    name = "rxjs_ignore_nested_2",
    path = "node_modules/@angular-devkit/schematics/node_modules/rxjs/src",
)
