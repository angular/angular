package(default_visibility=["//visibility:public"])

load("//build_defs:nodejs.bzl", "nodejs_binary", "nodejs_test")
load("//build_defs:typescript.bzl", "ts_library", "ts_ext_library")
load("//build_defs:jasmine.bzl", "jasmine_node_test")
load("//build_defs:karma.bzl", "karma_test")
load("//build_defs:bundle.bzl", "js_bundle")
# This imports node_modules targets from a generated file.
load("//build_defs:node_modules_index.bzl", "node_modules_index")
node_modules_index(glob)

###############################################################################
# Tools
###############################################################################
nodejs_binary(
    name = "tsc-wrapped_bootstrap",
    srcs = [
        'tools/@angular/tsc-wrapped/bootstrap.js',
        '//:typescript',
        '//:minimist',
    ],
    entry_point = 'tools/@angular/tsc-wrapped/bootstrap.js',
)

ts_library(
    name = "tsc-wrapped",
    srcs = glob(
        [
          "tools/@angular/tsc-wrapped/index.ts",
          "tools/@angular/tsc-wrapped/src/**/*.ts",
        ],
    ),
    deps = [
        "//:_types_node",
        "//:typescript",
        "//:tsickle",
    ],
    data = [
        "tools/@angular/tsc-wrapped/worker_protocol.proto",
        "//:minimist",
        "//:bytebuffer",
        "//:protobufjs",
    ],
    tsconfig = "tools/@angular/tsc-wrapped/tsconfig.json",
    compiler = "//:tsc-wrapped_bootstrap",
    module_name = "@angular/tsc-wrapped",
    root_dir = "tools/@angular/tsc-wrapped",
)

nodejs_binary(
    name = "tsc-wrapped_bin",
    srcs = [":tsc-wrapped"],
    entry_point = "tools/@angular/tsc-wrapped/src/worker.js",
)

###############################################################################
# Packages
###############################################################################
ts_library(
    name = "jasmine_helper",
    srcs = [
        "modules/jasmine_helper.ts"
    ],
    deps = [
        "//:core",
        "//:platform-server",
    ],
    data = [
        "//:source-map-support",
        "//:reflect-metadata",
        "//:zone.js",
        "//:parse5",
    ],
    tsconfig = "modules/tsconfig.json",
)

ts_ext_library(
    name = "es6-subset",
    declarations = ["modules/es6-subset.d.ts"],
    ambient = True,
    entry_point = "modules/es6-subset.d.ts",
)

ts_ext_library(
    name = "dummy_system",
    declarations = ["modules/system.d.ts"],
    ambient = True,
    entry_point = "modules/system.d.ts",
)

ts_library(
    name = "facade",
    srcs = glob(["modules/@angular/facade/src/**/*.ts"]),
    deps = [
        "//:zone.js",
        "//:rxjs",
        "//:es6-subset",
    ],
    tsconfig = "modules/tsconfig.json",
    module_name = "@angular/facade",
    root_dir = "modules/@angular/facade",
)

ts_library(
    name = "common",
    srcs = glob(
        ["modules/@angular/common/**/*.ts"],
        exclude = ["modules/@angular/common/test/**/*.ts"]),
    deps = [
        "//:zone.js",
        "//:core",
        "//:es6-subset",
    ],
    tsconfig = "modules/@angular/common/tsconfig-es5.json",
    module_name = "@angular/common",
)

ts_library(
    name = "common_test_module",
    srcs = glob(["modules/@angular/common/test/**/*.ts"]),
    deps = [
        "//:_types_node",
        "//:_types_jasmine",
        "//:zone.js",
        "//:core",
        "//:common",
        "//:compiler",
        "//:platform-browser",
        "//:platform-browser-dynamic",
        "//:platform-server",
        "//:facade",
        "//:es6-subset",
    ],
    deps_use_internal = [
        "//:common",
    ],
    tsconfig = "modules/tsconfig.json",
    root_dir = "modules/@angular/common/test",
    is_leaf = True,
)

