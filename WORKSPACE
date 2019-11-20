workspace(
    name = "angular_material",
    managed_directories = {"@npm": ["node_modules"]},
)

load("@bazel_tools//tools/build_defs/repo:http.bzl", "http_archive")

# Add NodeJS rules
http_archive(
    name = "build_bazel_rules_nodejs",
    sha256 = "3d7296d834208792fa3b2ded8ec04e75068e3de172fae79db217615bd75a6ff7",
    urls = ["https://github.com/bazelbuild/rules_nodejs/releases/download/0.39.1/rules_nodejs-0.39.1.tar.gz"],
)

# Add sass rules
http_archive(
    name = "io_bazel_rules_sass",
    sha256 = "ad08e8c82aa1f48b72dc295cb83bba33f514cdf24cc7b0e21e9353f20f0dc147",
    strip_prefix = "rules_sass-5d1b26f8cd12c5d75dd359f9291090b341e8fd52",
    # We need to use a version that includes SHA 5d1b26f8cd12c5d75dd359f9291090b341e8fd52 of
    # the "rules_sass" repository as it adds support for workers.
    url = "https://github.com/bazelbuild/rules_sass/archive/5d1b26f8cd12c5d75dd359f9291090b341e8fd52.zip",
)

load("@build_bazel_rules_nodejs//:defs.bzl", "check_bazel_version", "node_repositories", "yarn_install")

# The minimum bazel version to use with this repo is v1.1.0.
check_bazel_version("1.1.0")

node_repositories(
    node_repositories = {
        "12.9.1-darwin_amd64": ("node-v12.9.1-darwin-x64.tar.gz", "node-v12.9.1-darwin-x64", "9aaf29d30056e2233fd15dfac56eec12e8342d91bb6c13d54fb5e599383dddb9"),
        "12.9.1-linux_amd64": ("node-v12.9.1-linux-x64.tar.xz", "node-v12.9.1-linux-x64", "680a1263c9f5f91adadcada549f0a9c29f1b26d09658d2b501c334c3f63719e5"),
        "12.9.1-windows_amd64": ("node-v12.9.1-win-x64.zip", "node-v12.9.1-win-x64", "6a4e54bda091bd02dbd8ff1b9f6671e036297da012a53891e3834d4bf4bed297"),
    },
    node_urls = ["https://nodejs.org/dist/v{version}/{filename}"],
    # For deterministic builds, specify explicit NodeJS and Yarn versions.
    node_version = "12.9.1",
    yarn_repositories = {
        "1.19.1": ("yarn-v1.19.1.tar.gz", "yarn-v1.19.1", "34293da6266f2aae9690d59c2d764056053ff7eebc56b80b8df05010c3da9343"),
    },
    yarn_urls = ["https://github.com/yarnpkg/yarn/releases/download/v{version}/{filename}"],
    yarn_version = "1.19.1",
)

yarn_install(
    name = "npm",
    # We add the postinstall patches file here so that Yarn will rerun whenever
    # the patches script changes.
    data = ["//:tools/bazel/postinstall-patches.js"],
    package_json = "//:package.json",
    yarn_lock = "//:yarn.lock",
)

# Install all bazel dependencies of the @ngdeps npm packages
load("@npm//:install_bazel_dependencies.bzl", "install_bazel_dependencies")

install_bazel_dependencies()

# Setup TypeScript Bazel workspace
load("@npm_bazel_typescript//:index.bzl", "ts_setup_workspace")

ts_setup_workspace()

# Fetch transitive dependencies which are needed to use the karma rules.
load("@npm_bazel_karma//:package.bzl", "npm_bazel_karma_dependencies")

npm_bazel_karma_dependencies()

# Setup web testing. We need to setup a browser because the web testing rules for TypeScript need
# a reference to a registered browser (ideally that's a hermetic version of a browser)
load("@io_bazel_rules_webtesting//web:repositories.bzl", "web_test_repositories")

web_test_repositories()

load("@io_bazel_rules_webtesting//web/versioned:browsers-0.3.2.bzl", "browser_repositories")

browser_repositories(
    chromium = True,
    firefox = True,
)

# Fetch transitive dependencies which are needed to use the Sass rules.
load("@io_bazel_rules_sass//:package.bzl", "rules_sass_dependencies")

rules_sass_dependencies()

# Setup the Sass rule repositories.
load("@io_bazel_rules_sass//:defs.bzl", "sass_repositories")

sass_repositories()

# Bring in bazel_toolchains for RBE setup configuration.
http_archive(
    name = "bazel_toolchains",
    sha256 = "3c1299efcf64a4ecf4f6def7564db28879ad2870632144d77932e7910686d3f3",
    strip_prefix = "bazel-toolchains-1.1.2",
    url = "https://github.com/bazelbuild/bazel-toolchains/archive/1.1.2.tar.gz",
)

load("@bazel_toolchains//repositories:repositories.bzl", bazel_toolchains_repositories = "repositories")

bazel_toolchains_repositories()

load("@bazel_toolchains//rules:rbe_repo.bzl", "rbe_autoconfig")

rbe_autoconfig(
    name = "rbe_default",
    # Need to specify a base container digest in order to ensure that we can use the checked-in
    # platform configurations for the "ubuntu16_04" image. Otherwise the autoconfig rule would
    # need to pull the image and run it in order determine the toolchain configuration.
    # See: https://github.com/bazelbuild/bazel-toolchains/blob/master/rules/rbe_repo.bzl#L229
    base_container_digest = "sha256:1ab40405810effefa0b2f45824d6d608634ccddbf06366760c341ef6fbead011",
    digest = "sha256:0b8fa87db4b8e5366717a7164342a029d1348d2feea7ecc4b18c780bc2507059",
    registry = "marketplace.gcr.io",
    # We can't use the default "ubuntu16_04" RBE image provided by the autoconfig because we need
    # a specific Linux kernel that comes with "libx11" in order to run headless browser tests.
    repository = "google/rbe-ubuntu16-04-webtest",
)
