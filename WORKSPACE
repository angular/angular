workspace(
    name = "angular",
    managed_directories = {
        "@npm": ["node_modules"],
        "@aio_npm": ["aio/node_modules"],
    },
)

load("@bazel_tools//tools/build_defs/repo:http.bzl", "http_archive")
load("//:yarn.bzl", "YARN_LABEL")

# Add a patch fix for rules_webtesting v0.3.5 required for enabling runfiles on Windows.
# TODO: Remove the http_archive for this transitive dependency when a release is cut
# for https://github.com/bazelbuild/rules_webtesting/commit/581b1557e382f93419da6a03b91a45c2ac9a9ec8
# and the version is updated in rules_nodejs.
http_archive(
    name = "io_bazel_rules_webtesting",
    patch_args = ["-p1"],
    patches = [
        "//:tools/bazel-repo-patches/rules_webtesting__windows_runfiles_fix.patch",
    ],
    sha256 = "e9abb7658b6a129740c0b3ef6f5a2370864e102a5ba5ffca2cea565829ed825a",
    urls = ["https://github.com/bazelbuild/rules_webtesting/releases/download/0.3.5/rules_webtesting.tar.gz"],
)

http_archive(
    name = "build_bazel_rules_nodejs",
    patches = [
        # TODO(devversion): remove when https://github.com/bazelbuild/rules_nodejs/pull/3605 is available.
        "//tools:bazel-repo-patches/rules_nodejs__#3605.patch",
        "//tools/esm-interop:patches/bazel/nodejs_binary_esm_support.patch",
    ],
    sha256 = "c29944ba9b0b430aadcaf3bf2570fece6fc5ebfb76df145c6cdad40d65c20811",
    urls = ["https://github.com/bazelbuild/rules_nodejs/releases/download/5.7.0/rules_nodejs-5.7.0.tar.gz"],
)

load("@build_bazel_rules_nodejs//:repositories.bzl", "build_bazel_rules_nodejs_dependencies")

build_bazel_rules_nodejs_dependencies()

# The PKG rules are needed to build tar packages for integration tests. The builtin
# rule in `@bazel_tools` is not Windows compatible and outdated.
http_archive(
    name = "rules_pkg",
    sha256 = "62eeb544ff1ef41d786e329e1536c1d541bb9bcad27ae984d57f18f314018e66",
    urls = [
        "https://mirror.bazel.build/github.com/bazelbuild/rules_pkg/releases/download/0.6.0/rules_pkg-0.6.0.tar.gz",
        "https://github.com/bazelbuild/rules_pkg/releases/download/0.6.0/rules_pkg-0.6.0.tar.gz",
    ],
)

# Fetch Aspect lib for utilities like write_source_files
http_archive(
    name = "aspect_bazel_lib",
    sha256 = "be236556c7b9c7b91cb370e837fdcec62b6e8893408cd4465ae883c9d7c67024",
    strip_prefix = "bazel-lib-1.18.0",
    url = "https://github.com/aspect-build/bazel-lib/archive/refs/tags/v1.18.0.tar.gz",
)

# Download cli source from angular/cli-builds for doc generation at a specific tag or commit.
# If the ref is a commit sha, use the full sha instead of the abbreviated form. Tags, which
# hold an abbreviated sha by convention in cli-builds, can continue to use the short form.
CLI_SRC_REF = "6ccbc6b4cba4fde7898b67d2e195a1ea3bf4553e"

http_archive(
    name = "angular_cli_src",
    build_file_content = """
# Include files used in doc generation
filegroup(
    name = "files_for_docgen",
    srcs = glob([
        "help/**/*.json",
        "package.json",
    ]),
    visibility = ["//visibility:public"],
)
""",
    # Run the following command to calculate the sha256, substituting the CLI_SRC_REF
    # wget -O- -q https://github.com/angular/cli-builds/archive/{CLI_SRC_REF}.tar.gz | sha256sum
    # Alternatively, just remove the parameter and bazel debug will output the sha as a suggestion.
    sha256 = "6558e1774904719d0615f01b88368d7fe3a927ea1e54cb0436e7957bc8f6d0a6",
    strip_prefix = "cli-builds-%s" % CLI_SRC_REF,
    url = "https://github.com/angular/cli-builds/archive/%s.tar.gz" % CLI_SRC_REF,
)

# Setup the Node.js toolchain.
load("@rules_nodejs//nodejs:repositories.bzl", "nodejs_register_toolchains")

nodejs_register_toolchains(
    name = "nodejs",
    node_version = "16.13.0",
)

# Download npm dependencies.
load("@build_bazel_rules_nodejs//:index.bzl", "yarn_install")
load("//integration:npm_package_archives.bzl", "npm_package_archives")

