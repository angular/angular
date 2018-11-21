workspace(name = "angular")

load(
    "//packages/bazel:package.bzl",
    "rules_angular_dependencies",
    "rules_angular_dev_dependencies",
)

# Uncomment for local bazel rules development
#local_repository(
#    name = "build_bazel_rules_nodejs",
#    path = "../rules_nodejs",
#)
#local_repository(
#    name = "build_bazel_rules_typescript",
#    path = "../rules_typescript",
#)

# Custom commit providing a rollup_bundle rule which supports 'es2015' entry points
http_archive(
    name = "build_bazel_rules_nodejs",
    url = "https://github.com/gregmagolan/rules_nodejs/archive/a43f80140f89cdb1e332a7775edda1e73ad529f2.zip",
    strip_prefix = "rules_nodejs-a43f80140f89cdb1e332a7775edda1e73ad529f2",
)

# Angular Bazel users will call this function
rules_angular_dependencies()
# These are the dependencies only for us
rules_angular_dev_dependencies()

# Point to the integration test workspace just so that Bazel doesn't descend into it
# when expanding the //... pattern
local_repository(
    name = "bazel_integration_test",
    path = "integration/bazel",
)

#
# Load and install our dependencies downloaded above.
#
load("@build_bazel_rules_nodejs//:defs.bzl", "check_bazel_version", "node_repositories", "yarn_install")

check_bazel_version("0.18.0", """
If you are on a Mac and using Homebrew, there is a breaking change to the installation in Bazel 0.16
See https://blog.bazel.build/2018/08/22/bazel-homebrew.html

""")

node_repositories(
    node_version = "10.9.0",
    package_json = ["//:package.json"],
    preserve_symlinks = True,
    yarn_version = "1.12.1",
)

local_repository(
  name = "npm",
  path = "tools/npm_workspace",
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
