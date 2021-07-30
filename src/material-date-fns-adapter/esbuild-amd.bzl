load("@npm//@bazel/esbuild:index.bzl", "esbuild")

"""Creates an ESBuild configuration file for configuring AMD output."""

def _create_esbuild_config(module_name):
    # Workaround in ESBuild to support AMD module output.
    # TODO: Remove once https://github.com/evanw/esbuild/issues/507 is fixed.
    return {
        "globalName": "__exports",
        "banner": {"js": "define(\"%s\",[],function(){" % module_name},
        "footer": {"js": "return __exports;})"},
    }

"""Generates an AMD bundle for the specified entry-point with the given AMD module name."""

def esbuild_amd(name, entry_point, module_name, testonly, deps):
    native.genrule(
        name = "%s_config" % name,
        outs = ["%s_config.json" % name],
        cmd = """echo '%s' > $@""" % json.encode(_create_esbuild_config(module_name)),
        testonly = testonly,
    )

    esbuild(
        name = "%s_bundle" % name,
        testonly = testonly,
        deps = deps,
        minify = True,
        sourcemap = "inline",
        platform = "browser",
        target = "es2015",
        entry_point = entry_point,
        args_file = "%s_config.json" % name,
    )

    native.filegroup(
        name = name,
        testonly = testonly,
        srcs = ["%s_bundle" % name],
    )
