workspace(name = "angular")

load(
    "//packages/bazel:package.bzl", 
    "rules_angular_dependencies",
    "rules_angular_dev_dependencies",
)

# Angular Bazel users will call this function
rules_angular_dependencies()
# These are the dependencies only for us
rules_angular_dev_dependencies()

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

# Prevent Bazel from trying to build rxjs under angular devkit
# TODO(alexeagle): remove after Bazel 0.18 upgrade
local_repository(
    name = "rxjs_ignore_nested_1",
    path = "node_modules/@angular-devkit/core/node_modules/rxjs/src",
)
local_repository(
    name = "rxjs_ignore_nested_2",
    path = "node_modules/@angular-devkit/schematics/node_modules/rxjs/src",
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
