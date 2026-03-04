load("@aspect_bazel_lib//lib:copy_file.bzl", "copy_file")
load("@aspect_rules_esbuild//esbuild:defs.bzl", _esbuild = "esbuild")
load("@npm//:typescript/package_json.bzl", tsc = "bin")

def zone_bundle(
        name,
        testonly = False,
        deps = [],
        entry_point = None,
        external = []):
    """
    Runs esbuild and tsc for downleveling to es5 to produce a number of output bundles.

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
    """

    def esbuild(**kwargs):
        _esbuild(
            sourcemap = False,
            testonly = testonly,
            external = external,
            **kwargs
        )

    esbuild(
        name = name + ".esm",
        entry_point = entry_point,
        config = "//packages/zone.js/tools:esm",
        deps = deps,
    )
    esbuild(
        name = name + ".min.esm",
        entry_point = entry_point,
        config = "//packages/zone.js/tools:esm",
        deps = deps,
        minify = True,
    )

    # es2015
    esbuild(
        name = name + ".es2015",
        entry_point = entry_point,
        config = "//packages/zone.js/tools:iife",
        target = "es2015",
        deps = deps,
    )
    esbuild(
        name = name + ".min.es2015",
        entry_point = entry_point,
        config = "//packages/zone.js/tools:iife",
        target = "es2015",
        deps = deps,
        minify = True,
    )
    esbuild(
        name = name + ".min_debug.es2015",
        entry_point = entry_point,
        config = "//packages/zone.js/tools:iife",
        target = "es2015",
        deps = deps,
        minify = True,
    )

    # es5
    es5_out_dir = "es5"
    es5_out_file = "%s/%s.es2015.js" % (es5_out_dir, name)

    tsc.tsc(
        name = name,
        outs = [es5_out_file],
        srcs = [name + ".es2015.js"],
        chdir = native.package_name(),
        args = [
            "%s.es2015.js" % name,
            "--types",
            "--skipLibCheck",
            "--target",
            "es5",
            "--lib",
            "es2015,dom",
            "--allowJS",
            "--outDir",
            es5_out_dir,
        ],
    )

    copy_file(
        name = name + ".es5",
        src = es5_out_file,
        out = name + ".js",
    )

    esbuild(
        name = name + ".min",
        entry_point = name + ".js",
        config = "//packages/zone.js/tools:iife",
        target = "es5",
        srcs = [
            name + ".js",
        ],
        minify = True,
    )
    esbuild(
        name = name + ".min_debug",
        entry_point = name + ".js",
        config = "//packages/zone.js/tools:iife",
        target = "es5",
        srcs = [
            name + ".js",
        ],
        minify = True,
    )

    # umd

    esbuild(
        name = name + ".umd",
        entry_point = entry_point,
        config = "//packages/zone.js/tools:umd",
        deps = deps,
    )
    esbuild(
        name = name + ".min.umd",
        entry_point = entry_point,
        config = "//packages/zone.js/tools:umd",
        deps = deps,
        minify = True,
    )

    # es5 umd downleveling
    es5_umd_dir = "dist/es5umd"
    es5_umd_file = "%s/%s.umd.js" % (es5_umd_dir, name)

    # First we use TS to downlevel to es5. A couple of notes:
    # 1. We can't use esbuild for this, because they don't support es5 fully.
    # 2. The file is generated in a sub-directory using --outDir,
    # because --outFile will be removed in an upcoming TS version.
    # 3. Since --outDir creates a sub-directory, we have to copy the file back out.
    # That happens in the `copy_file` call below.
    tsc.tsc(
        name = name + ".es5umd_downlevel",
        outs = [es5_umd_file],
        chdir = native.package_name(),
        srcs = [name + ".umd.js"],
        args = [
            "%s.umd.js" % name,
            "--types",
            "--skipLibCheck",
            "--target",
            "es5",
            "--lib",
            "es2015,dom",
            "--allowJS",
            "--outDir",
            es5_umd_dir,
        ],
    )

    copy_file(
        name = name + ".es5umd",
        src = es5_umd_file,
        out = name + ".es5umd.js",
    )

    esbuild(
        name = name + ".min.es5umd",
        entry_point = es5_umd_file,
        config = "//packages/zone.js/tools:umd",
        target = "es5",
        srcs = [es5_umd_file],
        minify = True,
    )
