workspace(
    name = "angular_material",
    managed_directories = {"@npm": ["node_modules"]},
)

load("@bazel_tools//tools/build_defs/repo:http.bzl", "http_archive")

# Add NodeJS rules
http_archive(
    name = "build_bazel_rules_nodejs",
    sha256 = "84abf7ac4234a70924628baa9a73a5a5cbad944c4358cf9abdb4aab29c9a5b77",
    urls = ["https://github.com/bazelbuild/rules_nodejs/releases/download/1.7.0/rules_nodejs-1.7.0.tar.gz"],
)

# Add sass rules
http_archive(
    name = "io_bazel_rules_sass",
    # Patch `rules_sass` to work around a bug that causes error messages to be not
    # printed in worker mode: https://github.com/bazelbuild/rules_sass/issues/96.
    # TODO(devversion): remove this patch once the Sass Node entry-point returns a `Promise`.
    patches = ["//tools/postinstall:sass_worker_async.patch"],
    sha256 = "c78be58f5e0a29a04686b628cf54faaee0094322ae0ac99da5a8a8afca59a647",
    strip_prefix = "rules_sass-1.25.0",
    urls = [
        "https://github.com/bazelbuild/rules_sass/archive/1.25.0.zip",
    ],
)

load("@build_bazel_rules_nodejs//:index.bzl", "check_bazel_version", "node_repositories", "yarn_install")

# The minimum bazel version to use with this repo is v3.1.0.
check_bazel_version("3.1.0")

node_repositories(
    node_repositories = {
        "12.9.1-darwin_amd64": ("node-v12.9.1-darwin-x64.tar.gz", "node-v12.9.1-darwin-x64", "9aaf29d30056e2233fd15dfac56eec12e8342d91bb6c13d54fb5e599383dddb9"),
        "12.9.1-linux_amd64": ("node-v12.9.1-linux-x64.tar.xz", "node-v12.9.1-linux-x64", "680a1263c9f5f91adadcada549f0a9c29f1b26d09658d2b501c334c3f63719e5"),
        "12.9.1-windows_amd64": ("node-v12.9.1-win-x64.zip", "node-v12.9.1-win-x64", "6a4e54bda091bd02dbd8ff1b9f6671e036297da012a53891e3834d4bf4bed297"),
    },
    node_urls = ["https://nodejs.org/dist/v{version}/{filename}"],
    node_version = "12.9.1",
    # We do not need to define a specific yarn version as bazel will respect the .yarnrc file
    # and run the version of yarn defined at the set-path value.
    # Since bazel runs yarn from the working directory of the package.json, and our .yarnrc
    # file is in the same directory, it correctly discovers and respects it.  Additionally,
    # it ensures that the yarn environment variable to detect if yarn has already followed
    # the set-path value is reset.
)

yarn_install(
    name = "npm",
    # Redirects Yarn `stdout` output to `stderr`. This ensures that stdout is not accidentally
    # polluted when Bazel runs Yarn. Workaround until the upstream fix is available:
    # https://github.com/bazelbuild/bazel/pull/10611.
    args = ["1>&2"],
    # We add the postinstall patches file, and ngcc main fields update script here so
    # that Yarn will rerun whenever one of these files has been modified.
    data = [
        "//:tools/postinstall/apply-patches.js",
        "//:tools/postinstall/update-ngcc-main-fields.js",
    ],
    package_json = "//:package.json",
    quiet = False,
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
    sha256 = "144290c4166bd67e76a54f96cd504ed86416ca3ca82030282760f0823c10be48",
    strip_prefix = "bazel-toolchains-3.1.1",
    url = "https://github.com/bazelbuild/bazel-toolchains/archive/3.1.1.tar.gz",
)

load("@bazel_toolchains//repositories:repositories.bzl", bazel_toolchains_repositories = "repositories")

bazel_toolchains_repositories()

load("@bazel_toolchains//rules:rbe_repo.bzl", "rbe_autoconfig")

rbe_autoconfig(
    name = "rbe_default",
    # Need to specify a base container digest in order to ensure that we can use the checked-in
    # platform configurations for the "ubuntu16_04" image. Otherwise the autoconfig rule would
    # need to pull the image and run it in order determine the toolchain configuration.
    # See: https://github.com/bazelbuild/bazel-toolchains/blob/master/configs/ubuntu16_04_clang/versions.bzl#L9
    base_container_digest = "sha256:b516a2d69537cb40a7c6a7d92d0008abb29fba8725243772bdaf2c83f1be2272",
    digest = "sha256:0b8fa87db4b8e5366717a7164342a029d1348d2feea7ecc4b18c780bc2507059",
    registry = "marketplace.gcr.io",
    # We can't use the default "ubuntu16_04" RBE image provided by the autoconfig because we need
    # a specific Linux kernel that comes with "libx11" in order to run headless browser tests.
    repository = "google/rbe-ubuntu16-04-webtest",
)

# Load pinned rules_webtesting browser versions for tests.
#
# TODO(wagnermaciel): deduplicate browsers - this will load another version of chromium in the
# repository. We probably want to use the chromium version loaded here (from dev-infra) as that
# one has RBE improvements.
load("@npm_angular_dev_infra_private//browsers:browser_repositories.bzl", _dev_infra_browser_repositories = "browser_repositories")

_dev_infra_browser_repositories()
