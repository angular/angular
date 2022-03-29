import {
  AuthenticatedGithubClient,
  GithubClient,
  ReleaseRepoWithApi,
  assertValidGithubConfig,
  getConfig,
  getNextBranchName,
} from '@angular/dev-infra-private/ng-dev';

import {githubAccessToken} from './utils';

export function getReleaseRepoWithApi(): ReleaseRepoWithApi {
  const githubClient =
    githubAccessToken !== undefined
      ? new AuthenticatedGithubClient(githubAccessToken)
      : new GithubClient();
  const {github} = getConfig([assertValidGithubConfig]);

  return {
    api: githubClient,
    name: github.name,
    owner: github.owner,
    nextBranchName: getNextBranchName(github),
  };
}
