import * as firebaseAdmin from 'firebase-admin';
import {verifySecureToken} from './jwt-util';
import {isCreateEvent} from './util/util';

/**
 * Verifies that a screenshot report is valid (trusted via JWT) and, if so, copies it from the
 * temporary, unauthenticated location to the more permanent, trusted location.
 */
export function verifyJwtAndTransferResultToTrustedLocation(event: any, path: string) {
  // Only edit data when it is first created. Exit when the data is deleted.
  if (!isCreateEvent(event)) {
    return;
  }

  let prNumber = event.params.prNumber;
  let data = event.data.val();

  return verifySecureToken(event).then(() => {
    return firebaseAdmin.database().ref().child('screenshot/reports')
      .child(prNumber).child(path).set(data);
  });
}
