import {verify} from 'jsonwebtoken';
import {config} from 'firebase-functions';

/** The JWT secret. This is used to validate JWT. */
const jwtSecret = config().secret.jwt;

/** The repo slug. This is used to validate the JWT is sent from correct repo. */
const repoSlug = config().repo.slug;

export function verifyToken(token: string): boolean {
  try {
    // The returned value of the verify method can be either a string or a object. Reading
    // properties without explicitly treating the result as `any` will lead to a TypeScript error.
    const tokenPayload = verify(token, jwtSecret, {issuer: 'Travis CI, GmbH'}) as any;

    if (tokenPayload.slug !== repoSlug) {
      console.log(`JWT slugs are not matching. Expected ${repoSlug}`);
    }

    return true;
  } catch (e) {
    return false;
  }
}
