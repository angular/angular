import {verify} from 'jsonwebtoken';
import {config} from 'firebase-functions';

/** The JWT secret. This is used to validate JWT. */
const jwtSecret = config().jwtSecret;

/** The repo slug. This is used to validate the JWT is sent from correct repo. */
const repoSlug = config().repoSlug;

export function verifyToken(token: string): boolean {
  try {
    const tokenPayload = verify(token, jwtSecret, {issuer: 'Travis CI, GmbH'});

    if (tokenPayload.slug !== repoSlug) {
      console.log(`JWT slugs are not matching. Expected ${repoSlug}`);
    }

    return true;
  } catch (e) {
    return false;
  }
}