ts_library(
    name = "compiler-cli",
    srcs = glob(
        ["modules/@angular/compiler-cli/**/*.ts"],
        exclude = [
            "modules/@angular/compiler-cli/test/**/*.ts",
            "modules/@angular/compiler-cli/integrationtest/**/*.ts",
        ]),
    deps = [
        "//:_types_node",
        "//:_types_jasmine",
        "//:zone.js",
        "//:core",
        "//:common",
        "//:compiler",
        "//:platform-server",
        "//:platform-browser",
        "//:tsc-wrapped",
    ],
    tsconfig = "modules/@angular/compiler-cli/tsconfig-es5.json",
    module_name = "@angular/compiler-cli",
)

ts_library(
    name = "compiler-cli_test_module",
    srcs = glob(["modules/@angular/compiler-cli/test/**/*.ts"]),
    deps = [
        "//:_types_node",
        "//:_types_jasmine",
        "//:zone.js",
        "//:core",
        "//:platform-browser",
        "//:platform-browser-dynamic",
        "//:compiler-cli",
        "//:tsc-wrapped",
        "//:facade",
    ],
    deps_use_internal = [
        "//:compiler-cli",
    ],
    tsconfig = "modules/tsconfig.json",
    root_dir = "modules/@angular/compiler-cli/test",
    is_leaf = True,
)

ts_library(
    name = "compiler",
    srcs = glob(
        ["modules/@angular/compiler/**/*.ts"],
        exclude = ["modules/@angular/compiler/test/**/*.ts"]),
    deps = [
        "//:zone.js",
        "//:core",
    ],
    tsconfig = "modules/@angular/compiler/tsconfig-es5.json",
    module_name = "@angular/compiler",
)

ts_library(
    name = "compiler_test_module",
    srcs = glob(["modules/@angular/compiler/test/**/*.ts"]),
    deps = [
        "//:_types_node",
        "//:_types_jasmine",
        "//:zone.js",
        "//:core",
        "//:common",
        "//:platform-browser",
        "//:platform-browser-dynamic",
        "//:compiler",
        "//:facade",
        "//:es6-subset",
    ],
    deps_use_internal = [
        "//:compiler",
    ],
    tsconfig = "modules/tsconfig.json",
    root_dir = "modules/@angular/compiler/test",
    # Required for compiling codegen.
    module_name = "@angular/compiler/test",
)

nodejs_binary(
    name = "compiler_test_codegen_bin",
    srcs = [":compiler_test_module"],
    deps = [
        "reflect-metadata",
    ],
    entry_point = "modules/@angular/compiler/test/output/output_emitter_codegen.js",
)

genrule(
    name = "compiler_test_codegen_ts",
    outs = [
        "modules/@angular/compiler/test/output/output_emitter_generated_typed.ts",
        "modules/@angular/compiler/test/output/output_emitter_generated_untyped.ts",
    ],
    tools = [
        # This has to be put in tools so that its runfiles tree is also built.
        ":compiler_test_codegen_bin",
    ],
    cmd = "$(location :compiler_test_codegen_bin) --node_path=modules/ $(OUTS)",
    output_to_bindir = True,
)

ts_library(
    name = "compiler_test_codegen_js",
    srcs = [":compiler_test_codegen_ts"],
    deps = [
        ":core",
        ":compiler",
        ":compiler_test_module",
    ],
    tsconfig = "tools/cjs-jasmine/tsconfig-output_emitter_codegen.json",
    root_dir = "modules/@angular/compiler/test",
)

ts_library(
    name = "core",
    srcs = glob(
        ["modules/@angular/core/**/*.ts"],
        exclude = ["modules/@angular/core/test/**/*.ts"]),
    deps = [
        "//:_types_node",
        "//:_types_jasmine",
        "//:zone.js",
        "//:rxjs",
        "//:dummy_system",
    ],
    tsconfig = "modules/@angular/core/tsconfig-es5.json",
    module_name = "@angular/core",
)

