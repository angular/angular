"""Re-export of some bazel rules with repository-wide defaults."""

load("@build_bazel_rules_nodejs//:index.bzl", _npm_package_bin = "npm_package_bin", _pkg_npm = "pkg_npm")
load("@devinfra//bazel:extract_js_module_output.bzl", "extract_js_module_output")
load("@devinfra//bazel:extract_types.bzl", _extract_types = "extract_types")
load("@devinfra//bazel/http-server:index.bzl", _http_server = "http_server")
load("@devinfra//bazel/spec-bundling:spec-entrypoint.bzl", "spec_entrypoint")
load("@npm//@angular/build-tooling/bazel/spec-bundling:index.bzl", "spec_bundle")
load("@npm//@bazel/jasmine:index.bzl", _jasmine_node_test = "jasmine_node_test")
load("@npm//@bazel/rollup:index.bzl", _rollup_bundle = "rollup_bundle")
load("@npm//@bazel/terser:index.bzl", "terser_minified")
load("@npm//typescript:index.bzl", "tsc")
load("@rules_pkg//:pkg.bzl", "pkg_tar")
load("//adev/shared-docs/pipeline/api-gen:generate_api_docs.bzl", _generate_api_docs = "generate_api_docs")
load("//tools/bazel:tsec.bzl", _tsec_test = "tsec_test")
load("//tools/esm-interop:index.bzl", "enable_esm_node_module_loader", _nodejs_binary = "nodejs_binary", _nodejs_test = "nodejs_test")

http_server = _http_server
extract_types = _extract_types

# Packages which are versioned together on npm
ANGULAR_SCOPED_PACKAGES = ["@angular/%s" % p for p in [
    # core should be the first package because it's the main package in the group
    # this is significant for Angular CLI and "ng update" specifically, @angular/core
    # is considered the identifier of the group by these tools.
    "core",
    "bazel",
    "common",
    "compiler",
    "compiler-cli",
    "animations",
    "elements",
    "platform-browser",
    "platform-browser-dynamic",
    "forms",
    # Current plan for Angular v8 is to not include @angular/http in ng update
    # "http",
    "platform-server",
    "upgrade",
    "router",
    "language-service",
    "localize",
    "service-worker",
]]

PKG_GROUP_REPLACEMENTS = {
    "\"NG_UPDATE_PACKAGE_GROUP\"": """[
      %s
    ]""" % ",\n      ".join(["\"%s\"" % s for s in ANGULAR_SCOPED_PACKAGES]),
}

def pkg_npm(name, deps = [], validate = True, **kwargs):
    """Default values for pkg_npm"""
    visibility = kwargs.pop("visibility", None)

    common_substitutions = dict(kwargs.pop("substitutions", {}), **PKG_GROUP_REPLACEMENTS)
    substitutions = dict(common_substitutions, **{
        "0.0.0-PLACEHOLDER": "0.0.0",
    })
    stamped_substitutions = dict(common_substitutions, **{
        "0.0.0-PLACEHOLDER": "{STABLE_PROJECT_VERSION}",
    })

    # NOTE: We keep this to avoid the linker mappings from `deps` to be forwarded.
    # e.g. the `pkg_npm` might have a `package_name` but the source `ts_library` too.
    # This is a bug in `rules_nodejs` that should be fixed.
    # TODO(devversion): Remove this when we landed a fix in `rules_nodejs`.
    # Related to: https://github.com/bazelbuild/rules_nodejs/issues/2941.
    extract_js_module_output(
        name = "%s_js_module_output" % name,
        provider = "JSModuleInfo",
        include_declarations = True,
        include_default_files = True,
        forward_linker_mappings = False,
        include_external_npm_packages = False,
        deps = deps,
    )

    _pkg_npm(
        name = name,
        validate = validate,
        substitutions = select({
            "//:stamp": stamped_substitutions,
            "//conditions:default": substitutions,
        }),
        deps = [":%s_js_module_output" % name],
        visibility = visibility,
        **kwargs
    )

    pkg_tar(
        name = name + "_archive",
        srcs = [":%s" % name],
        extension = "tar.gz",
        strip_prefix = "./%s" % name,
        # should not be built unless it is a dependency of another rule
        tags = ["manual"],
        visibility = visibility,
    )

def nodejs_binary(
        name,
        templated_args = [],
        enable_linker = False,
        **kwargs):
    npm_workspace = _node_modules_workspace_name()

    if not enable_linker:
        templated_args = templated_args + [
            # Disable the linker and rely on patched resolution which works better on Windows
            # and is less prone to race conditions when targets build concurrently.
            "--nobazel_run_linker",
        ]

    _nodejs_binary(
        name = name,
        npm_workspace = npm_workspace,
        linker_enabled = enable_linker,
        templated_args = templated_args,
        **kwargs
    )

