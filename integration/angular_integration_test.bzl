# Copyright Google Inc. All Rights Reserved.
#
# Use of this source code is governed by an MIT-style license that can be
# found in the LICENSE file at https://angular.io/license
"""Angular integration testing
"""

load("//tools/npm_integration_test:npm_integration_test.bzl", "npm_integration_test")

# The @npm packages at the root node_modules are used by integration tests
# with `file:../../node_modules/foobar` references
NPM_PACKAGE_ARCHIVES = [
    "check-side-effects",
    "core-js",
    "jasmine",
    "typescript",
    "rxjs",
    "systemjs",
    "tsickle",
    "tslib",
    "protractor",
    "puppeteer",
    "rollup",
    "rollup-plugin-commonjs",
    "rollup-plugin-node-resolve",
    "webdriver-manager",
    "@angular/cli",
    "@angular-devkit/build-angular",
    "@bazel/bazel",
    "@types/jasmine",
    "@types/jasminewd2",
    "@types/node",
]

# The generated npm packages should ALWAYS be replaced in integration tests
# so we pass them to the `check_npm_packages` attribute of npm_integration_test
GENERATED_NPM_PACKAGES = [
    "@angular/animations",
    "@angular/bazel",
    "@angular/benchpress",
    "@angular/common",
    "@angular/compiler",
    "@angular/compiler-cli",
    "@angular/core",
    "@angular/elements",
    "@angular/forms",
    "@angular/http",
    "@angular/language-service",
    "@angular/localize",
    "@angular/platform-browser",
    "@angular/platform-browser-dynamic",
    "@angular/platform-server",
    "@angular/platform-webworker",
    "@angular/platform-webworker-dynamic",
    "@angular/router",
    "@angular/service-worker",
    "@angular/upgrade",
    "zone.js",
]

def npm_package_archives():
    """Function to generate pkg_tar definitions for WORKSPACE yarn_install manual_build_file_contents"""
    npm_packages_to_archive = NPM_PACKAGE_ARCHIVES
    result = """load("@bazel_tools//tools/build_defs/pkg:pkg.bzl", "pkg_tar")
"""
    for name in npm_packages_to_archive:
        label_name = _npm_package_archive_label(name)
        last_segment_name = name if name.find("/") == -1 else name.split("/")[-1]
        result += """pkg_tar(
    name = "{label_name}",
    srcs = ["//{name}:{last_segment_name}__all_files"],
    extension = "tar.gz",
    strip_prefix = "./node_modules/{name}",
    # should not be built unless it is a dependency of another rule
    tags = ["manual"],
)
""".format(name = name, label_name = label_name, last_segment_name = last_segment_name)
    return result

def _npm_package_archive_label(package_name):
    return package_name.replace("/", "_").replace("@", "") + "_archive"

def _angular_integration_test(pinned_npm_packages = [], **kwargs):
    "Set defaults for the npm_integration_test common to the angular repo"
    commands = kwargs.pop("commands", None)
    if not commands:
        # By default run `yarn install` followed by `yarn test` using
        # the bazel managed hermetic version of yarn inside
        commands = [
            # Workaround https://github.com/yarnpkg/yarn/issues/2165
            # Yarn will cache file://dist URIs and not update Angular code
            "rm -rf ./.yarn_local_cache",
            "mkdir .yarn_local_cache",
            "patch-package-json",
            "$(rootpath @nodejs//:yarn_bin) install --cache-folder ./.yarn_local_cache",
            "$(rootpath @nodejs//:yarn_bin) test",
            "rm -rf ./.yarn_local_cache",
        ]

    # Complete list of npm packages to override in the test's package.json file mapped to
    # tgz archive to use for the replacement. This is the full list for all integration
    # tests. Any given integration does not need to use all of these packages.
    npm_packages = {}
    for name in NPM_PACKAGE_ARCHIVES:
        if name not in pinned_npm_packages:
            npm_packages["@npm//:" + _npm_package_archive_label(name)] = name
    for name in GENERATED_NPM_PACKAGES:
        last_segment_name = name if name.find("/") == -1 else name.split("/")[-1]
        npm_packages["//packages/%s:npm_package_archive" % last_segment_name] = name

    npm_integration_test(
        check_npm_packages = GENERATED_NPM_PACKAGES,
        commands = commands,
        npm_packages = npm_packages,
        tags = kwargs.pop("tags", []) + [
            # `integration` tag is used for filtering out these tests from the normal
            # developer workflow
            "integration",
            # Integration do not work inside of a sandbox as they may run host applications such
            # as chrome (which is run by ng) that require access to files outside of the sandbox.
            "no-sandbox",
            # Remote doesn't work as it needs network access right now
            "no-remote-exec",
        ],
        data = kwargs.pop("data", []) + [
            # We need the yarn_bin & yarn_files available at runtime
            "@nodejs//:yarn_bin",
            "@nodejs//:yarn_files",
        ],
        # 15-minute timeout
        timeout = "long",
        # Tells bazel that this test should be allocated a large amount of memory.
        # See https://docs.bazel.build/versions/2.0.0/be/common-definitions.html#common-attributes-tests.
        size = "enormous",
        **kwargs
    )

def angular_integration_test(name, test_folder, pinned_npm_packages = [], **kwargs):
    "Sets up the integration test target based on the test folder name"
    native.filegroup(
        name = "_%s_sources" % name,
        srcs = native.glob(
            include = ["%s/**" % test_folder],
            exclude = [
                "%s/node_modules/**" % test_folder,
                "%s/.yarn_local_cache/**" % test_folder,
            ],
        ),
    )
    _angular_integration_test(
        name = name,
        test_files = kwargs.pop("test_files", "_%s_sources" % name),
        pinned_npm_packages = pinned_npm_packages,
        **kwargs
    )
