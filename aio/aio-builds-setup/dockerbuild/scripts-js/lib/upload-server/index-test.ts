// Imports
import {GithubPullRequests} from '../common/github-pull-requests';
import {BUILD_VERIFICATION_STATUS, BuildVerifier} from './build-verifier';

// Run
// TODO(gkalpak): Add e2e tests to cover these interactions as well.
GithubPullRequests.prototype.addComment = () => Promise.resolve();
BuildVerifier.prototype.verify = () => Promise.resolve(BUILD_VERIFICATION_STATUS.verifiedAndTrusted);
// tslint:disable-next-line: no-var-requires
require('./index');