def nodejs_test(name, templated_args = [], enable_linker = False, **kwargs):
    npm_workspace = _node_modules_workspace_name()

    if not enable_linker:
        templated_args = templated_args + [
            # Disable the linker and rely on patched resolution which works better on Windows
            # and is less prone to race conditions when targets build concurrently.
            "--nobazel_run_linker",
        ]

    _nodejs_test(
        name = name,
        templated_args = templated_args,
        linker_enabled = enable_linker,
        npm_workspace = npm_workspace,
        **kwargs
    )

def _node_modules_workspace_name():
    return "npm"

def npm_package_bin(args = [], **kwargs):
    _npm_package_bin(
        # Disable the linker and rely on patched resolution which works better on Windows
        # and is less prone to race conditions when targets build concurrently.
        args = ["--nobazel_run_linker"] + args,
        **kwargs
    )

# TODO(devversion): Jasmine Node tests are only bundled using `spec_bundle`
# because `async/await` syntax needs to be downleveled for ZoneJS. In the
# future this can be removed when ZoneJS can work with native async/await in NodeJS.
def zone_compatible_jasmine_node_test(name, external = [], srcs = [], deps = [], bootstrap = [], **kwargs):
    spec_bundle(
        name = "%s_bundle" % name,
        # Specs from this attribute are filtered and will be executed. We
        # add bootstrap here for discovery of the module mappings aspect.
        deps = srcs + deps + bootstrap,
        bootstrap = bootstrap,
        external = external + ["domino", "typescript"],
        platform = "node",
    )

    jasmine_node_test(
        name = name,
        deps = [":%s_bundle" % name],
        **kwargs
    )

def jasmine_node_test(name, srcs = [], data = [], bootstrap = [], env = {}, **kwargs):
    # Very common dependencies for tests
    deps = kwargs.pop("deps", []) + [
        "@npm//chokidar",
        "@npm//domino",
        "@npm//jasmine-core",
        "@npm//reflect-metadata",
        "@npm//source-map-support",
        "@npm//tslib",
        "@npm//xhr2",
    ]
    configuration_env_vars = kwargs.pop("configuration_env_vars", [])

    # Disable the linker and rely on patched resolution which works better on Windows
    # and is less prone to race conditions when targets build concurrently.
    templated_args = ["--nobazel_run_linker"] + kwargs.pop("templated_args", [])

    # We disable the linker, so the ESM node module loader needs to be enabled.
    npm_workspace = _node_modules_workspace_name()
    env = enable_esm_node_module_loader(npm_workspace, env)

    spec_entrypoint(
        name = "%s_spec_entrypoint.spec" % name,
        testonly = True,
        deps = deps + srcs,
        bootstrap = bootstrap,
    )

    extra_data = []

    if native.package_name().startswith("packages/"):
        extra_data.append("//packages:package_json")

    _jasmine_node_test(
        name = name,
        srcs = [":%s_spec_entrypoint.spec" % name],
        # Note: `deps`, `srcs` and `bootstrap` are explicitly added here as otherwise their linker
        # mappings may not be discovered, given the `bootstrap` attr not being covered by the aspect.
        data = extra_data + data + deps + srcs + bootstrap,
        use_direct_specs = True,
        configuration_env_vars = configuration_env_vars,
        env = env,
        templated_args = templated_args,
        use_esm = True,
        **kwargs
    )

