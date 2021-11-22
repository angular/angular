"""Helper macros for compiling typescript with consistent config"""

load("@npm//@bazel/typescript:index.bzl", _ts_project = "ts_project")

def ts_project(name, tsconfig = "//:tsconfig.json", **kwargs):
    _ts_project(
        name = name,
        tsconfig = tsconfig,
        declaration = True,
        declaration_map = True,
        source_map = True,
        **kwargs
    )

def ts_test_project(name, tsconfig = "//:tsconfig-spec", deps = [], **kwargs):
    _ts_project(
        name = name,
        testonly = 1,
        tsconfig = tsconfig,
        deps = deps + ["@npm//@types/node", "@npm//@types/jasmine"],
        declaration = True,
        declaration_map = True,
        **kwargs
    )
