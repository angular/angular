"""Re-export of some bazel rules with repository-wide defaults."""

load("@rules_pkg//:pkg.bzl", "pkg_tar")
load("@build_bazel_rules_nodejs//:index.bzl", _npm_package_bin = "npm_package_bin", _pkg_npm = "pkg_npm")
load("@npm//@bazel/jasmine:index.bzl", _jasmine_node_test = "jasmine_node_test")
load("@npm//@bazel/concatjs:index.bzl", _concatjs_devserver = "concatjs_devserver", _ts_config = "ts_config", _ts_library = "ts_library")
load("@npm//@bazel/rollup:index.bzl", _rollup_bundle = "rollup_bundle")
load("@npm//@bazel/terser:index.bzl", "terser_minified")
load("@npm//@bazel/protractor:index.bzl", _protractor_web_test_suite = "protractor_web_test_suite")
load("@npm//typescript:index.bzl", "tsc")
load("@npm//@angular/build-tooling/bazel/app-bundling:index.bzl", _app_bundle = "app_bundle")
load("@npm//@angular/build-tooling/bazel/http-server:index.bzl", _http_server = "http_server")
load("@npm//@angular/build-tooling/bazel/karma:index.bzl", _karma_web_test = "karma_web_test", _karma_web_test_suite = "karma_web_test_suite")
load("@npm//@angular/build-tooling/bazel/api-golden:index.bzl", _api_golden_test = "api_golden_test", _api_golden_test_npm_package = "api_golden_test_npm_package")
load("@npm//@angular/build-tooling/bazel:extract_js_module_output.bzl", "extract_js_module_output")
load("@npm//@angular/build-tooling/bazel:extract_types.bzl", _extract_types = "extract_types")
load("@npm//@angular/build-tooling/bazel/esbuild:index.bzl", _esbuild = "esbuild", _esbuild_config = "esbuild_config")
load("@npm//@angular/build-tooling/bazel/spec-bundling:spec-entrypoint.bzl", "spec_entrypoint")
load("@npm//@angular/build-tooling/bazel/spec-bundling:index.bzl", "spec_bundle")
load("@npm//tsec:index.bzl", _tsec_test = "tsec_test")
load("//packages/bazel:index.bzl", _ng_module = "ng_module", _ng_package = "ng_package")
load("//tools/esm-interop:index.bzl", "enable_esm_node_module_loader", "extract_esm_outputs", _nodejs_binary = "nodejs_binary", _nodejs_test = "nodejs_test")

_DEFAULT_TSCONFIG_TEST = "//packages:tsconfig-test"
_INTERNAL_NG_MODULE_COMPILER = "//packages/bazel/src/ngc-wrapped"
_INTERNAL_NG_MODULE_XI18N = "//packages/bazel/src/ngc-wrapped:xi18n"
_INTERNAL_NG_PACKAGE_PACKAGER = "//packages/bazel/src/ng_package:packager"
_INTERNAL_NG_PACKAGE_DEFAULT_ROLLUP_CONFIG_TMPL = "//packages/bazel/src/ng_package:rollup.config.js"
_INTERNAL_NG_PACKAGE_DEFAULT_ROLLUP = "//packages/bazel/src/ng_package:rollup_for_ng_package"

esbuild = _esbuild
esbuild_config = _esbuild_config
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

def _default_module_name(testonly):
    """ Provide better defaults for package names.

    e.g. rather than angular/packages/core/testing we want @angular/core/testing

    TODO(alexeagle): we ought to supply a default module name for every library in the repo.
    But we short-circuit below in cases that are currently not working.
    """
    pkg = native.package_name()

    if testonly:
        # Some tests currently rely on the long-form package names
        return None

    if pkg.startswith("packages/bazel"):
        # Avoid infinite recursion in the ViewEngine compiler. Error looks like:
        #  Compiling Angular templates (ngc) //packages/bazel/test/ngc-wrapped/empty:empty failed (Exit 1)
        # : RangeError: Maximum call stack size exceeded
        #    at normalizeString (path.js:57:25)
        #    at Object.normalize (path.js:1132:12)
        #    at Object.join (path.js:1167:18)
        #    at resolveModule (execroot/angular/bazel-out/host/bin/packages/bazel/src/ngc-wrapped/ngc-wrapped.runfiles/angular/packages/compiler-cli/src/metadata/bundler.js:582:50)
        #    at MetadataBundler.exportAll (execroot/angular/bazel-out/host/bin/packages/bazel/src/ngc-wrapped/ngc-wrapped.runfiles/angular/packages/compiler-cli/src/metadata/bundler.js:119:42)
        #    at MetadataBundler.exportAll (execroot/angular/bazel-out/host/bin/packages/bazel/src/ngc-wrapped/ngc-wrapped.runfiles/angular/packages/compiler-cli/src/metadata/bundler.js:121:52)
        return None

    if pkg.startswith("packages/"):
        return "@angular/" + pkg[len("packages/"):]

    return None

