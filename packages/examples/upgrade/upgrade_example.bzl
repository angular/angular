load("//tools:defaults.bzl", "esbuild", "http_server", "ng_project", "protractor_web_test_suite", "ts_project")

"""
  Macro that can be used to create the Bazel targets for an "upgrade" example. Since the
  upgrade examples bootstrap their application manually, and we cannot serve all examples,
  we need to define the devserver for each example. This macro reduces code duplication
  for defining these targets.
"""

def create_upgrade_example_targets(name, srcs, e2e_srcs, entry_point, assets = []):
    ng_project(
        name = "%s_sources" % name,
        srcs = srcs,
        deps = [
            "//packages/platform-browser:platform-browser",
            "//:node_modules/@types/angular",
            "//:node_modules/@types/jasmine",
            "//:node_modules/tslib",
            "//packages/core:core",
            "//packages/core/testing:testing",
            "//packages/upgrade/static:static",
            "//packages/upgrade/static/testing:testing",
        ],
        tsconfig = "//packages/examples/upgrade:tsconfig_build",
    )

    ts_project(
        name = "%s_e2e_lib" % name,
        srcs = e2e_srcs,
        testonly = True,
        deps = [
            "//packages/private/testing:testing",
            "//:node_modules/@types/jasminewd2",
            "//:node_modules/protractor",
            "//packages/examples/test-utils:test-utils",
        ],
        tsconfig = "//packages/examples/upgrade:tsconfig_e2e",
    )

    esbuild(
        name = "app_bundle",
        entry_point = entry_point,
        deps = [":%s_sources" % name],
        config = {
            "resolveExtensions": [".js"],
        },
        tsconfig = "//packages/examples/upgrade:tsconfig_build",
    )

    http_server(
        name = "devserver",
        additional_root_paths = ["_main/packages/examples/upgrade"],
        srcs = [
            "//packages/examples/upgrade:index.html",
            "//:node_modules/zone.js",
            "//:node_modules/angular-1.8",
            "//:node_modules/reflect-metadata",
        ] + assets,
        deps = [":app_bundle"],
    )

    protractor_web_test_suite(
        name = "%s_protractor" % name,
        server = ":devserver",
        deps = [
            ":%s_e2e_lib" % name,
            "//:node_modules/selenium-webdriver",
        ],
    )
