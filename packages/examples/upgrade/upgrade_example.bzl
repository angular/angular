load("//tools:defaults.bzl", "ng_module", "protractor_web_test_suite", "ts_devserver", "ts_library")

"""
  Macro that can be used to create the Bazel targets for an "upgrade" example. Since the
  upgrade examples bootstrap their application manually, and we cannot serve all examples,
  we need to define the devserver for each example. This macro reduces code duplication
  for defining these targets.
"""

def create_upgrade_example_targets(name, srcs, e2e_srcs, entry_module, assets = []):
    ng_module(
        name = "%s_sources" % name,
        srcs = srcs,
        generate_ve_shims = True,
        deps = [
            "@npm//@types/angular",
            "@npm//@types/jasmine",
            "//packages/core",
            "//packages/platform-browser",
            "//packages/platform-browser-dynamic",
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

    ts_devserver(
        name = "devserver",
        port = 4200,
        entry_module = entry_module,
        additional_root_paths = ["angular/packages/examples"],
        bootstrap = [
            "//packages/zone.js/bundles:zone.umd.js",
            "@npm//:node_modules/angular-1.8/angular.js",
            "@npm//:node_modules/reflect-metadata/Reflect.js",
        ],
        static_files = [
            "//packages/examples:index.html",
        ] + assets,
        scripts = [
            "@npm//:node_modules/tslib/tslib.js",
            "//tools/rxjs:rxjs_umd_modules",
        ],
        deps = [":%s_sources" % name],
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
