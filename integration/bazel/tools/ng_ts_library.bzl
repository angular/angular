"Shows how to enable both worker mode and use_angular_plugin to make a drop-in replacement for ng_module"

load("@npm//@bazel/typescript:index.bzl", "ts_library")

def ng_ts_library(**kwargs):
    angular_assets = kwargs.pop("assets", []) + kwargs.pop("angular_assets", [])
    ts_library(
        compiler = "//tools:tsc_wrapped_with_angular",
        supports_workers = True,
        use_angular_plugin = True,
        angular_assets = angular_assets,
        **kwargs
    )
