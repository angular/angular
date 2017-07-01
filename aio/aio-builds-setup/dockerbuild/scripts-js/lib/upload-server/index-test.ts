// Imports
import {GithubPullRequests} from '../common/github-pull-requests';
import {BUILD_VERIFICATION_STATUS, BuildVerifier} from './build-verifier';
import {UploadError} from './upload-error';

// Run
// TODO(gkalpak): Add e2e tests to cover these interactions as well.
GithubPullRequests.prototype.addComment = () => Promise.resolve();
BuildVerifier.prototype.verify = (expectedPr: number, authHeader: string) => {
  switch (authHeader) {
    case 'FAKE_VERIFICATION_ERROR':
      // For e2e tests, fake a verification error.
      return Promise.reject(new UploadError(403, `Error while verifying upload for PR ${expectedPr}: Test`));
    case 'FAKE_VERIFIED_NOT_TRUSTED':
      // For e2e tests, fake a `verifiedNotTrusted` verification status.
      return Promise.resolve(BUILD_VERIFICATION_STATUS.verifiedNotTrusted);
    default:
      // For e2e tests, default to `verifiedAndTrusted` verification status.
      return Promise.resolve(BUILD_VERIFICATION_STATUS.verifiedAndTrusted);
  }
};

// tslint:disable-next-line: no-var-requires
require('./index');
