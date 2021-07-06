# Copyright Google LLC All Rights Reserved.
#
# Use of this source code is governed by an MIT-style license that can be
# found in the LICENSE file at https://angular.io/license

load("@build_bazel_rules_nodejs//:index.bzl", "npm_package_bin")
load("@npm//@bazel/terser:index.bzl", "terser_minified")
load("@npm//@bazel/rollup:index.bzl", "rollup_bundle")
load("//dev-infra/bazel:expand_template.bzl", "expand_template")

def ng_rollup_bundle(
        name,
        entry_point,
        deps = [],
        license_banner = None,
        build_optimizer = True,
        visibility = None,
        format = "iife",
        globals = {},
        **kwargs):
    """Rollup with Build Optimizer on target prodmode output (ESM2015).

    This provides an extension of the [rollup_bundle] rule that works better for Angular apps.

    Runs [rollup], [terser_minified] and [brotli] to produce a number of output bundles.

    es2015                          : "%{name}.js"
    es2015 minified                 : "%{name}.min.js"
    es2015 minified (compressed)    : "%{name}.min.js.br",
    es2015 minified (debug)         : "%{name}.min_debug.js"

    It registers `@angular-devkit/build-optimizer` as a rollup plugin by default. This helps
    with further optimization. See https://github.com/angular/angular-cli/tree/master/packages/angular_devkit/build_optimizer.

    [rollup_bundle]: https://github.com/bazelbuild/rules_nodejs/blob/1.x/packages/rollup/src/rollup_bundle.bzl
    [rollup]: https://rollupjs.org/guide/en/
    [terser_minified]: https://bazelbuild.github.io/rules_nodejs/Terser.html
    [brotli]: https://brotli.org/
    """

    config_data = [license_banner] if license_banner else []

    expand_template(
        name = "%s_rollup_config" % name,
        template = "//dev-infra/benchmark/ng_rollup_bundle:rollup.config-tmpl.js",
        output_name = "%s_rollup_config.js" % name,
        configuration_env_vars = ["angular_ivy_enabled"],
        data = config_data,
        substitutions = {
            "TMPL_build_optimizer": "true" if build_optimizer else "false",
            "TMPL_banner_file": "\"$(execpath %s)\"" % license_banner if license_banner else "undefined",
            "TMPL_external": ", ".join(["'%s'" % e for e in globals.keys()]),
            "TMPL_globals": ", ".join(["'%s': '%s'" % (g, g) for g in globals]),
        },
        visibility = visibility,
    )

    rollup_bundle(
        name = name,
        config_file = "%s_rollup_config" % name,
        entry_points = {
            (entry_point): name,
        },
        visibility = visibility,
        deps = config_data + deps + [
            "@npm//rollup-plugin-node-resolve",
            "@npm//rollup-plugin-sourcemaps",
            "@npm//rollup-plugin-commonjs",
            "@npm//@angular-devkit/build-optimizer",
        ],
        silent = True,
        format = format,
        sourcemap = "true",
        # TODO(devversion): consider removing when View Engine is removed. View Engine
        # uses Bazel manifest path imports in generated factory files.
        # e.g. `import "<workspace_root>/<..>/some_file";`
        link_workspace_root = True,
        **kwargs
    )

    common_terser_options = {
        "visibility": visibility,
        "config_file": "//dev-infra/benchmark/ng_rollup_bundle:terser_config.json",
        # TODO: Enable source maps for better debugging when `@bazel/terser` pre-declares
        # JS and map outputs. Tracked with: DEV-120
        "sourcemap": False,
    }

    terser_minified(name = name + ".min", src = name + ".js", **common_terser_options)
    native.filegroup(name = name + ".min.js", srcs = [name + ".min"], visibility = visibility)
    terser_minified(name = name + ".min_debug", src = name + ".js", debug = True, **common_terser_options)
    native.filegroup(name = name + ".min_debug.js", srcs = [name + ".min_debug"], visibility = visibility)

    npm_package_bin(
        name = "_%s_brotli" % name,
        tool = "//dev-infra/benchmark/brotli-cli",
        data = [name + ".min.js"],
        outs = [name + ".min.js.br"],
        args = [
            "--output=$(execpath %s.min.js.br)" % name,
            "$(execpath %s.min.js)" % name,
        ],
        visibility = visibility,
    )
