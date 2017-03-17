import {task} from 'gulp';
import {join} from 'path';
import {statSync, readFileSync} from 'fs';
import {DIST_COMPONENTS_ROOT} from '../constants';
import {spawnSync} from 'child_process';
import {isTravisPushBuild} from '../util/travis-ci';
import {openFirebaseDashboardDatabase} from '../util/firebase';

// There are no type definitions available for these imports.
const uglifyJs = require('uglify-js');

const BUNDLE_PATH = join(DIST_COMPONENTS_ROOT, 'bundles', 'material.umd.js');

/** Task which runs test against the size of whole library. */
task('payload', ['build:release'], () => {

  let results = {
    umd_kb: getFilesize(BUNDLE_PATH),
    umd_minified_uglify_kb: getUglifiedSize(BUNDLE_PATH),
    timestamp: Date.now()
  };

  // Print the results to the console, so we can read it from the CI.
  console.log('Payload Results:', JSON.stringify(results, null, 2));

  // Publish the results to firebase when it runs on Travis and not as a PR.
  if (isTravisPushBuild()) {
    return publishResults(results);
  }

});

/** Returns the size of a file in kilobytes. */
function getFilesize(filePath: string) {
  return statSync(filePath).size / 1000;
}

/** Returns the size of a uglify minified file in kilobytes */
function getUglifiedSize(filePath: string) {
  let fileContent = readFileSync(filePath, 'utf-8');

  let compressedFile = uglifyJs.minify(fileContent, {
    fromString: true
  });

  return Buffer.byteLength(compressedFile.code, 'utf8') / 1000;
}

/** Publishes the given results to the firebase database. */
function publishResults(results: any) {
  let latestSha = spawnSync('git', ['rev-parse', 'HEAD']).stdout.toString().trim();
  let database = openFirebaseDashboardDatabase();

  // Write the results to the payloads object with the latest Git SHA as key.
  return database.ref('payloads').child(latestSha).set(results)
    .then(() => database.goOffline(), () => database.goOffline());
}