# TODO: Consider removing this rule in favor of `esbuild` for more consistent bundling.
def rollup_bundle(name, testonly = False, sourcemap = "true", **kwargs):
    """A drop in replacement for the rules nodejs [legacy rollup_bundle].

    Runs [rollup_bundle], [terser_minified] and [babel] for downleveling to es5
    to produce a number of output bundles.

    es2015 iife                  : "%{name}.es2015.js"
    es2015 iife minified         : "%{name}.min.es2015.js"
    es2015 iife minified (debug) : "%{name}.min_debug.es2015.js"
    esm                          : "%{name}.esm.js"
    esm                          : "%{name}.min.esm.js"
    es5 iife                     : "%{name}.js"
    es5 iife minified            : "%{name}.min.js"
    es5 iife minified (debug)    : "%{name}.min_debug.js"
    es5 umd                      : "%{name}.es5umd.js"
    es5 umd minified             : "%{name}.min.es5umd.js"
    es2015 umd                   : "%{name}.umd.js"
    es2015 umd minified          : "%{name}.min.umd.js"

    ".js.map" files are also produced for each bundle.

    [legacy rollup_bundle]: https://github.com/bazelbuild/rules_nodejs/blob/0.38.3/internal/rollup/rollup_bundle.bzl
    [rollup_bundle]: https://bazelbuild.github.io/rules_nodejs/Rollup.html
    [terser_minified]: https://bazelbuild.github.io/rules_nodejs/Terser.html
    [babel]: https://babeljs.io/
    """

    # Common arguments for all terser_minified targets
    common_terser_args = {
        "args": ["--comments"],
        "sourcemap": False,
    }

    # esm
    _rollup_bundle(name = name + ".esm", testonly = testonly, format = "esm", sourcemap = sourcemap, **kwargs)
    terser_minified(name = name + ".min.esm", testonly = testonly, src = name + ".esm", **common_terser_args)
    native.filegroup(name = name + ".min.esm.js", testonly = testonly, srcs = [name + ".min.esm"])

    # es2015
    _rollup_bundle(name = name + ".es2015", testonly = testonly, format = "iife", sourcemap = sourcemap, **kwargs)
    terser_minified(name = name + ".min.es2015", testonly = testonly, src = name + ".es2015", **common_terser_args)
    native.filegroup(name = name + ".min.es2015.js", testonly = testonly, srcs = [name + ".min.es2015"])
    terser_minified(name = name + ".min_debug.es2015", testonly = testonly, src = name + ".es2015", **common_terser_args)
    native.filegroup(name = name + ".min_debug.es2015.js", testonly = testonly, srcs = [name + ".min_debug.es2015"])

    # es5
    tsc(
        name = name,
        testonly = testonly,
        outs = [
            name + ".js",
        ],
        args = [
            "$(execpath :%s.es2015.js)" % name,
            "--types",
            "--skipLibCheck",
            "--target",
            "es5",
            "--lib",
            "es2015,dom",
            "--allowJS",
            "--outFile",
            "$(execpath :%s.js)" % name,
        ],
        data = [
            name + ".es2015.js",
        ],
    )
    terser_minified(name = name + ".min", testonly = testonly, src = name + "", **common_terser_args)
    native.filegroup(name = name + ".min.js", testonly = testonly, srcs = [name + ".min"])
    terser_minified(name = name + ".min_debug", testonly = testonly, src = name + "", debug = True, **common_terser_args)
    native.filegroup(name = name + ".min_debug.js", testonly = testonly, srcs = [name + ".min_debug"])

    # umd
    _rollup_bundle(name = name + ".umd", testonly = testonly, format = "umd", sourcemap = sourcemap, **kwargs)
    terser_minified(name = name + ".min.umd", testonly = testonly, src = name + ".umd", **common_terser_args)
    native.filegroup(name = name + ".min.umd.js", testonly = testonly, srcs = [name + ".min.umd"])
    tsc(
        name = name + ".es5umd",
        testonly = testonly,
        outs = [
            name + ".es5umd.js",
        ],
        args = [
            "$(execpath :%s.umd.js)" % name,
            "--types",
            "--skipLibCheck",
            "--target",
            "es5",
            "--lib",
            "es2015,dom",
            "--allowJS",
            "--outFile",
            "$(execpath :%s.es5umd.js)" % name,
        ],
        data = [
            name + ".umd.js",
        ],
    )
    terser_minified(name = name + ".min.es5umd", testonly = testonly, src = name + ".es5umd", **common_terser_args)
    native.filegroup(name = name + ".min.es5umd.js", testonly = testonly, srcs = [name + ".min.es5umd"])

def tsec_test(**kwargs):
    """Default values for tsec_test"""
    _tsec_test(
        use_runfiles_on_windows = True,  # We explicitly enable runfiles in .bazelrc
        **kwargs
    )

def generate_api_docs(**kwargs):
    _generate_api_docs(
        # We need to specify import mappings for Angular packages that import other Angular
        # packages.
        import_map = {
            # We only need to specify top-level entry-points, and only those that
            # are imported from other packages.
            "//packages/animations:index.ts": "@angular/animations",
            "//packages/common:index.ts": "@angular/common",
            "//packages/core:index.ts": "@angular/core",
            "//packages/forms:index.ts": "@angular/forms",
            "//packages/localize:index.ts": "@angular/localize",
            "//packages/platform-browser-dynamic:index.ts": "@angular/platform-browser-dynamic",
            "//packages/platform-browser:index.ts": "@angular/platform-browser",
            "//packages/platform-server:index.ts": "@angular/platform-server",
            "//packages/router:index.ts": "@angular/router",
            "//packages/upgrade:index.ts": "@angular/upgrade",
        },
        **kwargs
    )
