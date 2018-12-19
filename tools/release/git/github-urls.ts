/** Gets a Github URL that refers to a lists of recent commits within a specified branch. */
export function getGithubBranchCommitsUrl(owner: string, repository: string, branchName: string) {
  return `https://github.com/${owner}/${repository}/commits/${branchName}`;
}

/** Gets a Github URL that refers list of releases within the specified repository. */
export function getGithubReleasesUrl(owner: string, repository: string) {
  return `https://github.com/${owner}/${repository}/releases`;
}
