# Re-export of Bazel rules with repository-wide defaults

load("@rules_pkg//:pkg.bzl", "pkg_tar")
load("@build_bazel_rules_nodejs//:index.bzl", _pkg_npm = "pkg_npm")
load("@io_bazel_rules_sass//:defs.bzl", _npm_sass_library = "npm_sass_library", _sass_binary = "sass_binary", _sass_library = "sass_library")
load("@npm//@angular/bazel:index.bzl", _ng_module = "ng_module", _ng_package = "ng_package")
load("@npm//@angular/dev-infra-private/bazel/integration:index.bzl", _integration_test = "integration_test")
load("@npm//@angular/dev-infra-private/bazel/karma:index.bzl", _karma_web_test_suite = "karma_web_test_suite")
load("@npm//@angular/dev-infra-private/bazel/esbuild:index.bzl", _esbuild = "esbuild", _esbuild_config = "esbuild_config")
load("@npm//@angular/dev-infra-private/bazel/spec-bundling:index.bzl", _spec_bundle = "spec_bundle")
load("@npm//@angular/dev-infra-private/bazel/http-server:index.bzl", _http_server = "http_server")
load("@npm//@angular/dev-infra-private/bazel:extract_js_module_output.bzl", "extract_js_module_output")
load("@npm//@bazel/jasmine:index.bzl", _jasmine_node_test = "jasmine_node_test")
load("@npm//@bazel/protractor:index.bzl", _protractor_web_test_suite = "protractor_web_test_suite")
load("@npm//@bazel/concatjs:index.bzl", _ts_library = "ts_library")
load("@npm//tsec:index.bzl", _tsec_test = "tsec_test")
load("//:packages.bzl", "NO_STAMP_NPM_PACKAGE_SUBSTITUTIONS", "NPM_PACKAGE_SUBSTITUTIONS")
load("//:pkg-externals.bzl", "PKG_EXTERNALS")
load("//tools/markdown-to-html:index.bzl", _markdown_to_html = "markdown_to_html")
load("//tools/angular:index.bzl", "LINKER_PROCESSED_FW_PACKAGES")

_DEFAULT_TSCONFIG_BUILD = "//src:bazel-tsconfig-build.json"
_DEFAULT_TSCONFIG_TEST = "//src:tsconfig-test"

npmPackageSubstitutions = select({
    "//tools:stamp": NPM_PACKAGE_SUBSTITUTIONS,
    "//conditions:default": NO_STAMP_NPM_PACKAGE_SUBSTITUTIONS,
})

# Re-exports to simplify build file load statements
markdown_to_html = _markdown_to_html
integration_test = _integration_test
esbuild = _esbuild
esbuild_config = _esbuild_config
http_server = _http_server

def _make_tsec_test(target):
    package_name = native.package_name()
    if not package_name.startswith("src/components-examples") and \
       not package_name.endswith("/testing") and \
       not package_name.endswith("/schematics"):
        _tsec_test(
            name = target + "_tsec_test",
            target = target,
            tsconfig = "//src:tsec_config",
        )

def _compute_module_name(testonly):
    current_pkg = native.package_name()

    # For test-only targets we do not compute any module name as
    # those are not publicly exposed through the `@angular` scope.
    if testonly:
        return None

    # We generate no module name for files outside of `src/<pkg>` (usually tools).
    if not current_pkg.startswith("src/"):
        return None

    # Skip module name generation for internal apps which are not built as NPM package
    # and not scoped under `@angular/`. This includes e2e-app, dev-app and universal-app.
    if "-app" in current_pkg:
        return None

    # Construct module names based on the current Bazel package. e.g. if a target is
    # defined within `src/cdk/a11y` then the module name will be `@angular/cdk/a11y`.
    return "@angular/%s" % current_pkg[len("src/"):]

def _getDefaultTsConfig(testonly):
    if testonly:
        return _DEFAULT_TSCONFIG_TEST
    else:
        return _DEFAULT_TSCONFIG_BUILD

