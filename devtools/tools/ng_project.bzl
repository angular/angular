load("//tools:defaults2.bzl", _ng_project = "ng_project")

def ng_project(name, srcs = [], angular_assets = [], **kwargs):
    deps = kwargs.pop("deps", []) + [
        "//:node_modules/tslib",
    ]

    _ng_project(
        name = name,
        tsconfig = "//devtools:tsconfig_build",
        srcs = srcs,
        assets = angular_assets,
        deps = deps,
        **kwargs
    )
