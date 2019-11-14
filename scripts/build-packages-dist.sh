#!/usr/bin/env bash

source $(dirname $0)/package-builder.sh

# Build the legacy (view engine) npm packages into dist/packages-dist
buildTargetPackages "dist/packages-dist" "legacy" "Production"

# Build the `zone.js` npm package (into `dist/bin/packages/zone.js/npm_package/`), because it might be needed
# by other scripts/tests.
#
# NOTE: The `zone.js` package is not built as part of `buildTargetPackages()` above, nor is it
#       copied into the `dist/packages-dist/` directory (despite its source's being in `packages/`),
#       because it is not published to npm under the `@angular` scope (as happens for the rest of
#       the packages).
echo ""
echo "##############################"
echo "${script_path}:"
echo "  Building zone.js npm package"
echo "##############################"
yarn --silent bazel build //packages/zone.js:npm_package

# Copy artifacts to `dist/zone.js-dist/`, so they can be easier persisted on CI.
readonly buildOutputDir="$base_dir/dist/bin/packages/zone.js/npm_package"
readonly distTargetDir="$base_dir/dist/zone.js-dist/zone.js"

echo "# Copy artifacts to $distTargetDir"
mkdir -p $distTargetDir
rm -rf $distTargetDir
cp -R $buildOutputDir $distTargetDir
chmod -R u+w $distTargetDir