def sass_binary(sourcemap = False, **kwargs):
    _sass_binary(
        sourcemap = sourcemap,
        compiler = "//tools/sass:compiler",
        **kwargs
    )

def sass_library(**kwargs):
    _sass_library(**kwargs)

def npm_sass_library(**kwargs):
    _npm_sass_library(**kwargs)

def ts_library(
        tsconfig = None,
        deps = [],
        testonly = False,
        # TODO(devversion): disallow configuration of the target when schematics use ESM.
        devmode_target = None,
        prodmode_target = None,
        devmode_module = None,
        **kwargs):
    # Add tslib because we use import helpers for all public packages.
    local_deps = ["@npm//tslib"] + deps

    if not tsconfig:
        tsconfig = _getDefaultTsConfig(testonly)

    # Compute an AMD module name for the target.
    module_name = _compute_module_name(testonly)

    _ts_library(
        # `module_name` is used for AMD module names within emitted JavaScript files.
        module_name = module_name,
        # We use the module name as package name, so that the target can be resolved within
        # NodeJS executions, by activating the Bazel NodeJS linker.
        # See: https://github.com/bazelbuild/rules_nodejs/pull/2799.
        package_name = module_name,
        # For prodmode, the target is set to `ES2020`. `@bazel/typecript` sets `ES2015` by default. Note
        # that this should be in sync with the `ng_module` tsconfig generation to emit proper APF v13.
        # https://github.com/bazelbuild/rules_nodejs/blob/901df3868e3ceda177d3ed181205e8456a5592ea/third_party/github.com/bazelbuild/rules_typescript/internal/common/tsconfig.bzl#L195
        prodmode_target = prodmode_target if prodmode_target != None else "es2020",
        # We also set devmode output to the same settings as prodmode as a first step in combining
        # devmode and prodmode output. We will not rely on AMD output anyway due to the linker processing.
        devmode_target = devmode_target if devmode_target != None else "es2020",
        devmode_module = devmode_module if devmode_module != None else "esnext",
        tsconfig = tsconfig,
        testonly = testonly,
        deps = local_deps,
        **kwargs
    )

    if module_name and not testonly:
        _make_tsec_test(kwargs["name"])

def ng_module(
        deps = [],
        srcs = [],
        tsconfig = None,
        testonly = False,
        **kwargs):
    if not tsconfig:
        tsconfig = _getDefaultTsConfig(testonly)

    # Compute an AMD module name for the target.
    module_name = _compute_module_name(testonly)

    local_deps = [
        # Add tslib because we use import helpers for all public packages.
        "@npm//tslib",
        "@npm//@angular/platform-browser",
    ]

    # Append given deps only if they're not in the default set of deps
    for d in deps:
        if d not in local_deps:
            local_deps = local_deps + [d]

    _ng_module(
        srcs = srcs,
        # `module_name` is used for AMD module names within emitted JavaScript files.
        module_name = module_name,
        # We use the module name as package name, so that the target can be resolved within
        # NodeJS executions, by activating the Bazel NodeJS linker.
        # See: https://github.com/bazelbuild/rules_nodejs/pull/2799.
        package_name = module_name,
        strict_templates = True,
        deps = local_deps,
        tsconfig = tsconfig,
        testonly = testonly,
        **kwargs
    )

    if module_name and not testonly:
        _make_tsec_test(kwargs["name"])

