import {task} from 'gulp';
import {readdirSync, statSync, existsSync, mkdirp, readFileSync, writeFileSync} from 'fs-extra';
import * as path from 'path';
import * as admin from 'firebase-admin';
import * as firebase from 'firebase';
import {
  openScreenshotsBucket,
  openFirebaseScreenshotsDatabase,
  connectFirebaseScreenshots} from '../util/firebase';
import {setGithubStatus} from '../util/github';

const imageDiff = require('image-diff');

// Directory to which untrusted screenshot results are temporarily written
//   (without authentication required) before they are verified and copied to
//   the final storage location.
const TEMP_FOLDER = 'untrustedInbox';
const SCREENSHOT_DIR = './screenshots';
const FIREBASE_REPORT = `${TEMP_FOLDER}/screenshot/reports`;
const FIREBASE_IMAGE = `${TEMP_FOLDER}/screenshot/images`;
const FIREBASE_FILELIST = 'screenshot/filenames';

/** Task which upload screenshots generated from e2e test. */
task('screenshots', () => {
  let prNumber = process.env['TRAVIS_PULL_REQUEST'];
  if (prNumber) {
    let firebaseApp = connectFirebaseScreenshots();
    let database = firebaseApp.database();

    return getScreenshotFiles(database)
      .then(() => downloadAllGoldsAndCompare(database, prNumber))
      .then((results: boolean) => updateResult(database, prNumber, results))
      .then((result: boolean) => updateGithubStatus(prNumber, result))
      .then(() => uploadScreenshotsData(database, 'diff', prNumber))
      .then(() => uploadScreenshotsData(database, 'test', prNumber))
      .then(() => updateTravis(database, prNumber))
      .then(() => setScreenFilenames(database, prNumber))
      .then(() => database.goOffline(), () => database.goOffline());
  } else if (process.env['TRAVIS']) {
    // Only update golds and filenames for build
    let database = openFirebaseScreenshotsDatabase();
    uploadScreenshots()
      .then(() => setScreenFilenames(database))
      .then(() => database.goOffline(), () => database.goOffline());
  }
});

function updateFileResult(database: firebase.database.Database, prNumber: string,
                          filenameKey: string, result: boolean) {
  return getPullRequestRef(database, prNumber).child('results').child(filenameKey).set(result);
}

function updateResult(database: firebase.database.Database, prNumber: string, result: boolean) {
  return getPullRequestRef(database, prNumber).child('result').set(result).then(() => result);
}

function getPullRequestRef(database: firebase.database.Database | admin.database.Database,
                           prNumber: string) {
  let secureToken = getSecureToken();
  return database.ref(FIREBASE_REPORT).child(prNumber).child(secureToken);
}

function updateTravis(database: firebase.database.Database,
                      prNumber: string) {
  return getPullRequestRef(database, prNumber).update({
    commit: process.env['TRAVIS_COMMIT'],
    sha: process.env['TRAVIS_PULL_REQUEST_SHA'],
    travis: process.env['TRAVIS_JOB_ID'],
  });
}

/** Get a list of filenames from firebase database. */
function getScreenshotFiles(database: firebase.database.Database) {
  mkdirp(path.join(SCREENSHOT_DIR, `golds`));
  mkdirp(path.join(SCREENSHOT_DIR, `diff`));

  return database.ref('screenshot/goldens').once('value')
      .then((snapshot: firebase.database.DataSnapshot) => {
    let counter = 0;
    snapshot.forEach((childSnapshot: firebase.database.DataSnapshot) => {
      let key = childSnapshot.key;
      let binaryData = new Buffer(childSnapshot.val(), 'base64').toString('binary');
      writeFileSync(`${SCREENSHOT_DIR}/golds/${key}.screenshot.png`, binaryData, 'binary');
      counter++;
      if (counter == snapshot.numChildren()) {
        return true;
      }
    });
  }).catch((error: any) => console.log(error));
}

function extractScreenshotName(fileName: string) {
  return path.basename(fileName, '.screenshot.png');
}

