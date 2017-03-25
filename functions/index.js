'use strict';

const firebaseFunctions = require('firebase-functions');
const firebaseAdmin = require('firebase-admin');
const gcs = require('@google-cloud/storage')();
const jwt = require('jsonwebtoken');
const fs = require('fs');

/**
 * Data and images handling for Screenshot test.
 *
 * All users can post data to temporary folder. These Functions will check the data with JsonWebToken and
 * move the valid data out of temporary folder.
 *
 * For valid data posted to database /$temp/screenshot/reports/$prNumber/$secureToken, move it to
 * /screenshot/reports/$prNumber.
 * These are data for screenshot results (success or failure), GitHub PR/commit and TravisCI job information
 *
 * For valid image results written to database /$temp/screenshot/images/$prNumber/$secureToken/, save the image
 * data to image files and upload to google cloud storage under location /screenshots/$prNumber
 * These are screenshot test result images, and difference images generated from screenshot comparison.
 *
 * For golden images uploaded to /goldens, read the data from images files and write the data to Firebase database
 * under location /screenshot/goldens
 * Screenshot tests can only read restricted database data with no credentials, and they cannot access
 * Google Cloud Storage. Therefore we copy the image data to database to make it available to screenshot tests.
 * 
 * The JWT is stored in the data path, so every write to database needs a valid JWT to be copied to database/storage.
 * All invalid data will be removed.
 * The JWT has 3 parts: header, payload and signature. These three parts are joint by '/' in path.
 */

// Initailize the admin app
firebaseAdmin.initializeApp(firebaseFunctions.config().firebase);

/** The valid data types database accepts */
const dataTypes = ['filenames', 'commit', 'result', 'sha', 'travis'];

/** The repo slug. This is used to validate the JWT is sent from correct repo. */
const repoSlug = firebaseFunctions.config().repo.slug;

/** The JWT secret. This is used to validate JWT. */
const secret = firebaseFunctions.config().secret.key;

/** The storage bucket to store the images. The bucket is also used by Firebase Storage. */
const bucket = gcs.bucket(firebaseFunctions.config().firebase.storageBucket);

/** The Json Web Token format. The token is stored in data path. */
const jwtFormat = '{jwtHeader}/{jwtPayload}/{jwtSignature}';

/** The temporary folder name for screenshot data that needs to be validated via JWT.  */
const tempFolder = '/untrustedInbox';

/**
 * Copy valid data from /$temp/screenshot/reports/$prNumber/$secureToken/ to /screenshot/reports/$prNumber
 * Data copied: filenames(image results names), commit(github PR info),
 *     sha (github PR info), result (true or false for all the tests), travis job number
 */
const copyDataPath = `${tempFolder}/screenshot/reports/{prNumber}/${jwtFormat}/{dataType}`;
exports.copyData = firebaseFunctions.database.ref(copyDataPath).onWrite(event => {
  const dataType = event.params.dataType;
  if (dataTypes.includes(dataType)) {
    return verifyAndCopyScreenshotResult(event, dataType);
  }
});

/**
 * Copy valid data from /$temp/screenshot/reports/$prNumber/$secureToken/ to /screenshot/reports/$prNumber
 * Data copied: test result for each file/test with ${filename}. The value should be true or false.
 */
const copyDataResultPath = `${tempFolder}/screenshot/reports/{prNumber}/${jwtFormat}/results/{filename}`;
exports.copyDataResult = firebaseFunctions.database.ref(copyDataResultPath).onWrite(event => {
  return verifyAndCopyScreenshotResult(event, `results/${event.params.filename}`);
});

/**
 * Copy valid data from database /$temp/screenshot/images/$prNumber/$secureToken/ to storage /screenshots/$prNumber
 * Data copied: test result images. Convert from data to image files in storage.
 */