def ng_package(name, srcs = [], deps = [], externals = PKG_EXTERNALS, readme_md = None, visibility = None, **kwargs):
    # If no readme file has been specified explicitly, use the default readme for
    # release packages from "src/README.md".
    if not readme_md:
        readme_md = "//src:README.md"

    # We need a genrule that copies the license into the current package. This
    # allows us to include the license in the "ng_package".
    native.genrule(
        name = "license_copied",
        srcs = ["//:LICENSE"],
        outs = ["LICENSE"],
        cmd = "cp $< $@",
    )

    _ng_package(
        name = name,
        externals = externals,
        srcs = srcs + [":license_copied"],
        deps = deps,
        # We never set a `package_name` for NPM packages, neither do we enable validation.
        # This is necessary because the source targets of the NPM packages all have
        # package names set and setting a similar `package_name` on the NPM package would
        # result in duplicate linker mappings that will conflict. e.g. consider the following
        # scenario: We have a `ts_library` for `@angular/cdk`. We will configure a package
        # name for the target so that it can be resolved in NodeJS executions from `node_modules`.
        # If we'd also set a `package_name` for the associated `pkg_npm` target, there would be
        # two mappings for `@angular/cdk` and the linker will complain. For a better development
        # experience, we want the mapping to resolve to the direct outputs of the `ts_library`
        # instead of requiring tests and other targets to assemble the NPM package first.
        package_name = None,
        validate = False,
        readme_md = readme_md,
        substitutions = npmPackageSubstitutions,
        visibility = visibility,
        **kwargs
    )

    pkg_tar(
        name = name + "_archive",
        srcs = [":%s" % name],
        extension = "tar.gz",
        strip_prefix = "./%s" % name,
        package_dir = "package/",
        # Target should not build on CI unless it is explicitly requested.
        tags = ["manual"],
        visibility = visibility,
    )

def pkg_npm(name, visibility = None, **kwargs):
    _pkg_npm(
        name = name,
        # We never set a `package_name` for NPM packages, neither do we enable validation.
        # This is necessary because the source targets of the NPM packages all have
        # package names set and setting a similar `package_name` on the NPM package would
        # result in duplicate linker mappings that will conflict. e.g. consider the following
        # scenario: We have a `ts_library` for `@angular/cdk`. We will configure a package
        # name for the target so that it can be resolved in NodeJS executions from `node_modules`.
        # If we'd also set a `package_name` for the associated `pkg_npm` target, there would be
        # two mappings for `@angular/cdk` and the linker will complain. For a better development
        # experience, we want the mapping to resolve to the direct outputs of the `ts_library`
        # instead of requiring tests and other targets to assemble the NPM package first.
        package_name = None,
        validate = False,
        substitutions = npmPackageSubstitutions,
        visibility = visibility,
        **kwargs
    )

    pkg_tar(
        name = name + "_archive",
        srcs = [":%s" % name],
        package_dir = "package/",
        extension = "tar.gz",
        strip_prefix = "./%s" % name,
        # Target should not build on CI unless it is explicitly requested.
        tags = ["manual"],
        visibility = visibility,
    )

def jasmine_node_test(**kwargs):
    kwargs["templated_args"] = ["--bazel_patch_module_resolver"] + kwargs.get("templated_args", [])
    _jasmine_node_test(**kwargs)

def ng_test_library(deps = [], **kwargs):
    local_deps = [
        # We declare "@angular/core" as default dependencies because
        # all Angular component unit tests use the `TestBed` and `Component` exports.
        "@npm//@angular/core",
        "@npm//@types/jasmine",
    ] + deps

    ts_library(
        testonly = True,
        deps = local_deps,
        **kwargs
    )

def ng_e2e_test_library(deps = [], **kwargs):
    local_deps = [
        "@npm//@types/jasmine",
        "@npm//@types/selenium-webdriver",
        "@npm//protractor",
    ] + deps

    ts_library(
        testonly = True,
        deps = local_deps,
        **kwargs
    )

