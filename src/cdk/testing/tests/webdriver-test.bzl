load("//tools:defaults.bzl", "jasmine_node_test")
load("@io_bazel_rules_webtesting//web:web.bzl", "web_test")
load("//tools/server-test:index.bzl", "server_test")

def webdriver_test(name, data = [], tags = [], **kwargs):
    jasmine_node_test(
        name = "%s_jasmine_test" % name,
        data = data + [
            "@npm//@bazel/typescript",
        ],
        tags = tags + ["manual"],
        **kwargs
    )

    web_test(
        name = "%s_chromium_web_test" % name,
        browser = "@npm//@angular/dev-infra-private/browsers/chromium:chromium",
        tags = tags + ["manual"],
        test = ":%s_jasmine_test" % name,
    )

    server_test(
        name = "%s_chromium" % name,
        server = "//src/e2e-app:devserver",
        test = ":%s_chromium_web_test" % name,
        tags = tags + ["e2e"],
    )

    native.test_suite(
        name = name,
        tests = [
            ":%s_chromium" % name,
        ],
    )
