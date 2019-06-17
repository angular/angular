# WARNING: This file is generated and it's not meant to be edited.
# Before making any changes, please read Bazel documentation.
# https://docs.bazel.build/versions/master/be/workspace.html
# The WORKSPACE file tells Bazel that this directory is a "workspace", which is like a project root.
# The content of this file specifies all the external dependencies Bazel needs to perform a build.

####################################
# ESModule imports (and TypeScript imports) can be absolute starting with the workspace name.
# The name of the workspace should match the npm package where we publish, so that these
# imports also make sense when referencing the published package.
workspace(
    name = "project",
    managed_directories = {"@npm": ["node_modules"]},
)

load("@bazel_tools//tools/build_defs/repo:http.bzl", "http_archive")

RULES_NODEJS_VERSION = "0.31.1"
RULES_NODEJS_SHA256 = "e04a82a72146bfbca2d0575947daa60fda1878c8d3a3afe868a8ec39a6b968bb"
http_archive(
    name = "build_bazel_rules_nodejs",
    sha256 = RULES_NODEJS_SHA256,
    url = "https://github.com/bazelbuild/rules_nodejs/releases/download/%s/rules_nodejs-%s.tar.gz" % (RULES_NODEJS_VERSION, RULES_NODEJS_VERSION),
)

# Rules for compiling sass
RULES_SASS_VERSION = "3a4f31c74513ccfacce3f955b5c006352f7e9587"
RULES_SASS_SHA256 = "4c87befcb17282b039ba8341df9a6cc45f461bf05776dcf35c7e40c7e79ce374"
http_archive(
    name = "io_bazel_rules_sass",
#    sha256 = RULES_SASS_SHA256,
#    url = "https://github.com/bazelbuild/rules_sass/archive/%s.zip" % RULES_SASS_VERSION,
#    strip_prefix = "rules_sass-%s" % RULES_SASS_VERSION,
    # TODO: change back to upstream release after https://github.com/bazelbuild/rules_sass/pull/87 merged and released
    strip_prefix = "rules_sass-9862dfc96a4a1f66fe171ef5e043b29853e8445b",
    url = "https://github.com/manekinekko/rules_sass/archive/9862dfc96a4a1f66fe171ef5e043b29853e8445b.zip",
)

####################################
# Load and install our dependencies downloaded above.

load("@build_bazel_rules_nodejs//:defs.bzl", "check_bazel_version", "node_repositories",
    "yarn_install")
check_bazel_version(
    message = """
You no longer need to install Bazel on your machine.
Your project should have a dependency on the @bazel/bazel package which supplies it.
Try running `yarn bazel` instead.
    (If you did run that, check that you've got a fresh `yarn install`)

""",
    minimum_bazel_version = "0.26.0",
)

# Setup the Node repositories. We need a NodeJS version that is more recent than v10.15.0
# because "selenium-webdriver" which is required for "ng e2e" cannot be installed.
# TODO: remove the custom repositories once "rules_nodejs" supports v10.16.0 by default.
node_repositories(
    node_repositories = {
        "10.16.0-darwin_amd64": ("node-v10.16.0-darwin-x64.tar.gz", "node-v10.16.0-darwin-x64", "6c009df1b724026d84ae9a838c5b382662e30f6c5563a0995532f2bece39fa9c"),
        "10.16.0-linux_amd64": ("node-v10.16.0-linux-x64.tar.xz", "node-v10.16.0-linux-x64", "1827f5b99084740234de0c506f4dd2202a696ed60f76059696747c34339b9d48"),
        "10.16.0-windows_amd64": ("node-v10.16.0-win-x64.zip", "node-v10.16.0-win-x64", "aa22cb357f0fb54ccbc06b19b60e37eefea5d7dd9940912675d3ed988bf9a059"),
    },
    node_version = "10.16.0",
)

yarn_install(
    name = "npm",
    data = ["//:angular-metadata.tsconfig.json"],
    package_json = "//:package.json",
    # Temporarily disable node_modules symlinking until the fix for
    # https://github.com/bazelbuild/bazel/issues/8487 makes it into a
    # future Bazel release
    symlink_node_modules = False,
    yarn_lock = "//:yarn.lock",
)

load("@npm//:install_bazel_dependencies.bzl", "install_bazel_dependencies")
install_bazel_dependencies()

load("@npm_bazel_karma//:package.bzl", "rules_karma_dependencies")
rules_karma_dependencies()

load("@io_bazel_rules_webtesting//web:repositories.bzl", "web_test_repositories")
web_test_repositories()

load("@npm_bazel_karma//:browser_repositories.bzl", "browser_repositories")
browser_repositories()

load("@npm_bazel_typescript//:index.bzl", "ts_setup_workspace")
ts_setup_workspace()

load("@io_bazel_rules_sass//sass:sass_repositories.bzl", "sass_repositories")
sass_repositories()