def karma_web_test_suite(name, **kwargs):
    test_deps = kwargs.get("deps", [])

    kwargs["tags"] = ["partial-compilation-integration"] + kwargs.get("tags", [])
    kwargs["deps"] = ["%s_bundle" % name]

    spec_bundle(
        name = "%s_bundle" % name,
        deps = test_deps,
        platform = "browser",
    )

    # Set up default browsers if no explicit `browsers` have been specified.
    if not hasattr(kwargs, "browsers"):
        kwargs["tags"] = ["native"] + kwargs.get("tags", [])
        kwargs["browsers"] = [
            # Note: when changing the browser names here, also update the "yarn test"
            # script to reflect the new browser names.
            "@npm//@angular/dev-infra-private/bazel/browsers/chromium:chromium",
            "@npm//@angular/dev-infra-private/bazel/browsers/firefox:firefox",
        ]

    # Default test suite with all configured browsers, and the debug target being
    # setup from `@angular/dev-infra-private`.
    _karma_web_test_suite(
        name = name,
        **kwargs
    )

def protractor_web_test_suite(name, deps, **kwargs):
    spec_bundle(
        name = "%s_bundle" % name,
        deps = deps,
        platform = "cjs-legacy",
        external = ["protractor", "selenium-webdriver"],
    )

    _protractor_web_test_suite(
        name = name,
        browsers = ["@npm//@angular/dev-infra-private/bazel/browsers/chromium:chromium"],
        deps = ["%s_bundle" % name],
        **kwargs
    )

def node_integration_test(setup_chromium = False, node_repository = "nodejs", **kwargs):
    """Macro for defining an integration test with `node` and `yarn` being
      declared as global tools.

      By default the default Node version of the workspace is being used."""

    data = kwargs.pop("data", [])
    toolchains = kwargs.pop("toolchains", [])
    environment = kwargs.pop("environment", {})
    tool_mappings = kwargs.pop("tool_mappings", {})

    # Setup Yarn and Node as tools in a way that allows for them to be overridden.
    tool_mappings = dict({
        "//:yarn_vendored": "yarn",
        "@%s_toolchains//:resolved_toolchain" % node_repository: "node",
    }, **tool_mappings)

    # If Chromium should be configured, add it to the runfiles and expose its binaries
    # through test environment variables. The variables are auto-detected by e.g. Karma.
    if setup_chromium:
        data.append("@npm//@angular/dev-infra-private/bazel/browsers/chromium")
        toolchains.append("@npm//@angular/dev-infra-private/bazel/browsers/chromium:toolchain_alias")
        environment.update({
            "CHROMEDRIVER_BIN": "$(CHROMEDRIVER)",
            "CHROME_BIN": "$(CHROMIUM)",
        })

    integration_test(
        data = data,
        environment = environment,
        toolchains = toolchains,
        tool_mappings = tool_mappings,
        **kwargs
    )

