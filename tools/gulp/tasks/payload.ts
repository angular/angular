import {task} from 'gulp';
import {join} from 'path';
import {statSync} from 'fs';
import {isTravisBuild, isTravisMasterBuild} from '../util/travis-ci';
import {buildConfig} from '../packaging/build-config';
import {openFirebaseDashboardApp, openFirebaseDashboardAppAsGuest} from '../util/firebase';
import * as firebaseAdmin from 'firebase-admin';


// These imports lack of type definitions.
const request = require('request');

/** Path to the directory where all bundles are living. */
const bundlesDir = join(buildConfig.outputDir, 'bundles');

/** Task which runs test against the size of material. */
task('payload', ['material:clean-build'], async () => {

  const results = {
    timestamp: Date.now(),
    // Material bundles
    material_umd: getBundleSize('material.umd.js'),
    material_umd_minified_uglify: getBundleSize('material.umd.min.js'),
    material_fesm_2015: getBundleSize('material.js'),
    material_fesm_2014: getBundleSize('material.es5.js'),
    // CDK bundles
    cdk_umd: getBundleSize('cdk.umd.js'),
    cdk_umd_minified_uglify: getBundleSize('cdk.umd.min.js'),
    cdk_fesm_2015: getBundleSize('cdk.js'),
    cdk_fesm_2014: getBundleSize('cdk.es5.js'),
  };

  // Print the results to the console, so we can read it from the CI.
  console.log('Payload Results:', JSON.stringify(results, null, 2));

  if (isTravisBuild()) {
    // Open a connection to Firebase. For PRs the connection will be established as a guest.
    const firebaseApp = isTravisMasterBuild() ?
        openFirebaseDashboardApp() :
        openFirebaseDashboardAppAsGuest();
    const database = firebaseApp.database();
    const currentSha = process.env['TRAVIS_PULL_REQUEST_SHA'] || process.env['TRAVIS_COMMIT'];

    // Upload the payload results and calculate the payload diff in parallel. Otherwise the
    // payload task will take much more time inside of Travis builds.
    await Promise.all([
      uploadPayloadResults(database, currentSha, results),
      calculatePayloadDiff(database, currentSha, results)
    ]);

    // Disconnect database connection because Firebase otherwise prevents Gulp from exiting.
    firebaseApp.delete();
  }

});

/** Returns the size of the given library bundle. */
function getBundleSize(bundleName: string) {
  return getFilesize(join(bundlesDir, bundleName));
}

/** Returns the size of a file in kilobytes. */
function getFilesize(filePath: string) {
  return statSync(filePath).size / 1000;
}

/**
 * Calculates the difference between the last and current library payload.
 * The results will be published as a commit status on Github.
 */
async function calculatePayloadDiff(database: firebaseAdmin.database.Database, currentSha: string,
                                    currentPayload: any) {
  const authToken = process.env['FIREBASE_ACCESS_TOKEN'];

  if (!authToken) {
    console.error('Cannot calculate Payload diff because there is no "FIREBASE_ACCESS_TOKEN" ' +
      'environment variable set.');
    return;
  }

  const previousPayload = await getLastPayloadResults(database);

  if (!previousPayload) {
    console.warn('There are no previous payload results uploaded. Cannot calculate payload ' +
      'difference for this job');
    return;
  }

  // Calculate the payload diffs by subtracting the previous size of the FESM ES2015 bundles.
  const cdkFullSize = currentPayload.cdk_fesm_2015;
  const cdkDiff = cdkFullSize - previousPayload.cdk_fesm_2015;

  const materialFullSize = currentPayload.material_fesm_2015;
  const materialDiff = materialFullSize - previousPayload.material_fesm_2015;

  // Set the Github statuses for the packages by sending a HTTP request to the dashboard functions.
  await Promise.all([
    updateGithubStatus(currentSha, 'material', materialDiff, materialFullSize, authToken),
    updateGithubStatus(currentSha, 'cdk', cdkDiff, cdkFullSize, authToken)
  ]);
}

/**
 * Updates the Github status of a given commit by sending a request to a Firebase function of
 * the dashboard. The function has access to the Github repository and can set status for PRs too.
 */
async function updateGithubStatus(commitSha: string, packageName: string, packageDiff: number,
                                  packageFullSize: number, authToken: string) {
  const options = {
    url: 'https://us-central1-material2-board.cloudfunctions.net/payloadGithubStatus',
    headers: {
      'User-Agent': 'Material2/PayloadTask',
      'auth-token': authToken,
      'commit-sha': commitSha,
      'package-name': packageName,
      'package-full-size': packageFullSize,
      'package-size-diff': packageDiff
    }
  };

  return new Promise((resolve, reject) => {
    request(options, (err: any, response: any, body: string) => {
      if (err) {
        reject(`Dashboard Error ${err.toString()}`);
      } else {
        console.info('Dashboard Response:', JSON.parse(body).message);
        resolve(response.statusCode);
      }
    });
  });
}

/** Uploads the current payload results to the Dashboard database. */
async function uploadPayloadResults(database: firebaseAdmin.database.Database, currentSha: string,
                                    currentPayload: any) {
  if (isTravisMasterBuild()) {
    await database.ref('payloads').child(currentSha).set(currentPayload);
  }
}

/** Gets the last payload uploaded from previous Travis builds. */
async function getLastPayloadResults(database: firebaseAdmin.database.Database) {
  const snapshot = await database.ref('payloads')
    .orderByChild('timestamp')
    .limitToLast(1)
    .once('value');

  // The value of the DataSnapshot is an object with the SHA as a key. Later only the
  // first value of the object will be returned because the SHA is unnecessary.
  const results = snapshot.val();

  return snapshot.hasChildren() ? results[Object.keys(results)[0]] : null;
}
