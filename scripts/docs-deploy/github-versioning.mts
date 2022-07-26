import {
  AuthenticatedGithubClient,
  GithubClient,
  ReleaseRepoWithApi,
  assertValidGithubConfig,
  getConfig,
  getNextBranchName,
} from '@angular/ng-dev';

import {githubAccessToken} from './utils.mjs';

export async function getReleaseRepoWithApi(): Promise<ReleaseRepoWithApi> {
  const githubClient =
    githubAccessToken !== undefined
      ? new AuthenticatedGithubClient(githubAccessToken)
      : new GithubClient();
  const {github} = await getConfig([assertValidGithubConfig]);

  return {
    api: githubClient,
    name: github.name,
    owner: github.owner,
    nextBranchName: getNextBranchName(github),
  };
}
