load("@npm//@angular/dev-infra-private/bazel:expand_template.bzl", "expand_template")
load("//tools/esbuild:index.bzl", "esbuild", "esbuild_amd", "esbuild_config")
load("@build_bazel_rules_nodejs//:index.bzl", "js_library")
load("@build_bazel_rules_nodejs//:providers.bzl", "JSModuleInfo")
load("//tools/angular:index.bzl", "LINKER_PROCESSED_FW_PACKAGES")

"""
  Starlark file exposing a macro for bundling Bazel targets with spec files into
  a single spec ESM/AMD file. Bundling is helpful as it avoids unnecessary complexity
  with module resolution at runtime with loaders such as SystemJS or RequireJS.

  Additionally, given that Angular framework packages do no longer ship UMD bundles,
  bundling simplifies the integration of those FW packages significantly. It also helps
  with incorporating the Angular linker-processed output of FW ESM bundles.
"""

def _is_spec_file(file):
    """Gets whether the given file is a spec file."""
    basename = file.basename

    # External files (from other workspaces) should never run as specs.
    if (file.short_path.startswith("../")):
        return False

    # `spec.js` or `spec.mjs` files will be imported in the entry-point.
    return basename.endswith("spec.js") or basename.endswith("spec.mjs")

def _filter_spec_files(files):
    """Filters the given list of files to only contain spec files."""
    result = []
    for file in files:
        if _is_spec_file(file):
            result.append(file)
    return result

def _create_entrypoint_file(base_package, spec_files):
    """Creates the contents of the spec entry-point ESM file which imports
    all individual spec files so that these are bundled and loaded by Node/Karma."""
    output = ""
    for file in spec_files:
        base_dir_segments = "/".join([".."] * len(base_package.split("/")))
        output += """import "%s/%s";\n""" % (base_dir_segments, file.short_path)
    return output

def _spec_entrypoint_impl(ctx):
    output = ctx.actions.declare_file("%s.mjs" % ctx.attr.name)
    spec_depsets = []

    for dep in ctx.attr.deps:
        if JSModuleInfo in dep:
            spec_depsets.append(dep[JSModuleInfo].sources)
        else:
            spec_depsets.append(dep[DefaultInfo].files)

    spec_files = []

    for spec_depset in spec_depsets:
        # Note: `to_list()` is an expensive operation but we need to do this for every
        # dependency here in order to be able to filter out spec files from depsets.
        spec_files.extend(_filter_spec_files(spec_depset.to_list()))

    ctx.actions.write(
        output = output,
        content = _create_entrypoint_file(ctx.label.package, spec_files),
    )

    out_depset = depset([output])

    return [
        DefaultInfo(files = out_depset),
        JSModuleInfo(
            direct_sources = out_depset,
            sources = depset(transitive = [out_depset] + spec_depsets),
        ),
    ]

_spec_entrypoint = rule(
    implementation = _spec_entrypoint_impl,
    attrs = {
        "deps": attr.label_list(allow_files = False, mandatory = True),
    },
)

def spec_bundle(name, platform, deps, **kwargs):
    """
      Macro that will bundle all test files, with their respective transitive dependencies,
      into a single bundle file that can be loaded within Karma or NodeJS directly. Test files
      are bundled as Angular framework packages do not ship UMD files and to avoid overall
      complexity with maintaining a runtime loader such as RequireJS or SystemJS.
    """

    is_browser_test = platform == "browser"
    package_name = native.package_name()
    workspace = "angular_devtools"

    _spec_entrypoint(
        name = "%s_spec_entrypoint" % name,
        deps = deps,
        testonly = True,
    )

    expand_template(
        name = "%s_config_file" % name,
        testonly = True,
        template = "//tools/spec-bundling:esbuild.config-tmpl.mjs",
        output_name = "%s_config.mjs" % name,
        substitutions = select({
            # Depending on whether partial compilation is enabled, we may want to run the linker
            # to test the Angular compiler linker AOT processing. Additionally, a config setting
            # can forcibly disable the linker to ensure tests rely on JIT linking at runtime.
            "//tools:force_partial_jit_compilation_enabled": {"TMPL_RUN_LINKER": "false"},
            "//tools:partial_compilation_enabled": {"TMPL_RUN_LINKER": "true"},
            "//conditions:default": {"TMPL_RUN_LINKER": "true"},
        }),
    )

    esbuild_config(
        name = "%s_config" % name,
        config_file = ":%s_config_file" % name,
        testonly = True,
        deps = ["//tools/angular:create_linker_esbuild_plugin"],
    )

    # Browser tests (Karma) need named AMD modules to load.
    # TODO(devversion): consider updating `@bazel/concatjs` to support loading JS files directly.
    esbuild_rule = esbuild_amd if is_browser_test else esbuild
    amd_name = "%s/%s/%s" % (workspace, package_name, name + "_spec") if is_browser_test else None

    esbuild_rule(
        name = "%s_bundle" % name,
        testonly = True,
        config = ":%s_config" % name,
        entry_point = ":%s_spec_entrypoint" % name,
        module_name = amd_name,
        output = "%s_spec.js" % name,
        # We cannot use `ES2017` or higher as that would result in `async/await` not being downleveled.
        # ZoneJS needs to be able to intercept these as otherwise change detection would not work properly.
        target = "es2016",
        platform = platform,
        # Note: We add all linker-processed FW packages as dependencies here so that ESBuild will
        # map all framework packages to their linker-processed bundles from `tools/angular`.
        deps = deps + LINKER_PROCESSED_FW_PACKAGES + [":%s_spec_entrypoint" % name],
        link_workspace_root = True,
        **kwargs
    )

    js_library(
        name = name,
        testonly = True,
        named_module_srcs = [":%s_bundle" % name],
    )
