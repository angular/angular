"""Re-export of some bazel rules with repository-wide defaults."""

load("@build_bazel_rules_nodejs//:index.bzl", "generated_file_test", _npm_package_bin = "npm_package_bin", _pkg_npm = "pkg_npm")
load("@npm//@angular/build-tooling/bazel:extract_js_module_output.bzl", "extract_js_module_output")
load("@npm//@angular/build-tooling/bazel:extract_types.bzl", _extract_types = "extract_types")
load("@npm//@angular/build-tooling/bazel/api-golden:index.bzl", _api_golden_test = "api_golden_test", _api_golden_test_npm_package = "api_golden_test_npm_package")
load("@npm//@angular/build-tooling/bazel/esbuild:index.bzl", _esbuild = "esbuild", _esbuild_config = "esbuild_config", _esbuild_esm_bundle = "esbuild_esm_bundle")
load("@npm//@angular/build-tooling/bazel/http-server:index.bzl", _http_server = "http_server")
load("@npm//@angular/build-tooling/bazel/karma:index.bzl", _karma_web_test = "karma_web_test", _karma_web_test_suite = "karma_web_test_suite")
load("@npm//@angular/build-tooling/bazel/spec-bundling:index.bzl", "spec_bundle")
load("@npm//@angular/build-tooling/bazel/spec-bundling:spec-entrypoint.bzl", "spec_entrypoint")
load("@npm//@bazel/concatjs:index.bzl", _ts_config = "ts_config", _ts_library = "ts_library")
load("@npm//@bazel/jasmine:index.bzl", _jasmine_node_test = "jasmine_node_test")
load("@npm//@bazel/protractor:index.bzl", _protractor_web_test_suite = "protractor_web_test_suite")
load("@npm//@bazel/rollup:index.bzl", _rollup_bundle = "rollup_bundle")
load("@npm//@bazel/terser:index.bzl", "terser_minified")
load("@npm//typescript:index.bzl", "tsc")
load("@rules_pkg//:pkg.bzl", "pkg_tar")
load("//adev/shared-docs/pipeline/api-gen:generate_api_docs.bzl", _generate_api_docs = "generate_api_docs")
load("//tools/bazel:module_name.bzl", "compute_module_name")
load("//tools/bazel:tsec.bzl", _tsec_test = "tsec_test")
load("//tools/esm-interop:index.bzl", "enable_esm_node_module_loader", _nodejs_binary = "nodejs_binary", _nodejs_test = "nodejs_test")

_DEFAULT_TSCONFIG_TEST = "//packages:tsconfig-test"

esbuild_config = _esbuild_config
esbuild_esm_bundle = _esbuild_esm_bundle
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

ts_config = _ts_config

def ts_library(
        name,
        tsconfig = None,
        testonly = False,
        deps = [],
        module_name = None,
        package_name = None,
        devmode_target = "es2022",
        prodmode_target = "es2022",
        **kwargs):
    """Default values for ts_library"""
    deps = deps + ["@npm//tslib"]
    if testonly:
        # Match the types[] in //packages:tsconfig-test.json
        deps.append("@npm//@types/jasmine")
        deps.append("@npm//@types/node")
    if not tsconfig and testonly:
        tsconfig = _DEFAULT_TSCONFIG_TEST

    if not module_name:
        module_name = compute_module_name(testonly)

    # If no `package_name` is explicitly set, we use the default module name as package
    # name, so that the target can be resolved within NodeJS executions, by activating
    # the Bazel NodeJS linker. See: https://github.com/bazelbuild/rules_nodejs/pull/2799.
    if not package_name:
        package_name = compute_module_name(testonly)

    default_module = "esnext"

    _ts_library(
        name = name,
        tsconfig = tsconfig,
        testonly = testonly,
        deps = deps,
        devmode_target = devmode_target,
        devmode_module = default_module,
        # For prodmode, the target is set to `ES2022`. `@bazel/typecript` sets `ES2015` by
        # default. Note that this should be in sync with the `ng_module` tsconfig generation.
        # https://github.com/bazelbuild/rules_nodejs/blob/901df3868e3ceda177d3ed181205e8456a5592ea/third_party/github.com/bazelbuild/rules_typescript/internal/common/tsconfig.bzl#L195
        # https://github.com/bazelbuild/rules_nodejs/blob/9b36274dba34204625579463e3da054a9f42cb47/packages/typescript/internal/build_defs.bzl#L85.
        prodmode_target = prodmode_target,
        prodmode_module = default_module,
        # `module_name` is used for AMD module names within emitted JavaScript files.
        module_name = module_name,
        # `package_name` can be set to allow for the Bazel NodeJS linker to run. This
        # allows for resolution of the given target within the `node_modules/`.
        package_name = package_name,
        **kwargs
    )

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

