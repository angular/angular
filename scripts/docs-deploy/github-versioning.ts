import {
  AuthenticatedGithubClient,
  GithubClient,
  ReleaseRepoWithApi,
  assertValidGithubConfig,
  getConfig,
  getNextBranchName,
} from '@angular/dev-infra-private/ng-dev';

export function getReleaseRepoWithApi(): ReleaseRepoWithApi {
  const githubClient =
    process.env.GITHUB_TOKEN !== undefined
      ? new AuthenticatedGithubClient(process.env.GITHUB_TOKEN)
      : new GithubClient();
  const {github} = getConfig([assertValidGithubConfig]);

  return {
    api: githubClient,
    name: github.name,
    owner: github.owner,
    nextBranchName: getNextBranchName(github),
  };
}
