# Copyright Google LLC All Rights Reserved.
#
# Use of this source code is governed by an MIT-style license that can be
# found in the LICENSE file at https://angular.dev/license
"""Angular integration testing
"""

load("@devinfra//bazel/integration:index.bzl", "integration_test")
load("//:packages.bzl", "INTEGRATION_PACKAGES")

def _ng_integration_test(name, setup_chromium = False, **kwargs):
    "Set defaults for the npm_integration_test common to the angular repo"
    toolchains = kwargs.pop("toolchains", [])
    environment = kwargs.pop("environment", {})
    data = kwargs.pop("data", [])

    if setup_chromium:
        data.append("@rules_browsers//browsers/chromium")
        toolchains.append("@rules_browsers//browsers/chromium:toolchain_alias")
        environment.update({
            "CHROMEDRIVER_BIN": "$(CHROMEDRIVER)",
            "CHROME_BIN": "$(CHROME-HEADLESS-SHELL)",
        })

    # By default run `pnpm install` followed by `pnpm test` using the tools linked
    # into the integration tests (using the `tool_mappings` attribute).
    commands = kwargs.pop("commands", [
        "pnpm install",
        "pnpm run test",
    ])

    # Complete list of npm packages to override in the test's package.json file mapped to
    # tgz archive to use for the replacement. This is the full list for all integration
    # tests. Any given integration does not need to use all of these packages.
    npm_packages = {}
    for pkg in INTEGRATION_PACKAGES:
        npm_packages["//:node_modules/%s/dir" % pkg] = pkg

    integration_test(
        name = name,
        commands = commands,
        npm_packages = npm_packages,
        tags = kwargs.pop("tags", []) + [
            # `integration` tag is used for filtering out these tests from the normal
            # developer workflow
            "integration",
            # Integration tests do not work inside of a sandbox as they may run host applications such
            # as chrome (which is run by ng) that require access to files outside of the sandbox.
            "no-sandbox",
        ],
        data = data,
        environment = environment,
        toolchains = toolchains,
        tool_mappings = {
            "@pnpm//:pnpm": "pnpm",
            "@nodejs_toolchains//:resolved_toolchain": "node",
        },
        # 15-minute timeout
        timeout = "long",
        # Tells bazel that this test should be allocated a large amount of memory.
        # See https://docs.bazel.build/versions/2.0.0/be/common-definitions.html#common-attributes-tests.
        size = "enormous",
        **kwargs
    )

def ng_integration_test(name, **kwargs):
    "Sets up the integration test target based on the test folder name"

    native.filegroup(
        name = "_%s_sources" % name,
        srcs = native.glob(
            include = ["**/*"],
            exclude = [
                "node_modules/**",
            ],
        ),
    )
    _ng_integration_test(
        name = name,
        srcs = kwargs.pop("srcs", ["_%s_sources" % name]),
        **kwargs
    )
