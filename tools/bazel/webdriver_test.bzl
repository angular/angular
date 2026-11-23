load("@devinfra//bazel/spec-bundling:index.bzl", "spec_bundle")
load("@rules_browsers//server_test:index.bzl", "server_test")
load("//tools/bazel:jasmine_test.bzl", "jasmine_test")

def webdriver_test(name, deps, server, tags = [], data = [], external = [], **kwargs):
    spec_bundle(
        name = "%s_bundle" % name,
        deps = deps,
        external = ["selenium-webdriver"] + external,
        platform = "node",
        config = {
            "banner": {
                "js": """import {createRequire as __cjsCompatRequire} from 'module';
                    const require = __cjsCompatRequire(import.meta.url);
                    const __filename = import.meta.filename;
                    const __dirname = import.meta.dirname;""",
            },
            "target": ["ES2022"],
            "format": "esm",
        },
    )

    jasmine_test(
        name = "%s_jasmine_test" % name,
        tags = tags + ["manual"],
        data = data + [
            ":%s_bundle" % name,
            "@rules_browsers//browsers/chromium",
            "//:node_modules/selenium-webdriver",
        ],
        env = {
            "CHROME_HEADLESS_BIN": "$(CHROME-HEADLESS-SHELL)",
            "CHROMEDRIVER": "$(CHROMEDRIVER)",
        },
        toolchains = ["@rules_browsers//browsers/chromium:toolchain_alias"],
        **kwargs
    )

    server_test(
        name = "%s_chromium" % name,
        server = server,
        test = ":%s_jasmine_test" % name,
        tags = tags + ["e2e"],
    )

    native.test_suite(
        name = name,
        tests = [
            ":%s_chromium" % name,
        ],
    )
