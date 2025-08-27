"""Provides the rollup and dist file generation macro."""

load("@aspect_bazel_lib//lib:copy_to_bin.bzl", _copy_to_bin = "copy_to_bin")
load("@aspect_rules_esbuild//esbuild:defs.bzl", _esbuild = "esbuild")
load("@aspect_rules_jasmine//jasmine:defs.bzl", _jasmine_test = "jasmine_test")
load("@aspect_rules_js//npm:defs.bzl", _npm_package = "npm_package")
load("@aspect_rules_ts//ts:defs.bzl", _ts_config = "ts_config")
load("@devinfra//bazel/spec-bundling:index.bzl", "spec_bundle")
load("@devinfra//bazel/ts_project:index.bzl", "strict_deps_test")
load("@rules_angular//src/ts_project:index.bzl", _ts_project = "ts_project")
load("@rules_browsers//wtr:index.bzl", "wtr_test")
load("//packages/zone.js/tools:zone_bundle.bzl", "zone_bundle")

copy_to_bin = _copy_to_bin
esbuild = _esbuild
ts_config = _ts_config
npm_package = _npm_package

def ts_project(
        name,
        deps = [],
        srcs = [],
        source_map = True,
        testonly = False,
        tsconfig = None,
        **kwargs):
    if tsconfig == None:
        if native.package_name().startswith("packages/zone.js"):
            tsconfig = "//packages/zone.js:tsconfig_test" if testonly else "//packages/zone.js:tsconfig_build"
        else:
            fail("Failing... a tsconfig value must be provided.")

    _ts_project(
        name,
        srcs = srcs,
        deps = deps,
        declaration = True,
        source_map = source_map,
        testonly = testonly,
        tsconfig = tsconfig,
        **kwargs
    )

    strict_deps_test(
        name = "%s_deps" % name,
        srcs = srcs,
        tsconfig = tsconfig,
        deps = deps,
    )

def copy_dist(module_name, module_format, output_module_name, suffix, umd):
    umd_output = umd
    suffix_output = suffix
    if umd == "umd":
        umd_output = "umd."
    if suffix == "min":
        suffix_output = "min."
    native.genrule(
        name = module_name + "." + suffix_output + "dist",
        srcs = [
            "//packages/zone.js:" + module_name + "-rollup." + suffix_output + module_format,
        ],
        outs = [
            output_module_name + "." + umd_output + suffix_output + "js",
        ],
        visibility = ["//visibility:public"],
        cmd = "cp $< $@",
    )

def generate_rollup_bundle(bundles):
    for b in bundles.items():
        module_name = b[0]
        rollup_config = b[1]
        if rollup_config.get("entrypoint") != None:
            entry_point = rollup_config.get("entrypoint")
            zone_bundle(
                name = module_name + "-es5-rollup",
                entry_point = entry_point + ".js",
                external = rollup_config.get("external"),
                deps = [
                    "//packages/zone.js/lib:lib",
                ],
            )
            zone_bundle(
                name = module_name + "-es2015-rollup",
                entry_point = entry_point + ".js",
                external = rollup_config.get("external"),
                deps = [
                    "//packages/zone.js/lib:lib",
                ],
            )
        else:
            zone_bundle(
                name = module_name + "-es5-rollup",
                entry_point = rollup_config.get("es5") + ".js",
                external = rollup_config.get("external"),
                deps = [
                    "//packages/zone.js/lib:lib",
                ],
            )
            zone_bundle(
                name = module_name + "-es2015-rollup",
                entry_point = rollup_config.get("es2015") + ".js",
                external = rollup_config.get("external"),
                deps = [
                    "//packages/zone.js/lib:lib",
                ],
            )

def generate_dist(bundles, output_format, umd):
    module_format = "esm.js"
    if output_format == "es5":
        module_format = "es5umd.js"
    for b in bundles:
        module_name = b[0]
        copy_dist(
            module_name = module_name + "-" + output_format,
            module_format = module_format,
            output_module_name = module_name,
            suffix = "",
            umd = umd,
        )
        copy_dist(
            module_name = module_name + "-" + output_format,
            module_format = module_format,
            output_module_name = module_name,
            suffix = "min.",
            umd = umd,
        )

def web_test(name, tags = [], deps = [], bootstrap = [], tsconfig = "//packages/zone.js:tsconfig_build", **kwargs):
    spec_bundle(
        name = "%s_bundle" % name,
        testonly = True,
        srcs = [tsconfig],
        tsconfig = tsconfig,
        bootstrap = bootstrap,
        deps = deps,
        tags = [
            "manual",
        ],
        config = {
            "resolveExtensions": [".js", ".mjs"],
        },
        platform = "browser",
        external = kwargs.pop("external", []),
    )

    wtr_test(
        name = name,
        deps = [":%s_bundle" % name] + kwargs.pop("data", []),
        tags = tags,
        **kwargs
    )

def jasmine_test(name, data = [], fixed_args = [], **kwargs):
    # Create relative path to root, from current package dir. Necessary as
    # we change the `chdir` below to the package directory.
    relative_to_root = "/".join([".."] * len(native.package_name().split("/")))

    all_fixed_args = [
        "--require={root}/packages/zone.js/node_modules/source-map-support/register.js",
        # Escape so that the `js_binary` launcher triggers Bash expansion.
        "'**/*+(.|_)spec.js'",
        "'**/*+(.|_)spec.mjs'",
        "'**/*+(.|_)spec.cjs'",
    ] + fixed_args

    all_fixed_args = [arg.format(root = relative_to_root) for arg in all_fixed_args]

    size = kwargs.pop("size", "medium")

    _jasmine_test(
        name = name,
        node_modules = "//packages/zone.js:node_modules",
        chdir = native.package_name(),
        fixed_args = all_fixed_args,
        data = data + [
            "//packages:tsconfig_build",
            "//tools/bazel/node_loader",
            "//packages/zone.js:node_modules/source-map-support",
        ],
        node_options = ["--import", "%s/tools/bazel/node_loader/index.mjs" % relative_to_root],
        size = size,
        **kwargs
    )

def zone_compatible_jasmine_test(name, external = [], data = [], bootstrap = [], **kwargs):
    spec_bundle(
        name = "%s_bundle" % name,
        # Specs from this attribute are filtered and will be executed. We
        # add bootstrap here for discovery of the module mappings aspect.
        deps = data + bootstrap,
        bootstrap = bootstrap,
        external = external + ["domino", "typescript"],
        platform = "node",
        config = {
            "banner": {
                "js": """import {createRequire as __cjsCompatRequire} from 'module';
                     const require = __cjsCompatRequire(import.meta.url);""",
            },
            "target": ["ES2022"],
            "format": "esm",
        },
    )

    jasmine_test(
        name = name,
        data = [":%s_bundle" % name],
        **kwargs
    )
