load("@build_bazel_rules_nodejs//:index.bzl", "npm_package_bin")
load("@aspect_bazel_lib//lib:copy_to_directory.bzl", "copy_to_directory")
load("//tools:defaults.bzl", "nodejs_test")
load("//:yarn.bzl", "YARN_LABEL")
load("//:packages.bzl", "AIO_EXAMPLE_PACKAGES", "to_package_label")

def docs_example(name, test = True, test_tags = [], test_exec_properties = {}, flaky = False):
    """Stamp targets for adding boilerplate to examples, creating live examples, and creating zips.

    Args:
        name: name of the example
        test: whether to run e2e tests
        test_tags: tags to add to the test target
        test_exec_properties: exec properties to add to the test's execution platform
    """

    native.filegroup(
        name = "files",
        srcs = native.glob(["**"], exclude = [
            "**/node_modules/**",  # Node modules may exist from the legacy setup.
        ]),
    )

    # Generate example boilerplate
    npm_package_bin(
        name = "boilerplate",
        args = ["add", native.package_name(), "$(@D)"],
        data = [":files"],
        output_dir = True,
        tool = "//aio/tools/examples:example-boilerplate",
    )

    # Copy example files and boilerplate to the output tree
    copy_to_directory(
        name = name,
        # Prevent sorting so that boilerplate overwrites example sources
        # buildifier: do not sort
        srcs = [
            ":files",
            ":boilerplate",
        ],
        replace_prefixes = {
            "boilerplate": "",
            "aio/tools/examples/shared": "",
        },
        allow_overwrites = True,
    )

    if test:
        EXAMPLE_DEPS_WORKSPACE_NAME = "aio_example_deps"

        LOCAL_PACKAGE_DEPS = [to_package_label(dep) for dep in AIO_EXAMPLE_PACKAGES]

        # Local package deps are passed as args to the test script in the form "@package/name#path/to/package"
        # for the script's convenience.
        LOCAL_PACKAGE_ARGS = ["--localPackage=%s#$(rootpath %s)" % (dep, to_package_label(dep)) for dep in AIO_EXAMPLE_PACKAGES]

        nodejs_test(
            name = "e2e",
            data = [
                ":%s" % name,
                YARN_LABEL,
                "@aio_npm//@angular/build-tooling/bazel/browsers/chromium",
                "//aio/tools/examples:run-example-e2e",
                "//aio/tools:windows-chromium-path",
                # We install the whole node modules for runtime deps of e2e tests
                "@{workspace}//:node_modules_files".format(workspace = EXAMPLE_DEPS_WORKSPACE_NAME),
            ] + select({
                "//aio:aio_local_deps": LOCAL_PACKAGE_DEPS,
                "//conditions:default": [],
            }),
            args = [
                "$(rootpath :%s)" % name,
                "$(rootpath %s)" % YARN_LABEL,
                EXAMPLE_DEPS_WORKSPACE_NAME,
            ] + select({
                "//aio:aio_local_deps": LOCAL_PACKAGE_ARGS,
                "//conditions:default": [],
            }),
            entry_point = "//aio/tools/examples:run-example-e2e.mjs",
            env = {
                "CHROME_BIN": "$(CHROMIUM)",
                "CHROMEDRIVER_BIN": "$(CHROMEDRIVER)",
            },
            toolchains = [
                "@aio_npm//@angular/build-tooling/bazel/browsers/chromium:toolchain_alias",
            ],
            exec_properties = test_exec_properties,
            flaky = flaky,
            # RBE complains about superseeding the max inputs limit (70,000) due to the
            # size of the input tree.
            tags = ["no-remote-exec"] + test_tags,
        )