ts_library(
    name = "core_test_module",
    srcs = glob(["modules/@angular/core/test/**/*.ts"]),
    deps = [
        "//:_types_node",
        "//:_types_jasmine",
        "//:zone.js",
        "//:common",
        "//:compiler",
        "//:platform-browser",
        "//:platform-browser-dynamic",
        "//:core",
        "//:facade",
        "//:es6-subset",
    ],
    deps_use_internal = [
        "//:core",
    ],
    tsconfig = "modules/tsconfig.json",
    root_dir = "modules/@angular/core/test",
    is_leaf = True,
)

ts_library(
    name = "forms",
    srcs = glob(
        ["modules/@angular/forms/**/*.ts"],
        exclude = ["modules/@angular/forms/test/**/*.ts"]),
    deps = [
        "//:zone.js",
        "//:core",
        "//:common",
        "//:compiler",
    ],
    tsconfig = "modules/@angular/forms/tsconfig-es5.json",
    module_name = "@angular/forms",
)

ts_library(
    name = "forms_test_module",
    srcs = glob(
        ["modules/@angular/forms/test/**/*.ts"]),
    deps = [
        "//:_types_node",
        "//:_types_jasmine",
        "//:zone.js",
        "//:core",
        "//:common",
        "//:platform-browser",
        "//:platform-browser-dynamic",
        "//:forms",
        "//:facade",
    ],
    deps_use_internal = [
        "//:forms",
    ],
    tsconfig = "modules/tsconfig.json",
    root_dir = "modules/@angular/forms/test",
    is_leaf = True,
)

ts_library(
    name = "http",
    srcs = glob(
        ["modules/@angular/http/**/*.ts"],
        exclude = ["modules/@angular/http/test/**/*.ts"]),
    deps = [
        "//:zone.js",
        "//:core",
        "//:common",
        "//:platform-browser",
    ],
    tsconfig = "modules/@angular/http/tsconfig-es5.json",
    module_name = "@angular/http",
)

ts_library(
    name = "platform-browser",
    srcs = glob(
        ["modules/@angular/platform-browser/**/*.ts"],
        exclude = ["modules/@angular/platform-browser/test/**/*.ts"]),
    deps = [
        "//:_types_hammerjs",
        "//:_types_jasmine",
        "//:_types_protractor",
        "//:zone.js",
        "//:_types_selenium-webdriver",
        "//:core",
        "//:common",
        "//:facade",
    ],
    tsconfig = "modules/@angular/platform-browser/tsconfig-es5.json",
    module_name = "@angular/platform-browser",
)

ts_library(
    name = "platform-browser_test_module",
    srcs = glob(["modules/@angular/platform-browser/test/**/*.ts"]),
    data = glob(
        [
            "modules/@angular/platform-browser/test/static_assets/**",
            "modules/@angular/platform-browser/test/browser/static_assets/**",
        ]),
    deps = [
        "//:_types_node",
        "//:_types_jasmine",
        "//:zone.js",
        "//:common",
        "//:compiler",
        "//:platform-browser",
        "//:platform-browser-dynamic",
        "//:core",
    ],
    deps_use_internal = [
        "//:core",
        "//:platform-browser",
    ],
    tsconfig = "modules/tsconfig.json",
    root_dir = "modules/@angular/platform-browser/test",
    is_leaf = True,
)

ts_library(
    name = "http_test_module",
    srcs = glob(["modules/@angular/http/test/**/*.ts"]),
    deps = [
        "//:_types_node",
        "//:_types_jasmine",
        "//:zone.js",
        "//:core",
        "//:common",
        "//:platform-browser",
        "//:platform-browser-dynamic",
        "//:http",
        "//:facade",
    ],
    deps_use_internal = [
        "//:http",
    ],
    tsconfig = "modules/tsconfig.json",
    root_dir = "modules/@angular/http/test",
    is_leaf = True,
)

