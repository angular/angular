load("//tools:defaults.bzl", "protractor_web_test_suite")

def e2e_test_suite(name, data = [], tags = ["e2e", "partial-compilation-integration"], deps = []):
    protractor_web_test_suite(
        name = name,
        configuration = "//src/e2e-app:protractor.conf.js",
        data = [
            "//tools/axe-protractor",
            "@npm//@axe-core/webdriverjs",
        ] + data,
        on_prepare = "//src/e2e-app:start-devserver.js",
        # Based on whether the partial compilation mode is enabled, test either with the default e2e-app
        # server, or test with a server that processed all sources with the Angular linker.
        server = select({
            "//conditions:default": "//src/e2e-app:devserver",
            "//tools:partial_compilation_enabled": "//src/e2e-app:devserver_with_linked_declarations",
        }),
        tags = tags,
        deps = deps,
    )
