/**
 * Script that runs after node modules have been installed, and Ngcc processed all packages.
 * This script updates the `package.json` files of Angular framework packages to point to the
 * Ngcc processed UMD bundles. This is needed because we run Angular in a `nodejs_binary`, but
 * want to make sure that Ivy is being used. By default, the NodeJS module resolution will load
 * the unprocessed UMD bundle because the `main` field of the `package.json` files point to the
 * View Engine UMD bundles. This script updates the `main` field in `package.json` files to point
 * to the previously generated Ivy UMD bundles.
 *
 * Ngcc does not by edit the `main` field because we ran it with the `--create-ivy-entry-points`
 * flag. It instructs Ngcc to not modify existing package bundles, but rather create separate
 * copies with the needed Ivy modifications. This is necessary because the original bundles
 * are needed for View Engine, and we want to preserve them in order to be able to switch
 * between Ivy and View Engine (for testing). Since the goal of this flag is to not modify
 * any original package files/bundles, Ngcc will not edit the `main` field to point to
 * the processed Ivy bundles.
 */

const shelljs = require('shelljs');
const fs = require('fs');

const MAIN_FIELD_NAME = 'main';
const NGCC_MAIN_FIELD_NAME = 'main_ivy_ngcc';

shelljs.find('node_modules/@angular/**/package.json').forEach(filePath => {
  // Do not update `package.json` files for deeply nested node modules (e.g. dependencies of
  // the `@angular/compiler-cli` package).
  if (filePath.lastIndexOf('node_modules/') !== 0) {
    return;
  }
  const parsedJson = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  if (parsedJson[NGCC_MAIN_FIELD_NAME] &&
      parsedJson[MAIN_FIELD_NAME] !== parsedJson[NGCC_MAIN_FIELD_NAME]) {
    // Update the main field to point to the ngcc main script.
    parsedJson[MAIN_FIELD_NAME] = parsedJson[NGCC_MAIN_FIELD_NAME];
    fs.writeFileSync(filePath, JSON.stringify(parsedJson, null, 2));
  }
});
