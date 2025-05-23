load("@aspect_rules_jasmine//jasmine:defs.bzl", _jasmine_test = "jasmine_test")
load("@aspect_rules_js//npm:defs.bzl", _npm_package = "npm_package")
load("@aspect_rules_ts//ts:defs.bzl", _ts_config = "ts_config")
load("@rules_angular//src/ng_package:index.bzl", _ng_package = "ng_package")
load("@rules_angular//src/ng_project:index.bzl", _ng_project = "ng_project")
load("//tools/bazel:module_name.bzl", "compute_module_name")
load("//tools/bazel:ts_project_interop.bzl", _ts_project = "ts_project")

npm_package = _npm_package
ts_config = _ts_config

def _determine_tsconfig(testonly):
    if native.package_name().startswith("packages/compiler-cli/src/ngtsc"):
        return "//packages/compiler-cli:tsconfig_test" if testonly else "//packages/compiler-cli:tsconfig_build"

    if native.package_name().startswith("packages/service-worker"):
        return "//packages:tsconfig_test" if testonly else "//packages/service-worker:tsconfig_build"

    if native.package_name().startswith("packages/core/schematics"):
        return "//packages/core/schematics:tsconfig_test" if testonly else "//packages/core/schematics:tsconfig_build"

    if native.package_name().startswith("packages/core"):
        return "//packages/core:tsconfig_test" if testonly else "//packages/core:tsconfig_build"

    if native.package_name().startswith("packages/benchpress"):
        return "//packages:tsconfig_test" if testonly else "//packages/benchpress:tsconfig_build"

    if native.package_name().startswith("packages/language-service"):
        return "//packages:tsconfig_test" if testonly else "//packages/language-service:tsconfig_build"

    if native.package_name().startswith("packages/localize"):
        return "//packages:tsconfig_test" if testonly else "//packages/localize:tsconfig_build"

    if native.package_name().startswith("packages/common/locales/generate-locales-tool"):
        return "//packages:tsconfig_test" if testonly else "//packages/common/locales/generate-locales-tool:tsconfig_build"

    if native.package_name().startswith("packages/examples"):
        return "//packages/examples:tsconfig_test" if testonly else "//packages/examples:tsconfig_build"

    if native.package_name().startswith("packages"):
        return "//packages:tsconfig_test" if testonly else "//packages:tsconfig_build"

    if native.package_name().startswith("tools"):
        return "//tools:tsconfig_test" if testonly else "//tools:tsconfig_build"

    fail("Failing... a tsconfig value must be provided.")

def ts_project(
        name,
        source_map = True,
        testonly = False,
        tsconfig = None,
        **kwargs):
    module_name = kwargs.pop("module_name", compute_module_name(testonly))

    if tsconfig == None:
        tsconfig = _determine_tsconfig(testonly)

    _ts_project(
        name,
        source_map = source_map,
        module_name = module_name,
        testonly = testonly,
        tsconfig = tsconfig,
        **kwargs
    )

def ng_project(
        name,
        source_map = True,
        testonly = False,
        tsconfig = None,
        **kwargs):
    module_name = kwargs.pop("module_name", compute_module_name(testonly))

    if tsconfig == None:
        tsconfig = _determine_tsconfig(testonly)

    _ts_project(
        name,
        source_map = source_map,
        module_name = module_name,
        rule_impl = _ng_project,
        testonly = testonly,
        tsconfig = tsconfig,
        **kwargs
    )

def jasmine_test(name, data = [], args = [], **kwargs):
    # Create relative path to root, from current package dir. Necessary as
    # we change the `chdir` below to the package directory.
    relative_to_root = "/".join([".."] * len(native.package_name().split("/")))

    _jasmine_test(
        name = name,
        node_modules = "//:node_modules",
        chdir = native.package_name(),
        fixed_args = [
            "--require=%s/node_modules/source-map-support/register.js" % relative_to_root,
            "**/*spec.js",
            "**/*spec.mjs",
            "**/*spec.cjs",
        ] + args,
        data = data + [
            "//:node_modules/source-map-support",
        ],
        **kwargs
    )

def ng_package(deps = [], **kwargs):
    _ng_package(
        deps = deps,
        rollup_runtime_deps = [
            "//:node_modules/@rollup/plugin-commonjs",
            "//:node_modules/@rollup/plugin-node-resolve",
            "//:node_modules/magic-string",
            "//:node_modules/rollup-plugin-dts",
            "//:node_modules/rollup-plugin-sourcemaps2",
        ],
        **kwargs
    )