function getLocalScreenshotFiles(dir: string): string[] {
  return readdirSync(dir)
    .filter((fileName: string) => !statSync(path.join(SCREENSHOT_DIR, fileName)).isDirectory())
    .filter((fileName: string) => fileName.endsWith('.screenshot.png'));
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
  return process.env['FIREBASE_ACCESS_TOKEN'].replace(/[.]/g, '/');
}

/**
 * Upload screenshots to google cloud storage.
 * @param prNumber - The key used in firebase. Here it is the PR number.
 * @param mode - Can be 'test' or 'diff' .
 *   If the images are the test results, mode should be 'test'.
 *   If the images are the diff images generated, mode should be 'diff'.
 */
function uploadScreenshotsData(database: firebase.database.Database,
                               mode: 'test' | 'diff', prNumber: string) {
  let localDir = mode == 'diff' ? path.join(SCREENSHOT_DIR, 'diff') : SCREENSHOT_DIR;
  let promises = getLocalScreenshotFiles(localDir).map((file: string) => {
    let fileName = path.join(localDir, file);
    let filenameKey = extractScreenshotName(fileName);
    let secureToken = getSecureToken();
    let data = readFileSync(fileName);
    return database.ref(FIREBASE_IMAGE).child(prNumber)
      .child(secureToken).child(mode).child(filenameKey).set(data);
  });
  return Promise.all(promises);
}


/** Download golds screenshots. */
function downloadAllGoldsAndCompare(database: firebase.database.Database, prNumber: string) {

  let filenames = getLocalScreenshotFiles(path.join(SCREENSHOT_DIR, `golds`));

  return Promise.all(filenames.map((filename: string) => {
    return diffScreenshot(filename, database, prNumber);
  })).then((results: boolean[]) => results.every((value: boolean) => value == true));
}

function diffScreenshot(filename: string, database: firebase.database.Database,
                        prNumber: string) {
  // TODO(tinayuangao): Run the downloads and diffs in parallel.
  filename = path.basename(filename);
  let goldUrl = path.join(SCREENSHOT_DIR, `golds`, filename);
  let pullRequestUrl = path.join(SCREENSHOT_DIR, filename);
  let diffUrl = path.join(SCREENSHOT_DIR, `diff`, filename);
  let filenameKey = extractScreenshotName(filename);

  if (existsSync(goldUrl) && existsSync(pullRequestUrl)) {
    return new Promise((resolve: any, reject: any) => {
      imageDiff({
        actualImage: pullRequestUrl,
        expectedImage: goldUrl,
        diffImage: diffUrl,
      }, (err: any, imagesAreSame: boolean) => {
        if (err) {
          console.log(err);
          imagesAreSame = false;
          reject(err);
        }
        resolve(imagesAreSame);
        return updateFileResult(database, prNumber, filenameKey, imagesAreSame);
      });
    });
  } else {
    return updateFileResult(database, prNumber, filenameKey, false).then(() => false);
  }
}

/**
 * Upload a list of filenames to firebase database as gold.
 * This is necessary for control panel since google-cloud is not available to client side.
 */
function setScreenFilenames(database: admin.database.Database | firebase.database.Database,
                            prNumber?: string) {
  let filenames: string[] = getLocalScreenshotFiles(SCREENSHOT_DIR);
  let filelistDatabase = prNumber ?
    getPullRequestRef(database, prNumber).child('filenames') :
    database.ref(FIREBASE_FILELIST);
  return filelistDatabase.set(filenames);
}

/** Updates the Github Status of the given Pullrequest. */
function updateGithubStatus(prNumber: number, result: boolean) {
  setGithubStatus(process.env['TRAVIS_PULL_REQUEST_SHA'], {
    result: result,
    name: 'Screenshot Tests',
    description: `Screenshot Tests ${result ? 'passed' : 'failed'})`,
    url: `http://material2-screenshots.firebaseapp.com/${prNumber}`
  });
}

/** Upload screenshots to google cloud storage. */
function uploadScreenshots() {
  let bucket = openScreenshotsBucket();
  let promises = getLocalScreenshotFiles(SCREENSHOT_DIR).map((file: string) => {
    let fileName = path.join(SCREENSHOT_DIR, file);
    let destination = `golds/${file}`;
    return bucket.upload(fileName, { destination: destination });
  });
  return Promise.all(promises);
}
