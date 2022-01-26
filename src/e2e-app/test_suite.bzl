load("//tools:defaults.bzl", "protractor_web_test_suite")

def e2e_test_suite(name, data = [], tags = ["e2e"], deps = []):
    protractor_web_test_suite(
        name = name,
        configuration = "//src/e2e-app:protractor.conf.js",
        data = [
            "//tools/axe-protractor",
            "@npm//@axe-core/webdriverjs",
        ] + data,
        on_prepare = "//src/e2e-app:start-devserver.js",
        server = "//src/e2e-app:server",
        tags = tags,
        deps = deps,
    )
