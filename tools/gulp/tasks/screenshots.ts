import {task} from 'gulp';
import {readdirSync, statSync, existsSync, mkdirp, readFileSync, writeFileSync} from 'fs-extra';
import {openScreenshotsBucket, connectFirebaseScreenshots} from '../util/firebase';
import {isTravisMasterBuild} from '../util/travis-ci';

import * as path from 'path';
import * as firebaseAdmin from 'firebase-admin';

// Firebase provides TypeScript definitions that are only accessible from specific namespaces.
// This means that those types are really long and it's nearly impossible to write a function that
// doesn't exceed the maximum columns. Import the types from the namespace so they are shorter.
import Database = firebaseAdmin.database.Database;
import DataSnapshot = firebaseAdmin.database.DataSnapshot;

// This import lacks of type definitions.
const imageDiff = require('image-diff');

/** Travis secure token that will be used by the Screenshot functions to verify the identity. */
const travisSecureToken = getSecureToken();

/** Git SHA of the current Pull Request being checked by Travis. */
const pullRequestSha = process.env['TRAVIS_PULL_REQUEST_SHA'];

const SCREENSHOT_DIR = './screenshots';
const LOCAL_GOLDENS = path.join(SCREENSHOT_DIR, `golds`);
const LOCAL_DIFFS = path.join(SCREENSHOT_DIR, `diff`);

// Directory to which untrusted screenshot results are temporarily written
// (without authentication required) before they are verified and copied to
// the final storage location.
const TEMP_FOLDER = 'untrustedInbox';
const FIREBASE_REPORT = `${TEMP_FOLDER}/screenshot/reports`;
const FIREBASE_IMAGE = `${TEMP_FOLDER}/screenshot/images`;
const FIREBASE_DATA_GOLDENS = `screenshot/goldens`;
const FIREBASE_STORAGE_GOLDENS = 'goldens';

/** Task which upload screenshots generated from e2e test. */
task('screenshots', () => {
  const prNumber = process.env['TRAVIS_PULL_REQUEST'];

  if (isTravisMasterBuild()) {
    // Only update goldens for master build
    return uploadGoldenScreenshots();
  } else if (prNumber) {
    const firebaseApp = connectFirebaseScreenshots();
    const database = firebaseApp.database();
    let lastActionTime = Date.now();

    console.log(`  Starting screenshots task with results from e2e task...`);

    return uploadTravisJobInfo(database, prNumber)
      .then(() => {
        console.log(`  Downloading screenshot golds from Firebase...`);
        lastActionTime = Date.now();
        return downloadGoldScreenshotFiles(database);
      })
      .then(() => {
        console.log(`  Downloading golds done (took ${Date.now() - lastActionTime}ms)`);
        console.log(`  Comparing screenshots golds to test result screenshots...`);
        lastActionTime = Date.now();
        return compareScreenshotFiles(database, prNumber);
      })
      .then(passedAll => {
        console.log(`  Comparison done (took ${Date.now() - lastActionTime}ms)`);
        console.log(`  Uploading screenshot diff results to Firebase and GitHub...`);
        lastActionTime = Date.now();
        return Promise.all([
          setPullRequestResult(database, prNumber, passedAll),
          uploadScreenshotsData(database, 'diff', prNumber),
          uploadScreenshotsData(database, 'test', prNumber),
        ]);
      })
      .then(() => {
        console.log(`  Uploading results done (took ${Date.now() - lastActionTime}ms)`);
        firebaseApp.delete();
      })
      .catch((err: any) => {
        console.error(`  Screenshot tests encountered an error!`);
        console.error(err);
        firebaseApp.delete();
      });
  }
});

/** Sets the screenshot diff result for a given file of a Pull Request. */
function setFileResult(database: Database, prNumber: string, fileName: string, result: boolean) {
  return getPullRequestRef(database, prNumber).child('results').child(fileName).set(result);
}

/** Sets the full diff result for the current Pull Request that runs inside of Travis. */
function setPullRequestResult(database: Database, prNumber: string, result: boolean) {
  return getPullRequestRef(database, prNumber).child('result').child(pullRequestSha).set(result);
}

/** Returns the Firebase Reference that contains all data related to the specified PR. */
function getPullRequestRef(database: Database, prNumber: string) {
  return database.ref(FIREBASE_REPORT).child(prNumber).child(travisSecureToken);
}

/** Uploads necessary Travis CI job variables that will be used in the Screenshot Panel. */
function uploadTravisJobInfo(database: Database, prNumber: string) {
  return getPullRequestRef(database, prNumber).update({
    sha: process.env['TRAVIS_PULL_REQUEST_SHA'],
    travis: process.env['TRAVIS_JOB_ID'],
  });
}

/** Downloads all golden screenshot files and stores them in the local file system. */
function downloadGoldScreenshotFiles(database: Database) {
  // Create the directory that will contain all goldens if it's not present yet.
  mkdirp(LOCAL_GOLDENS);

  return database.ref(FIREBASE_DATA_GOLDENS).once('value').then(snapshot => {
    snapshot.forEach((childSnapshot: DataSnapshot) => {
      const screenshotName = childSnapshot.key;
      const binaryData = new Buffer(childSnapshot.val(), 'base64').toString('binary');

      writeFileSync(`${LOCAL_GOLDENS}/${screenshotName}.screenshot.png`, binaryData, 'binary');
    });
  });
}

