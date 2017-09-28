import {GraphQLClient} from 'graphql-request';
import {config} from 'firebase-functions';
import * as GithubApi from 'github';

/** API token for the Github repository. Required to set the github status on commits and PRs. */
const githubAccessToken = config().secret.github;

/** API Endpoint for the Github API v4 using GraphQL. */
const githubApiV4Endpoint = 'https://api.github.com/graphql';

/** Export the GitHub V3 API instance that is authenticated. */
export const githubApiV3 = new GithubApi();

/** Export the GraphQL client that can be used to query the Github API v4. */
export const githubApiV4 = new GraphQLClient(githubApiV4Endpoint, {
  headers: {
    Authorization: `Bearer ${githubAccessToken}`,
  }
});

// Authenticate the Github API package with the user token.
githubApiV3.authenticate({type: 'token', token: githubAccessToken});
