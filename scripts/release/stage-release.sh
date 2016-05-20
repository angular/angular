#!/usr/bin/env bash
set -exu

# Stages a release by putting everything that should be packaged and released
# into the ./deploy folder. This script should be run from the root of the
# material2 repo.

# Make sure you are not running `ng serve` or `ng build --watch` when running this.


# Clear dist/ and deploy/ so that we guarantee there are no stale artifacts.
rm -rf ./dist
rm -rf ./deploy

# Perform a build with the modified tsconfig.json.
ng build

# Inline the css and html into the component ts files.
npm run inline-resources

# deploy/ serves as a working directory to stage the release.
mkdir deploy

# Copy all components/ to deploy/ and replace `../../core` with `@angular2-material/core`
# that each component depends on the core *package*.
# Use a `.bak` extension for sed backup because `sed` on OSX will not work without a backup
# extension. Delete the backups immediately after.
cp -R ./dist/components/* ./deploy/
find ./deploy -type f \( -name "*.js" -o -name "*.ts" \) -exec sed -i.bak 's|\.\./\.\./core|@angular2-material/core|g' {} \;


find ./deploy -type f -name "*.bak" | xargs rm

# Copy the core/ directory directly into ./deploy
cp -R ./dist/core/ ./deploy/core/

# To test the packages, simply `npm install` the package directories.