def karma_web_test_suite(
        name,
        external = [],
        zoneless = False,
        browsers = [
            "@npm//@angular/build-tooling/bazel/browsers/chromium:chromium",
            "@npm//@angular/build-tooling/bazel/browsers/firefox:firefox",
        ],
        **kwargs):
    """Default values for karma_web_test_suite"""

    # Default value for bootstrap
    bootstrap = kwargs.pop("bootstrap", [])
    bootstrap.extend(["//tools/testing:browser_zoneless"] if zoneless else ["//tools/testing:browser"])

    # Add common deps
    deps = kwargs.pop("deps", [])
    data = kwargs.pop("data", [])
    tags = kwargs.pop("tags", [])

    spec_bundle(
        name = "%s_bundle" % name,
        # Specs from this attribute are filtered and will be executed. We
        # add bootstrap here for discovery of the module mappings aspect.
        deps = deps + bootstrap,
        bootstrap = bootstrap,
        workspace_name = "angular",
        external = external,
        platform = "browser",
    )

    _karma_web_test_suite(
        name = name,
        deps = [":%s_bundle" % name],
        browsers = browsers,
        data = data,
        tags = tags,
        **kwargs
    )

    # Add a saucelabs target for Karma tests in `//packages/`.
    if native.package_name().startswith("packages/"):
        _karma_web_test(
            name = "{}_saucelabs".format(name),
            # Default timeout is moderate (5min). This causes the test to be terminated while
            # Saucelabs browsers keep running. Ultimately resulting in failing tests and browsers
            # unnecessarily being acquired. Our specified Saucelabs idle timeout is 10min, so we use
            # Bazel's long timeout (15min). This ensures that Karma can shut down properly.
            timeout = "long",
            config_file = "//:karma-js.conf.js",
            deps = [
                ":%s_bundle" % name,
            ],
            data = data + [
                "//:browser-providers.conf.js",
                "//tools/saucelabs-daemon/launcher:launcher_cjs",
            ],
            tags = tags + [
                "manual",
                "no-remote-exec",
                # Requires network to be able to access saucelabs daemon
                "requires-network",
                # Prevent the sandbox from being used so that it can communicate with the saucelabs daemon
                "no-sandbox",
                "saucelabs",
            ],
            configuration_env_vars = ["KARMA_WEB_TEST_MODE"],
            **kwargs
        )

def protractor_web_test_suite(
        name,
        deps = [],
        external = [],
        browsers = ["@npm//@angular/build-tooling/bazel/browsers/chromium:chromium"],
        **kwargs):
    """Default values for protractor_web_test_suite"""
    spec_bundle(
        name = "%s_bundle" % name,
        deps = deps,
        platform = "cjs-legacy",
        external = external + ["protractor"],
    )

    _protractor_web_test_suite(
        name = name,
        deps = [":%s_bundle" % name],
        browsers = browsers,
        **kwargs
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

def esbuild_jasmine_node_test(name, specs = [], external = [], bootstrap = [], **kwargs):
    templated_args = kwargs.pop("templated_args", []) + [
        # TODO: Disable the linker fully here. Currently it is needed for ESM.
        "--bazel_patch_module_resolver",
    ]

    deps = kwargs.pop("deps", []) + [
        "@npm//chokidar",
        "@npm//domino",
        "@npm//jasmine-core",
        "@npm//reflect-metadata",
        "@npm//source-map-support",
        "@npm//tslib",
        "@npm//xhr2",
    ]

    spec_bundle(
        name = "%s_test_bundle" % name,
        platform = "node",
        target = "es2020",
        bootstrap = bootstrap,
        deps = specs + deps,
        external = external,
    )

    _jasmine_node_test(
        name = name,
        srcs = [":%s_test_bundle" % name],
        use_direct_specs = True,
        templated_args = templated_args,
        deps = deps,
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

def api_golden_test(**kwargs):
    _api_golden_test(
        **kwargs
    )

def api_golden_test_npm_package(**kwargs):
    _api_golden_test_npm_package(
        **kwargs
    )

def tsec_test(**kwargs):
    """Default values for tsec_test"""
    _tsec_test(
        use_runfiles_on_windows = True,  # We explicitly enable runfiles in .bazelrc
        **kwargs
    )

def esbuild(args = None, **kwargs):
    _esbuild(
        args = args if args else {
            "resolveExtensions": [".mjs", ".js", ".json"],
        },
        **kwargs
    )

def esbuild_checked_in(name, **kwargs):
    esbuild_esm_bundle(
        name = "%s_generated" % name,
        # Unfortunately we need to omit source maps from the checked-in files as these
        # will vary based on the platform. See more details below in the sanitization
        # genrule transformation. It is acceptable not having source-maps for the checked-in
        # files as those are not minified and its to debug, the checked-in file can be visited.
        sourcemap = "external",
        # We always disable minification for checked-in files as otherwise it will
        # become difficult determining potential differences. e.g. on Windows ESBuild
        # accidentally included `source-map-support` due to the missing sandbox.
        minify = False,
        **kwargs
    )

    # ESBuild adds comments and function identifiers with the name of their module
    # location. e.g. `"bazel-out/x64_windows-fastbuild/bin/node_modules/a"function(exports)`.
    # We strip all of these paths as that would break approval of the he checked-in files within
    # different platforms (e.g. RBE running with K8). Additionally these paths depend
    # on the non-deterministic hoisting of the package manager across all platforms.
    native.genrule(
        name = "%s_sanitized" % name,
        srcs = ["%s_generated.js" % name],
        outs = ["%s_sanitized.js" % name],
        cmd = """cat $< | sed -E "s#(bazel-out|node_modules)/[^\\"']+##g" > $@""",
    )

    generated_file_test(
        name = name,
        src = "%s.js" % name,
        generated = "%s_sanitized.js" % name,
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
