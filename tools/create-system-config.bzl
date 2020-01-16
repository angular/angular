load("//:packages.bzl", "ANGULAR_PACKAGE_BUNDLES")
load("//src/cdk:config.bzl", "CDK_ENTRYPOINTS")
load("//src/cdk-experimental:config.bzl", "CDK_EXPERIMENTAL_ENTRYPOINTS")
load("//src/material:config.bzl", "MATERIAL_ENTRYPOINTS", "MATERIAL_TESTING_ENTRYPOINTS")
load("//src/material-experimental:config.bzl", "MATERIAL_EXPERIMENTAL_ENTRYPOINTS")
load("//tools/bazel:expand_template.bzl", "expand_template")

"""
  Macro that builds a SystemJS configuration for all packages and entry-points
  configured in "config.bzl" files of the workspace. The SystemJS configuration
  can be used in the dev-app and for building the legacy unit tests SystemJS config.
"""

def create_system_config(
        name,
        output_name,
        # In Bazel the package output follows the same folder structure as the source
        # code. This attribute makes the packages directory configurable since in the
        # legacy output, the package output is located in "dist/packages".
        packages_dir = "src",
        # In Bazel, the node modules can be resolved without having to specify the
        # path to the "node_modules" folder. In the legacy tests, this is not the case.
        node_modules_base_path = "",
        # In Bazel, files can be resolved without having to use Karma's default "base/"
        # directory. For the legacy tests this needs to be configurable for now.
        base_url = ""):
    expand_template(
        name = name,
        output_name = output_name,
        configuration_env_vars = ["angular_ivy_enabled"],
        substitutions = {
            "$ANGULAR_PACKAGE_BUNDLES": str(ANGULAR_PACKAGE_BUNDLES),
            "$BASE_URL": base_url,
            "$CDK_ENTRYPOINTS_TMPL": str(CDK_ENTRYPOINTS),
            "$CDK_EXPERIMENTAL_ENTRYPOINTS_TMPL": str(CDK_EXPERIMENTAL_ENTRYPOINTS),
            "$MATERIAL_ENTRYPOINTS_TMPL": str(MATERIAL_ENTRYPOINTS + MATERIAL_TESTING_ENTRYPOINTS),
            "$MATERIAL_EXPERIMENTAL_ENTRYPOINTS_TMPL": str(MATERIAL_EXPERIMENTAL_ENTRYPOINTS),
            "$NODE_MODULES_BASE_PATH": node_modules_base_path,
            "$PACKAGES_DIR": packages_dir,
        },
        template = "//tools:system-config-tmpl.js",
    )
