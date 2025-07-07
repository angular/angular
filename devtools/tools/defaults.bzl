# Re-export of Bazel rules with devtools-wide defaults

load("//tools:defaults2.bzl", _ng_web_test_suite = "ng_web_test_suite")

def ng_web_test_suite(deps = [], **kwargs):
    # Provide required modules for the imports in //tools/testing/browser_tests.init.mts
    deps = deps + [
        "//:node_modules/@angular/compiler",
        "//:node_modules/@angular/core",
        "//:node_modules/@angular/platform-browser",
    ]
    _ng_web_test_suite(
        # TODO: Reenable firefox tests once spaces in file paths are not a problem
        firefox = False,
        deps = deps,
        tsconfig = "//devtools:tsconfig_test",
        **kwargs
    )
