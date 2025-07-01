# Re-export of Bazel rules with devtools-wide defaults

load("//tools:defaults2.bzl", _ng_web_test_suite = "ng_web_test_suite")

def ng_web_test_suite(name, tsconfig = "//devtools:tsconfig_test", **kwargs):
    _ng_web_test_suite(
        name = name,
        tsconfig = tsconfig,
        **kwargs
    )