/** Extracts the name of a given screenshot file by removing the file extension. */
function extractScreenshotName(fileName: string) {
  return path.basename(fileName, '.screenshot.png');
}

/** Gets a list of files inside of a directory that end with `.screenshot.png`. */
function getLocalScreenshotFiles(directory: string): string[] {
  return readdirSync(directory)
    .filter((fileName: string) => !statSync(path.join(directory, fileName)).isDirectory())
    .filter((fileName: string) => fileName.endsWith('.screenshot.png'));
}

/**
 * Upload screenshots to a Firebase Database path that will then upload the file to a Google
 * Cloud Storage bucket if the Auth token is valid.
 * @param database Firebase database instance.
 * @param prNumber The key used in firebase. Here it is the PR number.
 * @param mode Upload mode. This can be either 'test' or 'diff'.
 *  - If the images are the test results, mode should be 'test'.
 *  - If the images are the diff images generated, mode should be 'diff'.
 */
function uploadScreenshotsData(database: Database, mode: 'test' | 'diff', prNumber: string) {
  const localDir = mode == 'diff' ? path.join(SCREENSHOT_DIR, 'diff') : SCREENSHOT_DIR;

  return Promise.all(getLocalScreenshotFiles(localDir).map(file => {
    const filePath = path.join(localDir, file);
    const fileName = extractScreenshotName(filePath);
    const binaryContent = readFileSync(filePath);

    // Upload the Buffer of the screenshot image to a Firebase Database reference that will
    // then upload the screenshot file to a Google Cloud Storage bucket if the JWT token is valid.
    return database.ref(FIREBASE_IMAGE)
      .child(prNumber).child(travisSecureToken).child(mode).child(fileName)
      .set(binaryContent);
  }));
}

/** Concurrently compares every golden screenshot with the newly taken screenshots. */
function compareScreenshotFiles(database: Database, prNumber: string) {
  const fileNames = getLocalScreenshotFiles(LOCAL_GOLDENS);
  const compares = fileNames.map(fileName => compareScreenshotFile(fileName, database, prNumber));

  // Wait for all compares to finish and then return a Promise that resolves with a boolean that
  // shows whether the tests passed or not.
  return Promise.all(compares).then((results: boolean[]) => results.every(Boolean));
}

/** Compare the specified screenshot file with the golden file from Firebase. */
function compareScreenshotFile(fileName: string, database: Database, prNumber: string) {
  const goldScreenshotPath = path.join(LOCAL_GOLDENS, fileName);
  const localScreenshotPath = path.join(SCREENSHOT_DIR, fileName);
  const diffScreenshotPath = path.join(LOCAL_DIFFS, fileName);

  const screenshotName = extractScreenshotName(fileName);

  if (existsSync(goldScreenshotPath) && existsSync(localScreenshotPath)) {
    return compareImage(localScreenshotPath, goldScreenshotPath, diffScreenshotPath)
      .then(result => {
        // Set the screenshot diff result in Firebase and afterwards pass the result boolean
        // to the Promise chain again.
        return setFileResult(database, prNumber, screenshotName, result).then(() => result);
      });
  } else {
    return setFileResult(database, prNumber, screenshotName, false).then(() => false);
  }
}

/** Uploads golden screenshots to the Google Cloud Storage bucket for the screenshots. */
function uploadGoldenScreenshots() {
  const bucket = openScreenshotsBucket();

  return Promise.all(getLocalScreenshotFiles(SCREENSHOT_DIR).map(fileName => {
    const filePath = path.join(SCREENSHOT_DIR, fileName);
    const storageDestination = `${FIREBASE_STORAGE_GOLDENS}/${fileName}`;

    return bucket.upload(filePath, { destination: storageDestination });
  }));
}

/**
 * Compares two images using the Node package image-diff. A difference screenshot will be created.
 * The returned promise will resolve with a boolean that will be true if the images are equal.
 */
function compareImage(actualPath: string, goldenPath: string, diffPath: string): Promise<boolean> {
  return new Promise(resolve => {
    imageDiff({
      actualImage: actualPath,
      expectedImage: goldenPath,
      diffImage: diffPath,
    }, (err: any, imagesAreEqual: boolean) => {
      if (err) {
        throw err;
      }

      resolve(imagesAreEqual);
    });
  });
}

/**
 * Get processed secure token. The jwt token has 3 parts: header, payload, signature and has format
 * {jwtHeader}.{jwtPayload}.{jwtSignature}
 * The three parts is connected by '.', while '.' is not a valid path in firebase database.
 * Replace all '.' to '/' to make the path valid
 * Output is {jwtHeader}/{jwtPayload}/{jwtSignature}.
 * This secure token is used to validate the write access is from our TravisCI under our repo.
 * All data is written to /$path/$secureToken/$data and after validated the
 * secure token, the data is moved to /$path/$data in database.
 */
function getSecureToken() {
  return (process.env['FIREBASE_ACCESS_TOKEN'] || '').replace(/[.]/g, '/');
}
