"""Helper macros for running jasmine specs via karma"""

# Inspired by:
#   rules_nodejs concatjs: https://github.com/bazelbuild/rules_nodejs/blob/3.3.0/packages/concatjs/web_test/karma.conf.js
#   esbuild: https://gist.github.com/mattem/f6e85437b0dbcca661013a19247889a9

load("@io_bazel_rules_webtesting//web:web.bzl", _web_test_suite = "web_test_suite")
load("@npm//@bazel/esbuild:index.bzl", _esbuild = "esbuild")
load("@npm//karma:index.bzl", _karma = "karma")

KARMA_PEER_DEPS = [
    "@npm//karma-chrome-launcher",
    "@npm//karma-firefox-launcher",
    "@npm//karma-jasmine",
    "@npm//karma-sourcemap-loader",
    "@npm//karma-junit-reporter",
]

# https://github.com/bazelbuild/rules_nodejs/blob/3.3.0/packages/concatjs/web_test/karma_web_test.bzl#L94-L99
# Avoid using non-normalized paths (workspace/../other_workspace/path)
def _to_manifest_path(ctx, file):
    if file.short_path.startswith("../"):
        return file.short_path[3:]
    else:
        return ctx.workspace_name + "/" + file.short_path.replace(".ts", ".js")

# Generate a karma.config.js file to:
# - run the given bundle containing specs
# - serve the given assets via http
# - bootstrap a set of js files before the bundle
def _generate_karma_config_impl(ctx):
    configuration = ctx.outputs.configuration

    # root-relative (runfiles) path to the directory containing karma.conf
    config_segments = len(configuration.short_path.split("/"))

    # Extract the bundle directory out of the bundle target files
    bundle_dir = [f for f in ctx.attr.bundle[DefaultInfo].files.to_list() if f.is_directory][0]

    ctx.actions.expand_template(
        template = ctx.file._conf_tmpl,
        output = configuration,
        substitutions = {
            "TMPL_bootstrap_files": "\n  ".join(["'%s'," % _to_manifest_path(ctx, e) for e in ctx.files.bootstrap]),
            "TMPL_runfiles_path": "/".join([".."] * config_segments),
            "TMPL_static_files": "\n  ".join(["'%s'," % _to_manifest_path(ctx, e) for e in ctx.files.static_files]),
            "TMPL_test_bundle_dir": _to_manifest_path(ctx, bundle_dir),
        },
    )

_generate_karma_config = rule(
    implementation = _generate_karma_config_impl,
    attrs = {
        # https://github.com/bazelbuild/rules_nodejs/blob/3.3.0/packages/concatjs/web_test/karma_web_test.bzl#L34-L39
        "bootstrap": attr.label_list(
            doc = """JavaScript files to load via <script> *before* the specs""",
            allow_files = [".js", ".mjs"],
        ),
        "bundle": attr.label(
            doc = """The label producing the bundle directory containing the specs""",
            mandatory = True,
        ),

        # https://github.com/bazelbuild/rules_nodejs/blob/3.3.0/packages/concatjs/web_test/karma_web_test.bzl#L81-L87
        "static_files": attr.label_list(
            doc = """Arbitrary files which are available to be served on request""",
            allow_files = True,
        ),

        # https://github.com/bazelbuild/rules_nodejs/blob/3.3.0/packages/concatjs/web_test/karma_web_test.bzl#L88-L91
        "_conf_tmpl": attr.label(
            doc = """the karma config template""",
            cfg = "host",
            allow_single_file = True,
            default = Label("//tools:karma.conf.js"),
        ),
    },
    outputs = {
        "configuration": "%{name}.js",
    },
)

# Macro to convert a set of files into a web_test_suite
def karma_web_test_suite(name, browsers, specs, deps = [], bootstrap = [], static_files = []):
    """Run the given specs.

    Args:
        name: primary karma target rule name
        browsers: browsers to test
        specs: spec files containing tests
        deps: dependencies of the specs
        bootstrap: files loaded in <script> tags up front
        static_files: files available to download
    """
    bundle_name = "%s.bundle" % name
    suite_name = "%s.suite" % name
    karma_config_name = "%s.conf" % name
    karma_name = name

    # Bundle the spec files
    _esbuild(
        name = bundle_name,
        entry_points = [spec.replace(".ts", ".js") for spec in specs],
        output_dir = True,
        splitting = True,
        deps = deps,
        testonly = 1,
    )

    _generate_karma_config(
        name = karma_config_name,
        bundle = ":%s" % bundle_name,
        bootstrap = bootstrap,
        static_files = static_files,
        testonly = 1,
    )

    _karma(
        name = karma_name,
        testonly = 1,
        data = KARMA_PEER_DEPS + bootstrap + static_files + [
            # generated config + specs-bundle
            ":%s" % karma_config_name,
            ":%s" % bundle_name,
        ],
        templated_args = [
            "start",
            "$(rootpath %s)" % karma_config_name,
        ],
    )

    # Create a rules_webtesting web_test_suite wrapping the karma runner
    _web_test_suite(
        name = suite_name,
        test = ":" + karma_name,
        launcher = ":" + karma_name,
        testonly = 1,
        tags = ["native"],
        browsers = browsers,
    )

def ng_karma_web_test_suite(name, browsers, specs, deps = [], bootstrap = [], static_files = []):
    default_bootstrap = [
        "@npm//:node_modules/zone.js/dist/zone-testing-bundle.js",
        "@npm//:node_modules/reflect-metadata/Reflect.js",
    ]
    default_specs = [
        "//:initialize_testbed.js",
    ]
    default_deps = [
        "@npm//@angular/compiler",
        "@npm//@angular/platform-browser-dynamic",
        "//:initialize_testbed",
    ]

    karma_web_test_suite(
        name,
        browsers,
        specs = specs + default_specs,
        deps = deps + default_deps,
        bootstrap = bootstrap + default_bootstrap,
        static_files = static_files,
    )