def ts_devserver(**kwargs):
    """Default values for ts_devserver"""
    serving_path = kwargs.pop("serving_path", "/app_bundle.js")
    _concatjs_devserver(
        serving_path = serving_path,
        **kwargs
    )

ts_config = _ts_config

def ts_library(
        name,
        tsconfig = None,
        testonly = False,
        deps = [],
        module_name = None,
        package_name = None,
        devmode_module = None,
        **kwargs):
    """Default values for ts_library"""
    deps = deps + ["@npm//tslib"]
    if testonly:
        # Match the types[] in //packages:tsconfig-test.json
        deps.append("@npm//@types/jasmine")
        deps.append("@npm//@types/node")
        deps.append("@npm//@types/events")
    if not tsconfig and testonly:
        tsconfig = _DEFAULT_TSCONFIG_TEST

    if not module_name:
        module_name = _default_module_name(testonly)

    # If no `package_name` is explicitly set, we use the default module name as package
    # name, so that the target can be resolved within NodeJS executions, by activating
    # the Bazel NodeJS linker. See: https://github.com/bazelbuild/rules_nodejs/pull/2799.
    if not package_name:
        package_name = _default_module_name(testonly)

    default_target = "es2020"
    default_module = "esnext"

    _ts_library(
        name = name,
        tsconfig = tsconfig,
        testonly = testonly,
        deps = deps,
        # TODO(ESM): Remove when schematics work with ESM.
        devmode_target = default_target,
        devmode_module = devmode_module if devmode_module != None else default_module,
        # For prodmode, the target is set to `ES2020`. `@bazel/typecript` sets `ES2015` by
        # default. Note that this should be in sync with the `ng_module` tsconfig generation.
        # https://github.com/bazelbuild/rules_nodejs/blob/901df3868e3ceda177d3ed181205e8456a5592ea/third_party/github.com/bazelbuild/rules_typescript/internal/common/tsconfig.bzl#L195
        # https://github.com/bazelbuild/rules_nodejs/blob/9b36274dba34204625579463e3da054a9f42cb47/packages/typescript/internal/build_defs.bzl#L85.
        prodmode_target = default_target,
        prodmode_module = default_module,
        # `module_name` is used for AMD module names within emitted JavaScript files.
        module_name = module_name,
        # `package_name` can be set to allow for the Bazel NodeJS linker to run. This
        # allows for resolution of the given target within the `node_modules/`.
        package_name = package_name,
        **kwargs
    )

def ng_module(name, tsconfig = None, entry_point = None, testonly = False, deps = [], module_name = None, package_name = None, **kwargs):
    """Default values for ng_module"""
    deps = deps + ["@npm//tslib"]
    if testonly:
        # Match the types[] in //packages:tsconfig-test.json
        deps.append("@npm//@types/jasmine")
        deps.append("@npm//@types/node")
        deps.append("@npm//@types/events")
    if not tsconfig and testonly:
        tsconfig = _DEFAULT_TSCONFIG_TEST

    if not module_name:
        module_name = _default_module_name(testonly)

    # If no `package_name` is explicitly set, we use the default module name as package
    # name, so that the target can be resolved within NodeJS executions, by activating
    # the Bazel NodeJS linker. See: https://github.com/bazelbuild/rules_nodejs/pull/2799.
    if not package_name:
        package_name = _default_module_name(testonly)

    if not entry_point:
        entry_point = "public_api.ts"
    _ng_module(
        name = name,
        flat_module_out_file = name,
        tsconfig = tsconfig,
        entry_point = entry_point,
        testonly = testonly,
        deps = deps,
        compiler = _INTERNAL_NG_MODULE_COMPILER,
        ng_xi18n = _INTERNAL_NG_MODULE_XI18N,
        # `module_name` is used for AMD module names within emitted JavaScript files.
        module_name = module_name,
        # `package_name` can be set to allow for the Bazel NodeJS linker to run. This
        # allows for resolution of the given target within the `node_modules/`.
        package_name = package_name,
        perf_flag = "//packages/compiler-cli:ng_perf",
        **kwargs
    )

