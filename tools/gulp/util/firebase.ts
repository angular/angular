const firebaseAdmin = require('firebase-admin');
const gcloud = require('google-cloud');

/** Opens a connection to the firebase realtime database. */
export function openFirebaseDashboardDatabase() {
  // Initialize the Firebase application with admin credentials.
  // Credentials need to be for a Service Account, which can be created in the Firebase console.
  firebaseAdmin.initializeApp({
    credential: firebaseAdmin.credential.cert({
      project_id: 'material2-dashboard',
      client_email: 'firebase-adminsdk-ch1ob@material2-dashboard.iam.gserviceaccount.com',
      // In Travis CI the private key will be incorrect because the line-breaks are escaped.
      // The line-breaks need to persist in the service account private key.
      private_key: (process.env['MATERIAL2_FIREBASE_PRIVATE_KEY'] || '').replace(/\\n/g, '\n')
    }),
    databaseURL: 'https://material2-dashboard.firebaseio.com'
  });

  return firebaseAdmin.database();
}

/**
 * Open Google Cloud Storage for screenshots.
 * The files uploaded to google cloud are also available to firebase storage.
 */
export function openScreenshotsBucket() {
  let gcs = gcloud.storage({
    projectId: 'material2-screenshots',
    credentials: {
      client_email: 'firebase-adminsdk-t4209@material2-screenshots.iam.gserviceaccount.com',
      private_key: decode(process.env['MATERIAL2_SCREENSHOT_FIREBASE_KEY'])
    },
  });

  // Reference the existing appspot bucket.
  return gcs.bucket('material2-screenshots.appspot.com');
}

/** Opens a connection to the firebase database for screenshots. */
export function openFirebaseScreenshotsDatabase() {
  // Initialize the Firebase application with admin credentials.
  // Credentials need to be for a Service Account, which can be created in the Firebase console.
  let screenshotApp = firebaseAdmin.initializeApp({
    credential: firebaseAdmin.credential.cert({
      project_id: 'material2-screenshots',
      client_email: 'firebase-adminsdk-t4209@material2-screenshots.iam.gserviceaccount.com',
      private_key: decode(process.env['MATERIAL2_SCREENSHOT_FIREBASE_KEY'])
    }),
    databaseURL: 'https://material2-screenshots.firebaseio.com'
  }, 'material2-screenshots');

  return screenshotApp.database();
}

/** Decodes a Travis CI variable that is public in favor for PRs. */
export function decode(str: string): string {
  // In Travis CI the private key will be incorrect because the line-breaks are escaped.
  // The line-breaks need to persist in the service account private key.
  return (str || '').split('\\n').reverse().join('\\n').replace(/\\n/g, '\n');
}

