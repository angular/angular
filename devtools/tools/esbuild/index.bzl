load("@npm//@bazel/esbuild:index.bzl", _esbuild = "esbuild", _esbuild_config = "esbuild_config")
load("@npm//@angular/dev-infra-private/bazel:expand_template.bzl", "expand_template")
load("//tools/esbuild:devmode-output.bzl", "extract_devmode_output_with_mappings")

# Re-export of the actual esbuild definitions.
esbuild_config = _esbuild_config

def esbuild(name, deps = [], mapping_targets = [], testonly = False, **kwargs):
    # Extract all JS module sources before passing to ESBuild. The ESBuild rule requests
    # both the devmode and prodmode unfortunately and this would slow-down the development
    # turnaround significantly. We only request the devmode sources which are ESM as well.
    devmode_targets = extract_devmode_output_with_mappings(name, deps, testonly)

    _esbuild(
        name = name,
        deps = devmode_targets,
        testonly = testonly,
        **kwargs
    )

"""Generates an AMD bundle for the specified entry-point with the given AMD module name."""

def esbuild_amd(name, entry_point, module_name, testonly = False, config = None, deps = [], **kwargs):
    expand_template(
        name = "%s_config" % name,
        testonly = testonly,
        template = "//tools/esbuild:esbuild-amd-config.mjs",
        output_name = "%s_config.mjs" % name,
        substitutions = {
            "TMPL_MODULE_NAME": module_name,
            "TMPL_CONFIG_PATH": "$(execpath %s)" % config if config else "",
        },
        data = [config] if config else None,
    )

    _esbuild_config(
        name = "%s_config_lib" % name,
        testonly = testonly,
        config_file = "%s_config" % name,
        # Adds the user configuration and its deps as dependency of the AMD ESBuild config.
        # https://github.com/bazelbuild/rules_nodejs/blob/a892caf5a040bae5eeec174a3cf6250f02caf364/packages/esbuild/esbuild_config.bzl#L23.
        deps = [config, "%s_deps" % config] if config else None,
    )

    esbuild(
        name = name,
        testonly = testonly,
        deps = deps,
        entry_point = entry_point,
        config = "%s_config_lib" % name,
        **kwargs
    )
