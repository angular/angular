load("@npm//@bazel/esbuild:index.bzl", "esbuild_config", _esbuild = "esbuild")
load("@npm//@angular/dev-infra-private/bazel:expand_template.bzl", "expand_template")

def esbuild(**kwargs):
    _esbuild(**kwargs)

"""Generates an AMD bundle for the specified entry-point with the given AMD module name."""

def esbuild_amd(name, entry_point, module_name, testonly, deps):
    expand_template(
        name = "%s_config" % name,
        testonly = testonly,
        template = "//tools/esbuild:esbuild-amd-config.mjs",
        output_name = "%s_config.mjs" % name,
        substitutions = {
            "TMPL_MODULE_NAME": module_name,
        },
    )

    esbuild_config(
        name = "%s_config_lib" % name,
        testonly = testonly,
        config_file = "%s_config" % name,
    )

    _esbuild(
        name = "%s_bundle" % name,
        testonly = testonly,
        deps = deps,
        minify = True,
        sourcemap = "inline",
        platform = "browser",
        target = "es2015",
        entry_point = entry_point,
        config = "%s_config_lib" % name,
    )

    native.filegroup(
        name = name,
        testonly = testonly,
        srcs = ["%s_bundle" % name],
    )
