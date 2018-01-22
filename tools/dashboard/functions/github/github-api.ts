import {config} from 'firebase-functions';
import * as GithubApi from '@octokit/rest';

/** API token for the Github repository. Required to set the github status on commits and PRs. */
const githubAccessToken = config().secret.github;

/** Export the GitHub V3 API instance that is authenticated. */
export const githubApiV3 = new GithubApi();

// Authenticate the Github API package with the user token.
githubApiV3.authenticate({type: 'token', token: githubAccessToken});
