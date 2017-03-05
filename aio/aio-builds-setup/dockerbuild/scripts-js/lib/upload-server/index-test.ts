// Imports
import {GithubPullRequests} from '../common/github-pull-requests';
import {BuildVerifier} from './build-verifier';

// Run
// TODO(gkalpak): Add e2e tests to cover these interactions as well.
GithubPullRequests.prototype.addComment = () => Promise.resolve();
BuildVerifier.prototype.verify = () => Promise.resolve();
// tslint:disable-next-line: no-var-requires
require('./index');
