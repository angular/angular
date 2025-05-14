load("//tools:defaults2.bzl", _ng_project = "ng_project", _ts_project = "ts_project")

def ts_project(name, tsconfig = None, testonly = False, **kwargs):
    if tsconfig == None:
        if native.package_name().startswith("adev/shared-docs"):
            tsconfig = "//adev/shared-docs:tsconfig_test" if testonly else "//adev/shared-docs:tsconfig_build"

    _ts_project(
        name = name,
        tsconfig = tsconfig,
        testonly = testonly,
        **kwargs
    )

def ng_project(name, tsconfig = None, testonly = False, **kwargs):
    if tsconfig == None:
        if native.package_name().startswith("adev/shared-docs"):
            tsconfig = "//adev/shared-docs:tsconfig_test" if testonly else "//adev/shared-docs:tsconfig_build"

    _ng_project(
        name = name,
        tsconfig = tsconfig,
        testonly = testonly,
        **kwargs
    )
