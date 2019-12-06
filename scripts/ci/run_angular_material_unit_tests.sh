#!/usr/bin/env bash
set -u -e -o pipefail

# This script runs unit tests from angular/material2.

# Save the dir for the root of the Angular repo.
angular_dir=$(pwd)

# Switch into Material directory.
cd ${MATERIAL_REPO_TMP_DIR}

# Updates Material's package.json to refer to the packages-dist directory.
# Note that it's not necessary to perform a yarn install, as Bazel performs its own yarn install.
node ${angular_dir}/scripts/ci/update-deps-to-dist-packages.js ${MATERIAL_REPO_TMP_DIR}/package.json ${angular_dir}/dist/packages-dist/

# Copy the test blocklist into the "angular/components" repository. The components
# repository automatically picks up the blocklist and disables the specified tests.
cp ${angular_dir}/tools/material-ci/test-blocklist.ts ${MATERIAL_REPO_TMP_DIR}/test/

# Create a symlink for the Bazel binary installed through NPM, as running through Yarn introduces OOM errors.
./scripts/circleci/setup_bazel_binary.sh

# Now actually run the tests. The dev-app and all its subpackages are excluded as they fail
# to compile due to limitations in Ivy's type checker (see FW-1352 and FW-1433)
bazel test --build_tag_filters=-docs-package,-e2e,-browser:firefox-local --test_tag_filters=-e2e,-browser:firefox-local --config=ivy -- src/... -src/dev-app/...
