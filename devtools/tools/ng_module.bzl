load("//tools:defaults.bzl", _ng_module = "ng_module")

def ng_module(name, tsconfig = "//devtools:tsconfig.json", srcs = [], angular_assets = [], **kwargs):
    _ng_module(
        name = name,
        tsconfig = tsconfig,
        srcs = srcs,
        assets = angular_assets,
        **kwargs
    )
