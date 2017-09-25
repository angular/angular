// Imports
import {GithubPullRequests} from '../common/github-pull-requests';
import {BUILD_VERIFICATION_STATUS, BuildVerifier} from '../upload-server/build-verifier';
import {UploadError} from '../upload-server/upload-error';
import * as c from './constants';

// Run
// TODO(gkalpak): Add e2e tests to cover these interactions as well.
GithubPullRequests.prototype.addComment = () => Promise.resolve();
BuildVerifier.prototype.getPrIsTrusted = (pr: number) => {
  switch (pr) {
    case c.BV_getPrIsTrusted_error:
      // For e2e tests, fake an error.
      return Promise.reject('Test');
    case c.BV_getPrIsTrusted_notTrusted:
      // For e2e tests, fake an untrusted PR (`false`).
      return Promise.resolve(false);
    default:
      // For e2e tests, default to trusted PRs (`true`).
      return Promise.resolve(true);
  }
};
BuildVerifier.prototype.verify = (expectedPr: number, authHeader: string) => {
  switch (authHeader) {
    case c.BV_verify_error:
      // For e2e tests, fake a verification error.
      return Promise.reject(new UploadError(403, `Error while verifying upload for PR ${expectedPr}: Test`));
    case c.BV_verify_verifiedNotTrusted:
      // For e2e tests, fake a `verifiedNotTrusted` verification status.
      return Promise.resolve(BUILD_VERIFICATION_STATUS.verifiedNotTrusted);
    default:
      // For e2e tests, default to `verifiedAndTrusted` verification status.
      return Promise.resolve(BUILD_VERIFICATION_STATUS.verifiedAndTrusted);
  }
};

// tslint:disable-next-line: no-var-requires
require('../upload-server/index');