ts_library(
    name = "platform-browser-dynamic",
    srcs = glob(
        ["modules/@angular/platform-browser-dynamic/**/*.ts"],
        exclude = ["modules/@angular/platform-browser-dynamic/test/**/*.ts"]),
    deps = [
        "//:_types_jasmine",
        "//:zone.js",
        "//:core",
        "//:common",
        "//:compiler",
        "//:platform-browser",
    ],
    tsconfig = "modules/@angular/platform-browser-dynamic/tsconfig-es5.json",
    module_name = "@angular/platform-browser-dynamic",
)

ts_library(
    name = "platform-browser-dynamic_test_module",
    srcs = glob(["modules/@angular/platform-browser-dynamic/test/**/*.ts"]),
    deps = [
        "//:_types_node",
        "//:_types_jasmine",
        "//:zone.js",
        "//:core",
        "//:compiler",
        "//:platform-browser",
        "//:platform-browser-dynamic",
        "//:facade",
    ],
    deps_use_internal = [
        "//:platform-browser-dynamic",
    ],
    tsconfig = "modules/tsconfig.json",
    root_dir = "modules/@angular/platform-browser-dynamic/test",
    is_leaf = True,
)

ts_library(
    name = "platform-server",
    srcs = glob(
        ["modules/@angular/platform-server/**/*.ts"],
        exclude = [
            "modules/@angular/platform-server/platform_browser_dynamic_testing_private.ts",
            "modules/@angular/platform-server/test/**/*.ts",
        ]),
    deps = [
        "//:_types_jasmine",
        "//:_types_node",
        "//:zone.js",
        "//:core",
        "//:common",
        "//:compiler",
        "//:platform-browser",
        "//:platform-browser-dynamic",
    ],
    tsconfig = "modules/@angular/platform-server/tsconfig-es5.json",
    module_name = "@angular/platform-server",
)

ts_library(
    name = "platform-server_test_module",
    srcs = glob(["modules/@angular/platform-server/test/**/*.ts"]),
    deps = [
        "//:_types_node",
        "//:_types_jasmine",
        "//:zone.js",
        "//:core",
        "//:platform-browser",
        "//:platform-browser-dynamic",
        "//:platform-server",
        "//:facade",
    ],
    deps_use_internal = [
        "//:platform-server",
    ],
    tsconfig = "modules/tsconfig.json",
    root_dir = "modules/@angular/platform-server/test",
    is_leaf = True,
)

ts_library(
    name = "router",
    srcs = glob(
        ["modules/@angular/router/**/*.ts"],
        exclude = ["modules/@angular/router/test/**/*.ts"]),
    deps = [
        "//:_types_node",
        "//:_types_jasmine",
        "//:zone.js",
        "//:core",
        "//:common",
        "//:compiler",
        "//:platform-browser",
        "//:platform-browser-dynamic",
    ],
    tsconfig = "modules/@angular/router/tsconfig-es5.json",
    module_name = "@angular/router",
)

ts_library(
    name = "router_test_module",
    srcs = glob(["modules/@angular/router/test/**/*.ts"]),
    deps = [
        "//:_types_node",
        "//:_types_jasmine",
        "//:zone.js",
        "//:core",
        "//:common",
        "//:router",
        "//:platform-browser",
        "//:facade",
    ],
    deps_use_internal = [
        "//:router",
    ],
    tsconfig = "modules/tsconfig.json",
    root_dir = "modules/@angular/router/test",
    is_leaf = True,
)

ts_library(
    name = "upgrade",
    srcs = glob(
        ["modules/@angular/upgrade/**/*.ts"],
        exclude = ["modules/@angular/upgrade/test/**/*.ts"]),
    deps = [
        "//:zone.js",
        "//:core",
        "//:common",
        "//:compiler",
        "//:platform-browser",
        "//:platform-browser-dynamic",
    ],
    tsconfig = "modules/@angular/upgrade/tsconfig-es5.json",
    module_name = "@angular/upgrade",
)

