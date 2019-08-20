#!/usr/bin/env bash
set -u -e -o pipefail

# This script runs unit tests from angular/material2.

# Save the dir for the root of the Angular repo.
angular_dir=$(pwd)

# Disable full template type check, as Material doesn't build cleanly with it enabled.
# See https://github.com/angular/components/pull/16373 for details.
# The "ivyTemplateTypeCheck" flag is set to True so that a minimum amount of type checking still
# occurs, at a level compatible with that of VE's type checking. This ensures Ivy's type checker
# is still tested against the Material repo, albeit in its non-strict mode.
sed -i'.bak' "s/\(_ENABLE_NG_TYPE_CHECKING = \)True/\1False/g" ${MATERIAL_REPO_TMP_DIR}/tools/defaults.bzl
sed -i'.bak' "s/\(\"ivyTemplateTypeCheck\": \)False/\1True/g" dist/packages-dist-ivy-aot/bazel/src/ng_module.bzl

# Switch into Material directory.
cd ${MATERIAL_REPO_TMP_DIR}

# Updates Material's package.json to refer to the packages-dist-ivy-aot directory.
# Note that it's not necessary to perform a yarn install, as Bazel performs its own yarn install.
node ${angular_dir}/scripts/ci/update-deps-to-dist-packages.js ${MATERIAL_REPO_TMP_DIR}/package.json ${angular_dir}/dist/packages-dist-ivy-aot/

# Append the test blocklist into angular/material2's karma-test-shim.js.
# This filters out known-failing tests because the goal is to prevent regressions.
cat ${angular_dir}/tools/material-ci/angular_material_test_blocklist.js >> ./test/karma-test-shim.js

# Create a symlink for the Bazel binary installed through NPM, as running through Yarn introduces OOM errors.
./scripts/circleci/setup_bazel_binary.sh

# Now actually run the tests. The dev-app target is excluded as it fails to compile due to
# limitations in Ivy's type checker (see FW-1352 and FW-1433)
bazel test src/... --deleted_packages=//src/dev-app --build_tag_filters=-docs-package,-e2e,-browser:firefox-local --test_tag_filters=-e2e,-browser:firefox-local --define=compile=aot
