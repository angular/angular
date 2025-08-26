"""Provides the rollup and dist file generation macro."""

load("//tools:defaults.bzl", "zone_bundle")

def copy_dist(module_name, module_format, output_module_name, suffix, umd):
    umd_output = umd
    suffix_output = suffix
    if umd == "umd":
        umd_output = "umd."
    if suffix == "min":
        suffix_output = "min."
    native.genrule(
        name = module_name + "." + suffix_output + "dist",
        srcs = [
            "//packages/zone.js:" + module_name + "-rollup." + suffix_output + module_format,
        ],
        outs = [
            output_module_name + "." + umd_output + suffix_output + "js",
        ],
        visibility = ["//visibility:public"],
        cmd = "cp $< $@",
    )

def generate_rollup_bundle(bundles):
    for b in bundles.items():
        module_name = b[0]
        rollup_config = b[1]
        if rollup_config.get("entrypoint") != None:
            entry_point = rollup_config.get("entrypoint")
            zone_bundle(
                name = module_name + "-es5-rollup",
                entry_point = entry_point + ".js",
                external = rollup_config.get("external"),
                deps = [
                    "//packages/zone.js/lib:lib",
                ],
            )
            zone_bundle(
                name = module_name + "-es2015-rollup",
                entry_point = entry_point + ".js",
                external = rollup_config.get("external"),
                deps = [
                    "//packages/zone.js/lib:lib",
                ],
            )
        else:
            zone_bundle(
                name = module_name + "-es5-rollup",
                entry_point = rollup_config.get("es5") + ".js",
                external = rollup_config.get("external"),
                deps = [
                    "//packages/zone.js/lib:lib",
                ],
            )
            zone_bundle(
                name = module_name + "-es2015-rollup",
                entry_point = rollup_config.get("es2015") + ".js",
                external = rollup_config.get("external"),
                deps = [
                    "//packages/zone.js/lib:lib",
                ],
            )

def generate_dist(bundles, output_format, umd):
    module_format = "esm.js"
    if output_format == "es5":
        module_format = "es5umd.js"
    for b in bundles:
        module_name = b[0]
        copy_dist(
            module_name = module_name + "-" + output_format,
            module_format = module_format,
            output_module_name = module_name,
            suffix = "",
            umd = umd,
        )
        copy_dist(
            module_name = module_name + "-" + output_format,
            module_format = module_format,
            output_module_name = module_name,
            suffix = "min.",
            umd = umd,
        )
