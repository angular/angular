workspace(name = "angular")

#
# Download Bazel toolchain dependencies as needed by build actions
#
http_archive(
    name = "build_bazel_rules_nodejs",
    urls = ["https://github.com/bazelbuild/rules_nodejs/archive/0.12.0.zip"],
    strip_prefix = "rules_nodejs-0.12.0",
    sha256 = "2977cdbc8ae0eed7d4186385af56a50a3321a549e2136a959998bba89d2edb6e",
)

http_archive(
    name = "build_bazel_rules_typescript",
    url = "https://github.com/bazelbuild/rules_typescript/archive/0.16.1.zip",
    strip_prefix = "rules_typescript-0.16.1",
    sha256 = "5b2b0bc63cfcffe7bf97cad2dad3b26a73362f806de66207051f66c87956a995",
)
load("@build_bazel_rules_typescript//:package.bzl", "rules_typescript_dependencies")
rules_typescript_dependencies()

http_archive(
  name = "bazel_toolchains",
  urls = [
    "https://mirror.bazel.build/github.com/bazelbuild/bazel-toolchains/archive/5124557861ebf4c0b67f98180bff1f8551e0b421.tar.gz",
    "https://github.com/bazelbuild/bazel-toolchains/archive/5124557861ebf4c0b67f98180bff1f8551e0b421.tar.gz",
  ],
  strip_prefix = "bazel-toolchains-5124557861ebf4c0b67f98180bff1f8551e0b421",
  sha256 = "c3b08805602cd1d2b67ebe96407c1e8c6ed3d4ce55236ae2efe2f1948f38168d",
)

http_archive(
    name = "io_bazel_rules_sass",
    url = "https://github.com/bazelbuild/rules_sass/archive/1.11.0.zip",
    strip_prefix = "rules_sass-1.11.0",
    sha256 = "dbe9fb97d5a7833b2a733eebc78c9c1e3880f676ac8af16e58ccf2139cbcad03",
)

# This commit matches the version of buildifier in angular/ngcontainer
# If you change this, also check if it matches the version in the angular/ngcontainer
# version in /.circleci/config.yml
BAZEL_BUILDTOOLS_VERSION = "82b21607e00913b16fe1c51bec80232d9d6de31c"

http_archive(
    name = "com_github_bazelbuild_buildtools",
    url = "https://github.com/bazelbuild/buildtools/archive/%s.zip" % BAZEL_BUILDTOOLS_VERSION,
    strip_prefix = "buildtools-%s" % BAZEL_BUILDTOOLS_VERSION,
    sha256 = "edb24c2f9c55b10a820ec74db0564415c0cf553fa55e9fc709a6332fb6685eff",
)

# Fetching the Bazel source code allows us to compile the Skylark linter
http_archive(
    name = "io_bazel",
    url = "https://github.com/bazelbuild/bazel/archive/968f87900dce45a7af749a965b72dbac51b176b3.zip",
    strip_prefix = "bazel-968f87900dce45a7af749a965b72dbac51b176b3",
    sha256 = "e373d2ae24955c1254c495c9c421c009d88966565c35e4e8444c082cb1f0f48f",
)

http_archive(
    name = "io_bazel_skydoc",
    # TODO: switch to upstream when https://github.com/bazelbuild/skydoc/pull/103 is merged
    url = "https://github.com/alexeagle/skydoc/archive/fe2e9f888d28e567fef62ec9d4a93c425526d701.zip",
    strip_prefix = "skydoc-fe2e9f888d28e567fef62ec9d4a93c425526d701",
    sha256 = "7bfb5545f59792a2745f2523b9eef363f9c3e7274791c030885e7069f8116016",
)

# We have a source dependency on the Devkit repository, because it's built with
# Bazel.
# This allows us to edit sources and have the effect appear immediately without
# re-packaging or "npm link"ing.
# Even better, things like aspects will visit the entire graph including
# ts_library rules in the devkit repository.
http_archive(
    name = "angular_cli",
    url = "https://github.com/angular/angular-cli/archive/v6.1.0-rc.0.zip",
    strip_prefix = "angular-cli-6.1.0-rc.0",
    sha256 = "8cf320ea58c321e103f39087376feea502f20eaf79c61a4fdb05c7286c8684fd",
)

http_archive(
    name = "org_brotli",
    url = "https://github.com/google/brotli/archive/v1.0.5.zip",
    strip_prefix = "brotli-1.0.5",
    sha256 = "774b893a0700b0692a76e2e5b7e7610dbbe330ffbe3fe864b4b52ca718061d5a",
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

check_bazel_version("0.16.0", """
If you are on a Mac and using Homebrew, there is a breaking change to the installation in Bazel 0.16
See https://blog.bazel.build/2018/08/22/bazel-homebrew.html

""")
node_repositories(
  package_json = ["//:package.json"],
  preserve_symlinks = True,
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