const copyImagePath = `${tempFolder}/screenshot/images/{prNumber}/${jwtFormat}/{dataType}/{filename}`;
exports.copyImage = firebaseFunctions.database.ref(copyImagePath).onWrite(event => {
  // Only edit data when it is first created. Exit when the data is deleted.
  if (event.data.previous.exists() || !event.data.exists()) {
    return;
  }

  const dataType = event.params.dataType;
  const prNumber = event.params.prNumber;
  const secureToken = getSecureToken(event);
  const saveFilename = `${event.params.filename}.screenshot.png`;

  if (dataType != 'diff' && dataType != 'test') {
    return;
  }

  return verifySecureToken(secureToken, prNumber).then((payload) => {
    const tempPath = `/tmp/${dataType}-${saveFilename}`
    const filePath = `screenshots/${prNumber}/${dataType}/${saveFilename}`;
    const binaryData = new Buffer(event.data.val(), 'base64').toString('binary');
    fs.writeFile(tempPath, binaryData, 'binary');
    return bucket.upload(tempPath, {destination: filePath}).then(() => {
      // Clear the data in temporary folder after processed.
      return event.data.ref.parent.set(null);
    });
  }).catch((error) => {
    console.error(`Invalid secure token ${secureToken} ${error}`);
    return event.data.ref.parent.set(null);
  });
});

/**
 * Copy valid goldens from storage /goldens/ to database /screenshot/goldens/
 * so we can read the goldens without credentials.
 */
exports.copyGoldens = firebaseFunctions.storage.bucket(firebaseFunctions.config().firebase.storageBucket)
    .object().onChange(event => {
  // The filePath should always l ook like "goldens/xxx.png"
  const filePath = event.data.name;

  // Get the file name.
  const fileNames = filePath.split('/');
  if (fileNames.length != 2 && fileNames[0] != 'goldens') {
    return;
  }
  const filenameKey = fileNames[1].replace('.screenshot.png', '');

  // When a gold image is deleted, also delete the corresponding record in the firebase database.
  if (event.data.resourceState === 'not_exists') {
    return firebaseAdmin.database().ref(`screenshot/goldens/${filenameKey}`).set(null);
  }

  // Download file from bucket.
  const bucket = gcs.bucket(event.data.bucket);
  const tempFilePath = `/tmp/${fileNames[1]}`;
  return bucket.file(filePath).download({destination: tempFilePath}).then(() => {
    const data = fs.readFileSync(tempFilePath);
    return firebaseAdmin.database().ref(`screenshot/goldens/${filenameKey}`).set(data);
  });
});

/**
 * Handle data written to temporary folder. Validate the JWT and move the data out of
 * temporary folder if the token is valid.
 */
function verifyAndCopyScreenshotResult(event, path) {
  // Only edit data when it is first created. Exit when the data is deleted.
  if (event.data.previous.exists() || !event.data.exists()) {
    return;
  }

  const prNumber = event.params.prNumber;
  const secureToken = getSecureToken(event);
  const original = event.data.val();

  return verifySecureToken(secureToken, prNumber).then((payload) => {
    return firebaseAdmin.database().ref().child('screenshot/reports')
        .child(prNumber).child(path).set(original).then(() => {
      // Clear the data in temporary folder after processed.
      return event.data.ref.parent.set(null);
    });
  }).catch((error) => {
    console.error(`Invalid secure token ${secureToken} ${error}`);
    return event.data.ref.parent.set(null);
  });
}

/**
 * Extract the Json Web Token from event params.
 * In screenshot gulp task the path we use is {jwtHeader}/{jwtPayload}/{jwtSignature}.
 * Replace '/' with '.' to get the token.
 */
function getSecureToken(event) {
  return `${event.params.jwtHeader}.${event.params.jwtPayload}.${event.params.jwtSignature}`;
}

function verifySecureToken(token, prNumber) {
  return new Promise((resolve, reject) => {
    jwt.verify(token, secret, {issuer: 'Travis CI, GmbH'}, (err, payload) => {
      if (err) {
        reject(err.message || err);
      } else if (payload.slug !== repoSlug) {
        reject(`jwt slug invalid. expected: ${repoSlug}`);
      } else if (payload['pull-request'].toString() !== prNumber) {
        reject(`jwt pull-request invalid. expected: ${prNumber} actual: ${payload['pull-request']}`);
      } else {
        resolve(payload);
      }
    });
  });
}
