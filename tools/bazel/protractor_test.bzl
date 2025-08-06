load("@devinfra//bazel/spec-bundling:index.bzl", _spec_bundle = "spec_bundle")
load("@rules_browsers//src/protractor_test:index.bzl", _protractor_test = "protractor_test")

def protractor_web_test_suite(name, deps, **kwargs):
    _spec_bundle(
        name = "%s_bundle" % name,
        deps = deps,
        external = ["protractor", "selenium-webdriver"],
    )

    _protractor_test(
        name = name,
        deps = [":%s_bundle" % name],
        extra_config = {
            "useAllAngular2AppRoots": True,
            "allScriptsTimeout": 120000,
            "getPageTimeout": 120000,
            "jasmineNodeOpts": {
                "defaultTimeoutInterval": 120000,
            },
        },
        data = [
            "//:node_modules/protractor",
            "//:node_modules/selenium-webdriver",
        ],
        **kwargs
    )
