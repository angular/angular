import * as firebaseAdmin from 'firebase-admin';
import * as path from 'path';
import {readFileSync} from 'fs';

const gcs = require('@google-cloud/storage')();

/** Folder on Firebase database to store golden images data */
const FIREBASE_DATA_GOLDENS = 'screenshot/goldens';

/**
 * Read golden files under /goldens/ and store the image data to
 * database /screenshot/goldens/$filename as base-64 encoded string
 * Convert png image files to BufferArray data
 */
export function copyGoldImagesToDatabase(name: string, resourceState: string, fileBucket: any) {
  // The name should always look like "goldens/xxx.png"
  let parsedPath = path.parse(name);
  // Get the file name.
  if (parsedPath.root != '' ||
    parsedPath.dir != 'goldens' ||
    parsedPath.ext.toLowerCase() != '.png') {
    return;
  }

  let filenameKey = path.basename(parsedPath.name, '.screenshot');
  let databaseRef = firebaseAdmin.database().ref(FIREBASE_DATA_GOLDENS).child(filenameKey);

  // When a gold image is deleted, also delete the corresponding record in the firebase database.
  if (resourceState === 'not_exists') {
    return databaseRef.set(null);
  }

  let tempFilePath = `/tmp/${parsedPath.base}`;
  let bucket = gcs.bucket(fileBucket);
  // Download file from bucket.
  return bucket.file(name).download({destination: tempFilePath})
    .then(() => {
      let data = readFileSync(tempFilePath);
      return databaseRef.set(data);
    }).catch((error: any) => console.error(`${filenameKey} ${error}`));
}