ts_library(
    name = "upgrade_test_module",
    srcs = glob(["modules/@angular/upgrade/test/**/*.ts"]),
    deps = [
        "//:_types_node",
        "//:_types_jasmine",
        "//:zone.js",
        "//:core",
        "//:platform-browser",
        "//:upgrade",
        "//:facade",
    ],
    deps_use_internal = [
        "//:upgrade",
    ],
    tsconfig = "modules/tsconfig.json",
    root_dir = "modules/@angular/upgrade/test",
    is_leaf = True,
)

jasmine_node_test(
    name = "compiler_test",
    srcs = [":compiler_test_module", ":compiler_test_codegen_js"],
    helpers = [":jasmine_helper"],
    size = "small",
    args = ["--node_path=modules:tools"],
)

JASMINE_TESTABLE = [
    "core",
    "common",
    "compiler",
    "compiler-cli",
    "http",
    "platform-server",
    "router",
]

[
    jasmine_node_test(
        name = pkg + "_test",
        srcs = [":{}_test_module".format(pkg)],
        helpers = [":jasmine_helper"],
        size = "small",
        args = ["--node_path=modules:tools"],
        flaky = pkg == "platform-server",
    )
    for pkg in JASMINE_TESTABLE
    if pkg != "compiler"
]

test_suite(
    name = "jasmine_tests",
    tests = [":{}_test".format(p) for p in JASMINE_TESTABLE],
)

ts_library(
    name = "empty_module",
    srcs = ["modules/empty.ts"],
    tsconfig = "modules/tsconfig.json",
)

KARMA_DATA = [
    ":es6-shim",
    ":karma-browserstack-launcher",
    ":karma-chrome-launcher",
    ":karma-jasmine",
    ":karma-sauce-launcher",
    ":karma-sourcemap-loader",
    ":reflect-metadata",
    ":source-map",
    ":systemjs",
]

karma_test(
    name = "karma_test",
    srcs = [
        ":core_test_module",
        ":common_test_module",
        ":compiler_test_module",
        ":compiler_test_codegen_js",
        ":forms_test_module",
        ":http_test_module",
        ":platform-browser_test_module",
        ":platform-browser-dynamic_test_module",
        ":platform-server_test_module",
        ":upgrade_test_module",
        ":empty_module",
        "shims_for_IE.js",
        "test-main.js",
    ],
    data = KARMA_DATA + [
        ":angular",
        "browser-providers.conf.js",
        "tools/karma/reporter.js",
    ],
    config = "karma-js.conf.js",
    local = True,
)

karma_test(
    name = "router_karma_test",
    srcs = [
        ":router_test_module",
        "modules/@angular/router/karma-test-shim.js",
    ],
    data = KARMA_DATA + [
        "browser-providers.conf.js",
    ],
    config = "modules/@angular/router/karma.conf.js",
    size = "small",
    local = True,
)

###############################################################################
# Packaging and end to end tests
###############################################################################
ESM_PACKAGES = [
    "core",
    "common",
    "compiler",
    "forms",
    "http",
    "platform-browser",
    "platform-browser-dynamic",
    "platform-server",
    "router",
    "upgrade",
]

NON_ESM_PACKAGES = [
    "compiler-cli",
]

ALL_PACKAGES = ESM_PACKAGES + NON_ESM_PACKAGES + ["tsc-wrapped"]

[
    js_bundle(
        name = pkg + "_bundle",
        srcs = [":" + pkg],
        output = "modules/@angular/{}/{}.umd.js".format(pkg, pkg),
        entry_point = "modules/@angular/{}/esm/index.js".format(pkg),
        rollup_config = "modules/@angular/{}/rollup.config.js".format(pkg),
        banner = "modules/@angular/license-banner.txt",
    )
    for pkg in ESM_PACKAGES
]
