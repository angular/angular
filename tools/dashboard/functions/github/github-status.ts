import {githubApiV3} from './github-api';

/** Data that must be specified to set a Github PR status. */
export type GithubStatusData = {
  result: boolean;
  name: string;
  description: string;
  url?: string;
};

/** Function that sets a Github commit status */
export function setGithubStatus(commitSHA: string, data: GithubStatusData) {
  const state = data.result ? 'success' : 'failure';

  return githubApiV3.repos.createStatus({
    owner: 'angular',
    repo: 'material2',
    sha: commitSHA,
    state: state,
    target_url: data.url,
    description: data.description,
    context: data.name,
  });
}
