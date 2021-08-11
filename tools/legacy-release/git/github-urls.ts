/** Gets a Github URL that refers to a lists of recent commits within a specified branch. */
export function getGithubBranchCommitsUrl(owner: string, repository: string, branchName: string) {
  return `https://github.com/${owner}/${repository}/commits/${branchName}`;
}

/** Gets a Github URL that can be used to create a new release from a given tag. */
export function getGithubNewReleaseUrl(options: {owner: string, repository: string,
    tagName: string, releaseTitle: string, body: string}) {

  return `https://github.com/${options.owner}/${options.repository}/releases/new?` +
    `tag=${encodeURIComponent(options.tagName)}&` +
    `title=${encodeURIComponent(options.releaseTitle)}&` +
    `body=${encodeURIComponent(options.body)}`;
}
