import * as firebaseFunctions from 'firebase-functions';
import * as firebaseAdmin from 'firebase-admin';
import * as path from 'path';

const gcs = require('@google-cloud/storage')();

/** The storage bucket to store the images. The bucket is also used by Firebase Storage. */
const bucket = gcs.bucket(firebaseFunctions.config().firebase.storageBucket);

/**
 * Copy files from /screenshot/$prNumber/test/ to goldens/
 * Only copy the files that test result is failure. Passed test images should be the same as
 * goldens.
 */
export function copyTestImagesToGoldens(prNumber: string) {
  return firebaseAdmin.database().ref(`screenshot/reports/${prNumber}/results`).once('value')
    .then((snapshot: firebaseAdmin.database.DataSnapshot) => {
      const failedFilenames: string[] = [];
      let counter = 0;

      snapshot.forEach(childSnapshot => {
        if (childSnapshot.key && childSnapshot.val() === false) {
          failedFilenames.push(childSnapshot.key);
        }

        counter++;
        return counter === snapshot.numChildren();
      });

      return failedFilenames;
    }).then((failedFilenames: string[]) => {
      return bucket.getFiles({prefix: `screenshots/${prNumber}/test`}).then((data: any) => {
        return Promise.all(data[0]
          .filter((file: any) => failedFilenames.includes(
            path.basename(file.name, '.screenshot.png')))
          .map((file: any) => file.copy(`goldens/${path.basename(file.name)}`)));
      });
    });
}
