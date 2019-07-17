load("//packages/bazel:index.bzl", "protractor_web_test_suite")
load("//tools:defaults.bzl", "ng_module", "ts_library")
load("@npm_bazel_typescript//:index.bzl", "ts_devserver")

# Macro rule for creating the ng_module and ts_devserver rules for an aio example.
def aio_example(
        name,
        srcs,
        entry_module,
        assets = [],
        deps = [],
        server_assets = [],
        server_root_paths = [],
        server_index_html = "src/index.html"):
    ng_module(
        name = "%s" % name,
        srcs = [":%s_environment_file" % name] + srcs,
        assets = assets,
        # TODO: FW-1004 Type checking is currently not complete.
        type_check = False,
        deps = deps,
        tsconfig = "//aio/content/examples:tsconfig-example.json",
    )

    native.genrule(
        name = "%s_environment_file" % name,
        outs = ["src/environments/environment.ts"],
        cmd = "echo 'export const environment = {production: false};' > $@",
    )

    ts_devserver(
        name = "%s_devserver" % name,
        entry_module = entry_module,
        index_html = server_index_html,
        port = 4200,
        scripts = [
            "//tools/rxjs:rxjs_umd_modules",
            "@npm//:node_modules/tslib/tslib.js",
        ],
        static_files = [
            "@npm//:node_modules/zone.js/dist/zone.js",
            # Needed because the examples can be bootstrapped in JIT mode.
            "@npm//:node_modules/reflect-metadata/Reflect.js",
        ],
        additional_root_paths = server_root_paths,
        deps = [":%s" % name],
        data = server_assets,
    )

# Macro rule for creating the e2e testing target for an aio example.
def aio_example_e2e(name, srcs, server, deps = []):
    ts_library(
        name = "%s_lib" % name,
        testonly = True,
        srcs = srcs,
        tsconfig = "//aio/content/examples:tsconfig-e2e.json",
        deps = [
            "//packages/private/testing",
            "@npm//@types/jasminewd2",
            "@npm//@types/selenium-webdriver",
            "@npm//selenium-webdriver",
            "@npm//protractor",
        ] + deps,
    )

    protractor_web_test_suite(
        name = "%s" % name,
        data = ["//packages/bazel/src/protractor/utils"],
        on_prepare = "//aio/content/examples:start-e2e-server.js",
        server = server,
        deps = [
            ":%s_lib" % name,
            "@npm//protractor",
            "@npm//selenium-webdriver",
        ],
    )
