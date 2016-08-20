package(default_visibility=["//visibility:public"])

load("//build_defs:nodejs.bzl", "nodejs_binary", "nodejs_test")
load("//build_defs:typescript.bzl", "ts_library", "ts_ext_library")
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
