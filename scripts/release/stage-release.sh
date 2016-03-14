#!/usr/bin/env bash
set -ex

# Stages a release by putting everything that should be packaged and released
# into the ./deploy folder. This script should be run from the root of the
# material2 repo.

# Make sure you are not running `ng serve` or `ng build --watch` when running this.


# Clear dist/ and deploy/ so that we guarantee there are no stale artifacts.
rm -rf ./dist
rm -rf ./deploy

# For packaging for npm only, replace the TypeScript module format to commonjs.
# Creates a tscongig.json.backup with the original file that we'll use to restore after building.
sed -i.backup 's|"module": ".+"|"module": "commonjs"|g' ./src/tsconfig.json

# Perform a build with the modified tsconfig.json.
ng build

# Return tsconfig.json to its original state.
mv -f ./src/tsconfig.json.backup ./src/tsconfig.json

# Inline the css and html into the component ts files.
./node_modules/gulp/bin/gulp.js inline-resources

# deploy/ serves as a working directory to stage the release.
mkdir deploy

# Copy all components/ to deploy/ and replace "../core" with just "core" since each
# component directory will now live as a sibling to core/.
# Use a `.bak` extension for sed backup because `sed` on OSX will not work without a backup
# extension. Delete the backups immediately after.
cp -R ./dist/components/* ./deploy/
find ./deploy -type f \( -name "*.js" -o -name "*.ts" \) -exec sed -i.bak 's|\.\./core|core|g' {} \;
find ./deploy -type f -name "*.bak" | xargs rm

# Copy the core/ directory directly into ./deploy
cp -R ./dist/core/ ./deploy/core/

# To test the packages, use `npm link` in the package directories.
# See https://docs.npmjs.com/cli/link
