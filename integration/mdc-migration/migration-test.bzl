load("//tools:integration.bzl", "CLI_PROJECT_MAPPINGS")
load("@bazel_skylib//lib:dicts.bzl", "dicts")
load("//tools:defaults.bzl", "node_integration_test")

# TODO(mmalerba): Consider extracting infrastructure for running golden tests against other future migrations.

npmPackageMappings = dicts.add(
    CLI_PROJECT_MAPPINGS,
    {
        "//src/cdk:npm_package_archive": "@angular/cdk",
        "//src/material:npm_package_archive": "@angular/material",
        "//src/material-experimental:npm_package_archive": "@angular/material-experimental",
    },
)

IGNORED_FILES = [
    ".angular",
    ".yarn_cache_folder",
    "node_modules",
    "package.json",
    "yarn.lock",
]

def migration_test(name, srcs, approve):
    node_integration_test(
        name = name,
        srcs = srcs,
        commands = [
            # Note: We use a cache folder within the integration test as otherwise
            # the NPM package mapped archive would be cached in the system.
            # See: https://github.com/yarnpkg/yarn/issues/2165.
            # TODO(devversion): determine if a solution/workaround could live in the test runner.
            "yarn install --cache-folder .yarn_cache_folder/",
            "yarn ng generate @angular/material:mdc-migration --components all",
            # TODO(amysorto): add back once MDC components are in @angular/material
            # "yarn test",
            " ".join([
                "$(rootpath :verify_golden)",
                "%s" % approve,
                "../golden",
                "integration/mdc-migration/golden",
            ] + IGNORED_FILES),
        ],
        data = [
            ":golden_project",
            ":test_project",
            ":verify_golden",
        ],
        npm_packages = npmPackageMappings,
        setup_chromium = True,
        tags = [
            # This test relies on `yarn` so there needs to be internet access.
            "requires-network",
            "manual",
        ] if approve else [
            # This test relies on `yarn` so there needs to be internet access.
            "requires-network",
        ],
        # Sample project becomes the working directory for the integration test, ensuring
        # that its project `package.json` is substitued with the NPM package mappings etc.
        working_dir = "sample-project/",
    )
