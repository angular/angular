load("@rules_angular//src/ng_project:index.bzl", _ng_project = "ng_project")
load("//tools/bazel:module_name.bzl", "compute_module_name")
load("//tools/bazel:ts_project_interop.bzl", _ts_project = "ts_project")

def ts_project(
        name,
        source_map = True,
        testonly = False,
        tsconfig = None,
        **kwargs):
    module_name = kwargs.pop("module_name", compute_module_name(testonly))

    if tsconfig == None:
        if native.package_name().startswith("packages/compiler-cli/src/ngtsc"):
            tsconfig = "//packages/compiler-cli:tsconfig_test" if testonly else "//packages/compiler-cli:tsconfig_build"
        elif native.package_name().startswith("packages"):
            tsconfig = "//packages:tsconfig_test" if testonly else "//packages:tsconfig_build"

    _ts_project(
        name,
        source_map = source_map,
        module_name = module_name,
        testonly = testonly,
        tsconfig = tsconfig,
        **kwargs
    )

def ng_project(
        name,
        source_map = True,
        testonly = False,
        tsconfig = None,
        **kwargs):
    module_name = kwargs.pop("module_name", compute_module_name(testonly))

    if tsconfig == None and native.package_name().startswith("packages"):
        tsconfig = "//packages:tsconfig_test" if testonly else "//packages:tsconfig_build"
    _ts_project(
        name,
        source_map = source_map,
        module_name = module_name,
        rule_impl = _ng_project,
        testonly = testonly,
        tsconfig = tsconfig,
        **kwargs
    )
