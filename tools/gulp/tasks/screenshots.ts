import {task} from 'gulp';
import {readdirSync, statSync, existsSync, mkdirp} from 'fs-extra';
import * as path from 'path';
import * as admin from 'firebase-admin';
import {openScreenshotsBucket, openFirebaseScreenshotsDatabase} from '../util/firebase';
import {setGithubStatus} from '../util/github';

const imageDiff = require('image-diff');

const SCREENSHOT_DIR = './screenshots';
const FIREBASE_REPORT = 'screenshot/reports';
const FIREBASE_FILELIST = 'screenshot/filenames';

/** Task which upload screenshots generated from e2e test. */
task('screenshots', () => {
  let prNumber = process.env['TRAVIS_PULL_REQUEST'];
  if (prNumber) {
    let database = openFirebaseScreenshotsDatabase();
    return getScreenshotFiles(database)
      .then((files: any[]) => downloadAllGoldsAndCompare(files, database, prNumber))
      .then((results: boolean) => updateResult(database, prNumber, results))
      .then((result: boolean) => updateGithubStatus(prNumber, result))
      .then(() => uploadScreenshots('diff', prNumber))
      .then(() => uploadScreenshots('test', prNumber))
      .then(() => updateTravis(database, prNumber))
      .then(() => setScreenFilenames(database, prNumber))
      .then(() => database.goOffline(), () => database.goOffline());
  } else if (process.env['TRAVIS']) {
    // Only update golds and filenames for build
    let database = openFirebaseScreenshotsDatabase();
    uploadScreenshots('gold')
      .then(() => setScreenFilenames(database))
      .then(() => database.goOffline(), () => database.goOffline());
  }
});

function updateFileResult(database: admin.database.Database, prNumber: string,
                          filenameKey: string, result: boolean) {
  return getPullRequestRef(database, prNumber).child('results').child(filenameKey).set(result);
}

function updateResult(database: admin.database.Database, prNumber: string, result: boolean) {
  return getPullRequestRef(database, prNumber).child('result').set(result).then(() => result);
}

function getPullRequestRef(database: admin.database.Database, prNumber: string) {
  return database.ref(FIREBASE_REPORT).child(prNumber);
}

function updateTravis(database: admin.database.Database,
                      prNumber: string) {
  return database.ref(FIREBASE_REPORT).child(prNumber).update({
    commit: process.env['TRAVIS_COMMIT'],
    sha: process.env['TRAVIS_PULL_REQUEST_SHA'],
    travis: process.env['TRAVIS_JOB_ID'],
  });
}

/** Get a list of filenames from firebase database. */
function getScreenshotFiles(database: admin.database.Database) {
  let bucket = openScreenshotsBucket();
  return bucket.getFiles({ prefix: 'golds/' }).then(function(data: any) {
    return data[0].filter((file: any) => file.name.endsWith('.screenshot.png'));
  });
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
 * Upload screenshots to google cloud storage.
 * @param prNumber - The key used in firebase. Here it is the PR number.
 *   If there's no prNumber, we will upload images to 'golds/' folder
 * @param mode - Can be 'test' or 'diff' or 'gold'.
 *   If the images are the test results, mode should be 'test'.
 *   If the images are the diff images generated, mode should be 'diff'.
 *   For golds mode should be 'gold'.
 */
function uploadScreenshots(mode?: 'test' | 'diff' | 'gold', prNumber?: string) {
  let bucket = openScreenshotsBucket();

  let promises: any[] = [];
  let localDir = mode == 'diff' ? path.join(SCREENSHOT_DIR, 'diff') : SCREENSHOT_DIR;
  getLocalScreenshotFiles(localDir).forEach((file: string) => {
    let fileName = path.join(localDir, file);
    let destination = (mode == 'gold' || !prNumber) ?
      `golds/${file}` : `screenshots/${prNumber}/${mode}/${file}`;
    promises.push(bucket.upload(fileName, { destination: destination }));
  });
  return Promise.all(promises);
}

/** Download golds screenshots. */
function downloadAllGoldsAndCompare(
  files: any[], database: admin.database.Database,
  prNumber: string) {

  mkdirp(path.join(SCREENSHOT_DIR, `golds`));
  mkdirp(path.join(SCREENSHOT_DIR, `diff`));

  return Promise.all(files.map((file: any) => {
    return downloadGold(file).then(() => diffScreenshot(file.name, database, prNumber));
  })).then((results: boolean[]) => results.every((value: boolean) => value == true));
}

/** Download one gold screenshot */
function downloadGold(file: any) {
  return file.download({
    destination: path.join(SCREENSHOT_DIR, file.name)
  });
}

function diffScreenshot(filename: string, database: admin.database.Database,
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
function setScreenFilenames(database: admin.database.Database,
                            prNumber?: string) {
  let filenames: string[] = getLocalScreenshotFiles(SCREENSHOT_DIR);
  let filelistDatabase = prNumber ?
    database.ref(FIREBASE_REPORT).child(prNumber).child('filenames') :
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
