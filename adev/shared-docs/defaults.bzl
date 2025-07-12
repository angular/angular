load(
    "//tools:defaults2.bzl",
    _ng_project = "ng_project",
    _ts_project = "ts_project",
    _zoneless_web_test_suite = "zoneless_web_test_suite",
)

def ts_project(name, tsconfig = None, testonly = False, enable_runtime_rnjs_interop = False, **kwargs):
    if tsconfig == None:
        if native.package_name().startswith("adev/shared-docs"):
            tsconfig = "//adev/shared-docs:tsconfig_test" if testonly else "//adev/shared-docs:tsconfig_build"

    _ts_project(
        name = name,
        enable_runtime_rnjs_interop = enable_runtime_rnjs_interop,
        tsconfig = tsconfig,
        testonly = testonly,
        **kwargs
    )

def ng_project(name, tsconfig = None, testonly = False, enable_runtime_rnjs_interop = False, **kwargs):
    if tsconfig == None:
        if native.package_name().startswith("adev/shared-docs"):
            tsconfig = "//adev/shared-docs:tsconfig_test" if testonly else "//adev/shared-docs:tsconfig_build"

    _ng_project(
        name = name,
        enable_runtime_rnjs_interop = enable_runtime_rnjs_interop,
        tsconfig = tsconfig,
        testonly = testonly,
        **kwargs
    )

def zoneless_web_test_suite(deps = [], **kwargs):
    # Provide required modules for the imports in //tools/testing/browser_tests.init.mts
    deps = deps + [
        "//:node_modules/@angular/compiler",
        "//:node_modules/@angular/core",
        "//:node_modules/@angular/platform-browser",
    ]
    _zoneless_web_test_suite(
        deps = deps,
        tsconfig = "//adev/shared-docs:tsconfig_test",
        **kwargs
    )
