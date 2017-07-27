import * as firebaseFunctions from 'firebase-functions';
import {verifyJWT} from './util/jwt';

/** The repo slug. This is used to validate the JWT is sent from correct repo. */
const repoSlug = firebaseFunctions.config().repo.slug;

/** The JWT secret. This is used to validate JWT. */
const secret = firebaseFunctions.config().secret.key;

/**
 * Extract the Json Web Token from event params.
 * In screenshot gulp task the path we use is {jwtHeader}/{jwtPayload}/{jwtSignature}.
 * Replace '/' with '.' to get the token.
 */
function getSecureToken(event: firebaseFunctions.Event<any>) {
  const {jwtHeader, jwtPayload, jwtSignature} = event.params!;
  return `${jwtHeader}.${jwtPayload}.${jwtSignature}`;
}


/**
 * Verify that the event has a valid JsonWebToken. If the token is *not* valid,
 * the data tied to the event will be deleted and the function will return a rejected promise.
 */
export function verifySecureToken(event: firebaseFunctions.Event<any>) {
  return new Promise((resolve, reject) => {
    const prNumber = event.params!['prNumber'];
    const secureToken = getSecureToken(event);

    return verifyJWT(secureToken, prNumber, secret, repoSlug).then(() => {
      resolve();
      event.data.ref.parent.set(null);
    }).catch((error: any) => {
      console.error(`Invalid secure token ${secureToken} ${error}`);
      event.data.ref.parent.set(null);
      reject();
    });
  });
}
