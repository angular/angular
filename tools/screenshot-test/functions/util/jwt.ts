import * as jwt from 'jsonwebtoken';

export function verifyJWT(token: string, prNumber: string, secret: string, repoSlug: string) {
  return new Promise((resolve, reject) => {
    jwt.verify(token, secret, {issuer: 'Travis CI, GmbH'}, (err: any, payload: any) => {
      if (err) {
        reject(err.message || err);
      } else if (payload.slug !== repoSlug) {
        reject(`jwt slug invalid. expected: ${repoSlug}`);
      } else if (payload['pull-request'].toString() !== prNumber) {
        reject(`jwt pull-request invalid. expected: ${prNumber}`);
      } else {
        resolve(payload);
      }
    });
  });
}
