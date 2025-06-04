"""Helper macros for compiling typescript with consistent config"""

load("//tools:defaults2.bzl", _ts_project = "ts_project")

def ts_project(name, **kwargs):
    _ts_project(
        name = name,
        tsconfig = "//devtools:tsconfig_build",
        **kwargs
    )

def ts_test_library(name, deps = [], **kwargs):
    _ts_project(
        name = name,
        tsconfig = "//devtools:tsconfig_test",
        testonly = 1,
        deps = deps + [
            "//:node_modules/@types/jasmine",
        ],
        **kwargs
    )
