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

# The components repository updated to rules_nodejs#0.38.2 before Angular Bazel did. To do this,
# the `@angular/bazel` v0.38.2 compatibility changes were patched on postinstall. This now
# conflicts because we install a `@angular/bazel` version that already includes these compatibility
# changes. This would result in the patch being a noop for which the `patch` command throws.
# To work around this temporarily, we just ensure that the patch does not run on postinstall.
# TODO: remove this once Angular components no longer needs the postinstall patch.
sed -i -r "s/shelljs.cat.+angular_bazel_0\.38\.2\.patch.+;//g" ${MATERIAL_REPO_TMP_DIR}/tools/bazel/postinstall-patches.js

# Switch into Material directory.
cd ${MATERIAL_REPO_TMP_DIR}

# Updates Material's package.json to refer to the packages-dist-ivy-aot directory.
# Note that it's not necessary to perform a yarn install, as Bazel performs its own yarn install.
node ${angular_dir}/scripts/ci/update-deps-to-dist-packages.js ${MATERIAL_REPO_TMP_DIR}/package.json ${angular_dir}/dist/packages-dist-ivy-aot/

# Copy the test blocklist into the "angular/components" repository. The components
# repository automatically picks up the blocklist and disables the specified tests.
cp ${angular_dir}/tools/material-ci/test-blocklist.ts ${MATERIAL_REPO_TMP_DIR}/test/

# Ensure that the `@angular/localize` package is there. (It wasn't before v9.)
yarn --cwd ${MATERIAL_REPO_TMP_DIR} add ${angular_dir}/dist/packages-dist-ivy-aot/localize

# Create a symlink for the Bazel binary installed through NPM, as running through Yarn introduces OOM errors.
./scripts/circleci/setup_bazel_binary.sh

# Now actually run the tests. The dev-app and all its subpackages are excluded as they fail
# to compile due to limitations in Ivy's type checker (see FW-1352 and FW-1433)
bazel test --build_tag_filters=-docs-package,-e2e,-browser:firefox-local --test_tag_filters=-e2e,-browser:firefox-local --define=compile=aot -- src/... -src/dev-app/...