def ng_web_test_suite(deps = [], static_css = [], exclude_init_script = False, **kwargs):
    bootstrap = [
        # This matches the ZoneJS bundles used in default CLI projects. See:
        # https://github.com/angular/angular-cli/blob/main/packages/schematics/angular/application/files/src/polyfills.ts.template#L58
        # https://github.com/angular/angular-cli/blob/main/packages/schematics/angular/application/files/src/test.ts.template#L3
        # Note `zone.js/dist/zone.js` is aliased in the CLI to point to the evergreen
        # output that does not include legacy patches. See: https://github.com/angular/angular/issues/35157.
        # TODO: Consider adding the legacy patches when testing Saucelabs/Browserstack with Bazel.
        # CLI loads the legacy patches conditionally for ES5 legacy browsers. See:
        # https://github.com/angular/angular-cli/blob/277bad3895cbce6de80aa10a05c349b10d9e09df/packages/angular_devkit/build_angular/src/angular-cli-files/models/webpack-configs/common.ts#L141
        "@npm//:node_modules/zone.js/dist/zone-evergreen.js",
        "@npm//:node_modules/zone.js/dist/zone-testing.js",
        "@npm//:node_modules/reflect-metadata/Reflect.js",
    ] + kwargs.pop("bootstrap", [])

    # Always include a prebuilt theme in the test suite because otherwise tests, which depend on CSS
    # that is needed for measuring, will unexpectedly fail. Also always adding a prebuilt theme
    # reduces the amount of setup that is needed to create a test suite Bazel target. Note that the
    # prebuilt theme will be also added to CDK test suites but shouldn't affect anything.
    static_css = static_css + [
        "//src/material/prebuilt-themes:indigo-pink",
        "//src/material-experimental/mdc-core/theming:indigo_pink_prebuilt",
    ]

    # Workaround for https://github.com/bazelbuild/rules_typescript/issues/301
    # Since some of our tests depend on CSS files which are not part of the `ng_module` rule,
    # we need to somehow load static CSS files within Karma (e.g. overlay prebuilt). Those styles
    # are required for successful test runs. Since the `karma_web_test_suite` rule currently only
    # allows JS files to be included and served within Karma, we need to create a JS file that
    # loads the given CSS file.
    for css_label in static_css:
        css_id = "static-css-file-%s" % (css_label.replace("/", "_").replace(":", "-"))
        bootstrap.append(":%s" % css_id)

        native.genrule(
            name = css_id,
            srcs = [css_label],
            outs = ["%s.css.js" % css_id],
            output_to_bindir = True,
            cmd = """
        files=($(execpaths %s))
        # Escape all double-quotes so that the content can be safely inlined into the
        # JS template. Note that it needs to be escaped a second time because the string
        # will be evaluated first in Bash and will then be stored in the JS output.
        css_content=$$(cat $${files[0]} | sed 's/"/\\\\"/g')
        js_template='var cssElement = document.createElement("style"); \
                    cssElement.type = "text/css"; \
                    cssElement.innerHTML = "'"$$css_content"'"; \
                    document.head.appendChild(cssElement);'
         echo "$$js_template" > $@
      """ % css_label,
        )

    karma_web_test_suite(
        # Depend on our custom test initialization script. This needs to be the first dependency.
        deps = deps if exclude_init_script else ["//test:angular_test_init"] + deps,
        bootstrap = bootstrap,
        **kwargs
    )

def spec_bundle(name, deps, **kwargs):
    # TODO: Rename once devmode and prodmode have been combined.
    # For spec bundling we also only consume devmode output as it is ESM in this repository.
    # This helps speeding up development experience as ESBuild (used internally by the rule)
    # would request both devmode and prodmode output flavor (resulting in 2x TS compilations).
    extract_js_module_output(
        name = "%s_devmode_deps" % name,
        deps = deps,
        provider = "JSModuleInfo",
        forward_linker_mappings = True,
        include_external_npm_packages = True,
        include_default_files = False,
        include_declarations = False,
        testonly = True,
    )

    _spec_bundle(
        name = name,
        # For specs, we always add the pre-processed linker FW packages so that these
        # are resolved instead of the unprocessed FW entry-points through the `node_modules`.
        deps = ["%s_devmode_deps" % name] + LINKER_PROCESSED_FW_PACKAGES,
        workspace_name = "angular_material",
        run_angular_linker = select({
            # Depending on whether partial compilation is enabled, we may want to run the linker
            # to test the Angular compiler linker AOT processing. Additionally, a config setting
            # can forcibly disable the linker to ensure tests rely on JIT linking at runtime.
            "//tools:force_partial_jit_compilation_enabled": False,
            "//tools:partial_compilation_enabled": True,
            "//conditions:default": False,
        }),
        **kwargs
    )

# TODO: Rename once devmode and prodmode have been combined.
def devmode_esbuild(name, deps, testonly = False, **kwargs):
    """Extension of the default `@bazel/esbuild` rule so that only devmode ESM output
    is requested. This is done to speed up local development because the ESBuild rule
    by default requests all possible output flavors/modes."""
    extract_js_module_output(
        name = "%s_devmode_deps" % name,
        deps = deps,
        testonly = testonly,
        forward_linker_mappings = True,
        include_external_npm_packages = True,
        include_default_files = False,
        include_declarations = False,
        provider = "JSModuleInfo",
    )

    _esbuild(
        name = name,
        deps = ["%s_devmode_deps" % name],
        testonly = testonly,
        **kwargs
    )
