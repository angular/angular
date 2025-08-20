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
        config = "//tools/bazel/esbuild/zone-config:esm",
        deps = deps,
    )
    esbuild(
        name = name + ".min.esm",
        entry_point = entry_point,
        config = "//tools/bazel/esbuild/zone-config:esm",
        deps = deps,
        minify = True,
    )

    # es2015
    esbuild(
        name = name + ".es2015",
        entry_point = entry_point,
        config = "//tools/bazel/esbuild/zone-config:iife",
        target = "es2015",
        deps = deps,
    )
    esbuild(
        name = name + ".min.es2015",
        entry_point = entry_point,
        config = "//tools/bazel/esbuild/zone-config:iife",
        target = "es2015",
        deps = deps,
        minify = True,
    )
    esbuild(
        name = name + ".min_debug.es2015",
        entry_point = entry_point,
        config = "//tools/bazel/esbuild/zone-config:iife",
        target = "es2015",
        deps = deps,
        minify = True,
    )

    # es5
    tsc.tsc(
        name = name,
        outs = [
            name + ".js",
        ],
        args = [
            "$(rootpath :%s.es2015.js)" % name,
            "--types",
            "--skipLibCheck",
            "--target",
            "es5",
            "--lib",
            "es2015,dom",
            "--allowJS",
            "--outFile",
            "$(rootpath :%s.js)" % name,
        ],
        srcs = [
            name + ".es2015.js",
        ],
    )
    esbuild(
        name = name + ".min",
        entry_point = name + ".js",
        config = "//tools/bazel/esbuild/zone-config:iife",
        target = "es5",
        srcs = [
            name + ".js",
        ],
        minify = True,
    )
    esbuild(
        name = name + ".min_debug",
        entry_point = name + ".js",
        config = "//tools/bazel/esbuild/zone-config:iife",
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
        config = "//tools/bazel/esbuild/zone-config:umd",
        deps = deps,
    )
    esbuild(
        name = name + ".min.umd",
        entry_point = entry_point,
        config = "//tools/bazel/esbuild/zone-config:umd",
        deps = deps,
        minify = True,
    )

    tsc.tsc(
        name = name + ".es5umd",
        outs = [
            name + ".es5umd.js",
        ],
        args = [
            "$(rootpath :%s.umd.js)" % name,
            "--types",
            "--skipLibCheck",
            "--target",
            "es5",
            "--lib",
            "es2015,dom",
            "--allowJS",
            "--outFile",
            "$(rootpath :%s.es5umd.js)" % name,
        ],
        srcs = [
            name + ".umd.js",
        ],
    )

    esbuild(
        name = name + ".min.es5umd",
        entry_point = name + ".es5umd.js",
        config = "//tools/bazel/esbuild/zone-config:umd",
        target = "es5",
        srcs = [
            name + ".es5umd.js",
        ],
        minify = True,
    )
