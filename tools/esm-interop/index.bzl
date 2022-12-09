"""ESM interop helpers."""

load("@npm//@angular/build-tooling/bazel:extract_js_module_output.bzl", "extract_js_module_output")
load("//tools/esm-interop:esm-node-module-loader.bzl", _enable_esm_node_module_loader = "enable_esm_node_module_loader")

enable_esm_node_module_loader = _enable_esm_node_module_loader

def extract_esm_outputs(name, deps, testonly = False):
    """"Extracts the ESM output variants from the given dependency."""

    extract_js_module_output(
        name = name,
        deps = deps,
        testonly = testonly,
        tags = ["manual"],
        provider = "JSEcmaScriptModuleInfo",
        forward_linker_mappings = True,
        include_external_npm_packages = True,
        include_default_files = True,
        include_declarations = False,
    )
