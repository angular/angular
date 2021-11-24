load("//tools:typescript.bzl", _ts_project = "ts_project")

def ng_ts_project(name, tsconfig = "//:tsconfig.json", srcs = [], angular_assets = [], **kwargs):
    _ts_project(
        name = name,
        tsconfig = tsconfig,
        tsc = "@npm//@angular/compiler-cli/bin:ngc",
        srcs = srcs + angular_assets,
        **kwargs
    )
