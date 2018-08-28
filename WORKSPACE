workspace(name = "angular_material")

# Add nodejs rules
http_archive(
  name = "build_bazel_rules_nodejs",
  url = "https://github.com/bazelbuild/rules_nodejs/archive/0.10.1.zip",
  strip_prefix = "rules_nodejs-0.10.1",
  sha256 = "634206524d90dc03c52392fa3f19a16637d2bcf154910436fe1d669a0d9d7b9c",
)

# NOTE: this rule installs nodejs, npm, and yarn, but does NOT install
# your npm dependencies. You must still run the package manager.
load("@build_bazel_rules_nodejs//:defs.bzl", "check_bazel_version", "node_repositories")

check_bazel_version("0.15.0")
node_repositories(package_json = ["//:package.json"])

# Add sass rules
http_archive(
  name = "io_bazel_rules_sass",
  url = "https://github.com/bazelbuild/rules_sass/archive/0.1.0.zip",
  strip_prefix = "rules_sass-0.1.0",
  sha256 = "b243c4d64f054c174051785862ab079050d90b37a1cef7da93821c6981cb9ad4",
)

load("@io_bazel_rules_sass//sass:sass_repositories.bzl", "sass_repositories")
sass_repositories()

# Add TypeScript rules
http_archive(
  name = "build_bazel_rules_typescript",
  url = "https://github.com/bazelbuild/rules_typescript/archive/0.15.1.zip",
  strip_prefix = "rules_typescript-0.15.1",
  sha256 = "3792cc20ef13bb1d1d8b1760894c3320f02a87843e3a04fed7e8e454a75328b6",
)

http_archive(
  name = "io_bazel_rules_webtesting",
  url = "https://github.com/bazelbuild/rules_webtesting/archive/7ffe970bbf380891754487f66c3d680c087d67f2.zip",
  strip_prefix = "rules_webtesting-7ffe970bbf380891754487f66c3d680c087d67f2",
  sha256 = "4fb0dca8c9a90547891b7ef486592775a523330fc4555c88cd8f09270055c2ce",
)

# Setup TypeScript Bazel workspace
load("@build_bazel_rules_typescript//:defs.bzl", "ts_setup_workspace")
ts_setup_workspace()

# Add Angular rules
local_repository(
  name = "angular",
  path = "node_modules/@angular/bazel",
)

# Add rxjs
local_repository(
  name = "rxjs",
  path = "node_modules/rxjs/src",
)


# This commit matches the version of buildifier in angular/ngcontainer
# If you change this, also check if it matches the version in the angular/ngcontainer
# version in /.circleci/config.yml
BAZEL_BUILDTOOLS_VERSION = "82b21607e00913b16fe1c51bec80232d9d6de31c"
