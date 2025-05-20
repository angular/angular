load("//tools:defaults.bzl", "esbuild", "http_server", "ng_module", "protractor_web_test_suite", "ts_library")

"""
  Macro that can be used to create the Bazel targets for an "upgrade" example. Since the
  upgrade examples bootstrap their application manually, and we cannot serve all examples,
  we need to define the devserver for each example. This macro reduces code duplication
  for defining these targets.
"""

def create_upgrade_example_targets(name, srcs, e2e_srcs, entry_point, assets = []):
    ng_module(
        name = "%s_sources" % name,
        srcs = srcs,
        deps = [
            "@npm//@types/angular",
            "@npm//@types/jasmine",
            "//packages/core",
            "//packages/platform-browser",
            "//packages/upgrade/static",
            "//packages/core/testing",
            "//packages/upgrade/static/testing",
        ],
        tsconfig = "//packages/examples/upgrade:tsconfig-build.json",
    )

    ts_library(
        name = "%s_e2e_lib" % name,
        srcs = e2e_srcs,
        testonly = True,
        deps = [
            "@npm//@types/jasminewd2",
            "@npm//protractor",
            "//packages/examples/test-utils",
            "//packages/private/testing",
        ],
        tsconfig = "//packages/examples:tsconfig-e2e.json",
    )

    esbuild(
        name = "app_bundle",
        entry_point = entry_point,
        deps = [":%s_sources" % name],
    )

    http_server(
        name = "devserver",
        additional_root_paths = ["angular/packages/examples/upgrade"],
        srcs = [
            "//packages/examples/upgrade:index.html",
            "//packages/zone.js/bundles:zone.umd.js",
            "@npm//:node_modules/angular-1.8/angular.js",
            "@npm//:node_modules/reflect-metadata/Reflect.js",
        ] + assets,
        deps = [":app_bundle"],
    )

    protractor_web_test_suite(
        name = "%s_protractor" % name,
        on_prepare = "//packages/examples/upgrade:start-server.js",
        server = ":devserver",
        deps = [
            ":%s_e2e_lib" % name,
            "@npm//selenium-webdriver",
        ],
    )
