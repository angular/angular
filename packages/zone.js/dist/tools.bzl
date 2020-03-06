"""Provides the rollup and dist file generation macro."""

load("//tools:defaults.bzl", "rollup_bundle")

def zone_rollup_bundle(config_file, bundles):
    for b in bundles:
        rollup_bundle(
            name = b[0] + "-rollup",
            config_file = config_file,
            entry_point = b[1] + ".ts",
            silent = True,
            sourcemap = "false",
            deps = [
                "//packages/zone.js/lib",
                "@npm//rollup-plugin-commonjs",
                "@npm//rollup-plugin-node-resolve",
            ],
        )

def generate_dist(module, bundles):
    for b in bundles:
        native.genrule(
            name = b[0] + "-dist",
            srcs = [
                b[0] + "-rollup." + module + "umd.js",
                b[0] + "-rollup.min." + module + "umd.js",
            ],
            outs = [
                b[0] + ".js",
                b[0] + ".min.js",
            ],
            cmd = " && ".join([
                "cp $(@D)/" + b[0] + "-rollup." + module + "umd.js $(@D)/" + b[0] + ".js",
                "cp $(@D)/" + b[0] + "-rollup.min." + module + "umd.js $(@D)/" + b[0] + ".min.js",
            ]),
        )
