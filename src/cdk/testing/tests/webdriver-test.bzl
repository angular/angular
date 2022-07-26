load("//tools:defaults.bzl", "jasmine_node_test", "spec_bundle")
load("@io_bazel_rules_webtesting//web:web.bzl", "web_test")
load("//tools/server-test:index.bzl", "server_test")

def webdriver_test(name, deps, tags = [], **kwargs):
    spec_bundle(
        name = "%s_bundle" % name,
        deps = deps,
        platform = "node",
        external = ["selenium-webdriver"],
    )

    jasmine_node_test(
        name = "%s_jasmine_test" % name,
        tags = tags + ["manual"],
        deps = ["%s_bundle" % name, "@npm//selenium-webdriver"],
        **kwargs
    )

    web_test(
        name = "%s_chromium_web_test" % name,
        browser = "@npm//@angular/build-tooling/bazel/browsers/chromium:chromium",
        tags = tags + ["manual"],
        test = ":%s_jasmine_test" % name,
    )

    server_test(
        name = "%s_chromium" % name,
        server = "//src/e2e-app:server",
        test = ":%s_chromium_web_test" % name,
        tags = tags + ["e2e"],
    )

    native.test_suite(
        name = name,
        tests = [
            ":%s_chromium" % name,
        ],
    )
