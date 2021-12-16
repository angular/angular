"""Helper macros for compiling typescript with consistent config"""

load("//tools:defaults.bzl", _ts_library = "ts_library")

def ts_library(name, tsconfig = "//devtools:tsconfig.json", **kwargs):
    _ts_library(
        name = name,
        tsconfig = tsconfig,
        **kwargs
    )

def ts_test_library(name, tsconfig = "//devtools:tsconfig.json", deps = [], **kwargs):
    _ts_library(
        name = name,
        tsconfig = tsconfig,
        testonly = 1,
        deps = deps,
        **kwargs
    )