yarn_install(
    name = "npm",
    # Note that we add the postinstall scripts here so that the dependencies are re-installed
    # when the postinstall patches are modified.
    data = [
        YARN_LABEL,
        "//:.yarnrc",
        "//:scripts/puppeteer-chromedriver-versions.js",
        "//:scripts/webdriver-manager-update.js",
        "//tools:postinstall-patches.js",
        "//tools/esm-interop:patches/npm/@angular+build-tooling+0.0.0-2fe6d743f60e2e1ba91f9e49c417927a46dcd90f.patch",
        "//tools/esm-interop:patches/npm/@bazel+concatjs+5.7.1.patch",
        "//tools/esm-interop:patches/npm/@bazel+esbuild+5.7.1.patch",
        "//tools/esm-interop:patches/npm/rxjs+6.6.7.patch",
    ],
    # Currently disabled due to:
    #  1. Missing Windows support currently.
    #  2. Incompatibilites with the `ts_library` rule.
    exports_directories_only = False,
    manual_build_file_contents = npm_package_archives(),
    package_json = "//:package.json",
    # We prefer to symlink the `node_modules` to only maintain a single install.
    # See https://github.com/angular/dev-infra/pull/446#issuecomment-1059820287 for details.
    symlink_node_modules = True,
    yarn = YARN_LABEL,
    yarn_lock = "//:yarn.lock",
)

yarn_install(
    name = "aio_npm",
    # Note that we add the postinstall scripts here so that the dependencies are re-installed
    # when the postinstall patches are modified.
    data = [
        YARN_LABEL,
        "//:.yarnrc",
        "//aio:tools/cli-patches/bazel-architect-output.patch",
        "//aio:tools/cli-patches/patch.js",
    ],
    # Currently disabled due to:
    #  1. Missing Windows support currently.
    #  2. Incompatibilites with the `ts_library` rule.
    exports_directories_only = False,
    manual_build_file_contents = npm_package_archives(),
    package_json = "//aio:package.json",
    # We prefer to symlink the `node_modules` to only maintain a single install.
    # See https://github.com/angular/dev-infra/pull/446#issuecomment-1059820287 for details.
    symlink_node_modules = True,
    yarn = YARN_LABEL,
    yarn_lock = "//aio:yarn.lock",
)

yarn_install(
    name = "aio_example_deps",
    # Rename the default js_library target from "node_modules" as this obscures the
    # the source directory stamped as a filegroup in the manual BUILD contents below.
    all_node_modules_target_name = "node_modules_all",
    data = [
        YARN_LABEL,
        "//:.yarnrc",
    ],
    # Disabled because, when False, yarn_install preserves the node_modules folder
    # with bin symlinks in the external repository. This is needed to link the shared
    # set of deps for example e2es.
    exports_directories_only = False,
    manual_build_file_contents = """\
filegroup(
    name = "node_modules_files",
    srcs = ["node_modules"],
)
""",
    package_json = "//aio/tools/examples/shared:package.json",
    yarn = YARN_LABEL,
    yarn_lock = "//aio/tools/examples/shared:yarn.lock",
)

load("@aspect_bazel_lib//lib:repositories.bzl", "aspect_bazel_lib_dependencies")

aspect_bazel_lib_dependencies()

# Load protractor dependencies
load("@npm//@bazel/protractor:package.bzl", "npm_bazel_protractor_dependencies")

npm_bazel_protractor_dependencies()

# Setup the rules_webtesting toolchain
load("@io_bazel_rules_webtesting//web:repositories.bzl", "web_test_repositories")

web_test_repositories()

load("@npm//@angular/build-tooling/bazel/browsers:browser_repositories.bzl", "browser_repositories")

browser_repositories()

load("@build_bazel_rules_nodejs//toolchains/esbuild:esbuild_repositories.bzl", "esbuild_repositories")

esbuild_repositories(
    npm_repository = "npm",
)

load("@rules_pkg//:deps.bzl", "rules_pkg_dependencies")

rules_pkg_dependencies()

load("//packages/common/locales/generate-locales-tool:cldr-data.bzl", "cldr_json_data_repository", "cldr_xml_data_repository")

cldr_major_version = "41"

cldr_json_data_repository(
    name = "cldr_json_data",
    urls = {
        "https://github.com/unicode-org/cldr-json/releases/download/%s.0.0/cldr-%s.0.0-json-full.zip" % (cldr_major_version, cldr_major_version): "649b76647269e32b1b0a5f7b6eed52e9e63a1581f1afdcf4f6771e49c9713614",
    },
)

cldr_xml_data_repository(
    name = "cldr_xml_data",
    urls = {
        "https://github.com/unicode-org/cldr/releases/download/release-%s/cldr-common-%s.0.zip" % (cldr_major_version, cldr_major_version): "823c6170c41e2de2c229574e8a436332d25f1c9723409867fe721e00bc92d853",
    },
)

# sass rules
http_archive(
    name = "io_bazel_rules_sass",
    sha256 = "618f0b7aae019c149ac2ff4142a66c110de116fb5c173dbeccedbaee06fc5f6d",
    strip_prefix = "rules_sass-a2fce75bcf103750f7accbf7f966ad48bcbca2d4",
    urls = [
        "https://github.com/bazelbuild/rules_sass/archive/a2fce75bcf103750f7accbf7f966ad48bcbca2d4.zip",
    ],
)

# Setup the rules_sass toolchain
load("@io_bazel_rules_sass//sass:sass_repositories.bzl", "sass_repositories")

sass_repositories(
    yarn_script = YARN_LABEL,
)

# Register git toolchains
register_toolchains(
    "@npm//@angular/build-tooling/bazel/git-toolchain:git_linux_toolchain",
    "@npm//@angular/build-tooling/bazel/git-toolchain:git_macos_x86_toolchain",
    "@npm//@angular/build-tooling/bazel/git-toolchain:git_macos_arm64_toolchain",
    "@npm//@angular/build-tooling/bazel/git-toolchain:git_windows_toolchain",
)