def ng_package(name, readme_md = None, license_banner = None, deps = [], **kwargs):
    """Default values for ng_package"""
    if not readme_md:
        readme_md = "//packages:README.md"
    if not license_banner:
        license_banner = "//packages:license-banner.txt"
    visibility = kwargs.pop("visibility", None)

    common_substitutions = dict(kwargs.pop("substitutions", {}), **PKG_GROUP_REPLACEMENTS)
    substitutions = dict(common_substitutions, **{
        "0.0.0-PLACEHOLDER": "0.0.0",
    })
    stamped_substitutions = dict(common_substitutions, **{
        "0.0.0-PLACEHOLDER": "{BUILD_SCM_VERSION}",
    })

    _ng_package(
        name = name,
        deps = deps,
        validate = True,
        readme_md = readme_md,
        license_banner = license_banner,
        substitutions = select({
            "//:stamp": stamped_substitutions,
            "//conditions:default": substitutions,
        }),
        ng_packager = _INTERNAL_NG_PACKAGE_PACKAGER,
        rollup_config_tmpl = _INTERNAL_NG_PACKAGE_DEFAULT_ROLLUP_CONFIG_TMPL,
        rollup = _INTERNAL_NG_PACKAGE_DEFAULT_ROLLUP,
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

def pkg_npm(name, validate = True, use_prodmode_output = False, **kwargs):
    """Default values for pkg_npm"""
    visibility = kwargs.pop("visibility", None)

    common_substitutions = dict(kwargs.pop("substitutions", {}), **PKG_GROUP_REPLACEMENTS)
    substitutions = dict(common_substitutions, **{
        "0.0.0-PLACEHOLDER": "0.0.0",
    })
    stamped_substitutions = dict(common_substitutions, **{
        "0.0.0-PLACEHOLDER": "{BUILD_SCM_VERSION}",
    })

    deps = kwargs.pop("deps", [])

    # The `pkg_npm` rule brings in devmode (`JSModuleInfo`) and prodmode (`JSEcmaScriptModuleInfo`)
    # output into the the NPM package We do not intend to ship the prodmode ECMAScript `.mjs`
    # files, but the `JSModuleInfo` outputs (which correspond to devmode output). Depending on
    # the `use_prodmode_output` macro attribute, we either ship the ESM output of dependencies,
    # or continue shipping the devmode ES5 output.
    # TODO: Clean this up in the future if we have combined devmode and prodmode output.
    # https://github.com/bazelbuild/rules_nodejs/commit/911529fd364eb3ee1b8ecdc568a9fcf38a8b55ca.
    # https://github.com/bazelbuild/rules_nodejs/blob/stable/packages/typescript/internal/build_defs.bzl#L334-L337.
    extract_js_module_output(
        name = "%s_js_module_output" % name,
        provider = "JSEcmaScriptModuleInfo" if use_prodmode_output else "JSModuleInfo",
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
        visibility = visibility,
        deps = [":%s_js_module_output" % name],
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

def karma_web_test_suite(name, external = [], **kwargs):
    """Default values for karma_web_test_suite"""

    # Default value for bootstrap
    bootstrap = kwargs.pop("bootstrap", [
        "//tools/testing:browser",
    ])

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
        browsers = [
            "@npm//@angular/build-tooling/bazel/browsers/chromium:chromium",
            "@npm//@angular/build-tooling/bazel/browsers/firefox:firefox",
        ],
        data = data,
        tags = tags,
        **kwargs
    )

    # Add a saucelabs target for these karma tests
    _karma_web_test(
        name = "saucelabs_%s" % name,
        # Default timeout is moderate (5min). This causes the test to be terminated while
        # Saucelabs browsers keep running. Ultimately resulting in failing tests and browsers
        # unnecessarily being acquired. Our specified Saucelabs idle timeout is 10min, so we use
        # Bazel's long timeout (15min). This ensures that Karma can shut down properly.
        timeout = "long",
        bootstrap = bootstrap,
        config_file = "//:karma-js.conf.js",
        deps = [
            "@npm//karma-sauce-launcher",
            ":%s_bundle" % name,
        ],
        data = data + [
            "//:browser-providers.conf.js",
        ],
        karma = "//tools/saucelabs:karma-saucelabs",
        tags = tags + [
            "exclusive",
            "manual",
            "no-remote-exec",
            "saucelabs",
        ],
        configuration_env_vars = ["KARMA_WEB_TEST_MODE"],
        **kwargs
    )

def protractor_web_test_suite(**kwargs):
    """Default values for protractor_web_test_suite"""

    _protractor_web_test_suite(
        browsers = ["@npm//@angular/build-tooling/bazel/browsers/chromium:chromium"],
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
    return "npm" if not native.package_name().startswith("aio") else "aio_npm"

def npm_package_bin(args = [], **kwargs):
    _npm_package_bin(
        # Disable the linker and rely on patched resolution which works better on Windows
        # and is less prone to race conditions when targets build concurrently.
        args = ["--nobazel_run_linker"] + args,
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

    extract_esm_outputs(
        name = "%s_esm_deps" % name,
        testonly = True,
        deps = deps + srcs,
    )

    extract_esm_outputs(
        name = "%s_esm_bootstrap" % name,
        testonly = True,
        deps = bootstrap,
    )

    spec_entrypoint(
        name = "%s_spec_entrypoint.spec" % name,
        testonly = True,
        deps = [":%s_esm_deps" % name],
        bootstrap = [":%s_esm_bootstrap" % name],
    )

    _jasmine_node_test(
        name = name,
        srcs = [":%s_spec_entrypoint.spec" % name],
        data = data + [":%s_esm_bootstrap" % name, ":%s_esm_deps" % name],
        use_direct_specs = True,
        configuration_env_vars = configuration_env_vars,
        env = env,
        templated_args = templated_args,
        use_esm = True,
        **kwargs
    )

def app_bundle(**kwargs):
    """Default values for app_bundle"""
    _app_bundle(**kwargs)

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
