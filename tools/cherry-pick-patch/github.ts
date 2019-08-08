import * as OctokitApi from '@octokit/rest';

// TODO: Consider using local git information for the data to avoid worrying about rate limits. */
/** Class to act as an interface to the GitHub API. */
export class GitHub {
  // TODO: Use an authentication token to increase rate limits.
  /** Octokit API instance that can be used to make Github API calls. */
  private _api = new OctokitApi();

  /** Owner of the repository to query. */
  private _owner = 'angular';

  /** Name of the repository to query. */
  private _name = 'components';

  /**
   * Retrieves merged patch-eligible pull requests that have been merged since the date.
   * Results are sorted by merge date.
   */
  async getPatchPullRequestsSince(dateSince: string): Promise<OctokitApi.PullsGetResponse[]> {
    const query = 'base:master is:pr -label:"target: minor" -label:"target: major" is:merged' +
        ` merged:>${dateSince}`;
    const result = await this._search(query);

    // Load information for each pull request. Waits for each pull request response until loading
    // the next pull request to avoid GitHub's abuse detection (too many calls in a short amount
    // of time).
    const pullRequests: OctokitApi.PullsGetResponse[] = [];
    for (let i = 0; i < result.items.length; i++) {
      pullRequests.push(await this.loadPullRequest(result.items[i].number));
    }

    // Sort by merge date.
    pullRequests.sort((a, b) => (a.merged_at < b.merged_at) ? -1 : 1);
    return pullRequests;
  }

  /** Loads the information for the provided pull request number. */
  async loadPullRequest(prNumber: number): Promise<OctokitApi.PullsGetResponse> {
    const response = await this._api.pulls.get({
      owner: this._owner,
      repo: this._name,
      pull_number: prNumber,
    });
    return response.data;
  }

  /** Gets the commit information for the given SHA. */
  async getCommit(sha: string): Promise<OctokitApi.ReposGetCommitResponse> {
    const response = await this._api.repos.getCommit({
      owner: this._owner,
      repo: this._name,
      ref: sha,
    });

    return response.data;
  }

  /** Retrieves the list of latest commits from the branch. */
  async listCommits(branch: string): Promise<OctokitApi.ReposListCommitsResponse> {
    const response = await this._api.repos.listCommits({
      owner: this._owner,
      repo: this._name,
      sha: branch,
    });

    return response.data;
  }

  // TODO: Handle pagination in case there are more than 100 results.
  /** Gets a suggestion for the latest patch branch. */
  async getPatchBranchSuggestion(): Promise<string> {
    const response = await this._api.repos.listBranches({owner: this._owner, repo: this._name});

    // Matches branch names that have two digits separated by period and ends with an x
    const patchBranches =
        response.data.map(branch => branch.name).filter(name => !!/^\d+\.\d+\.x$/g.exec(name));
    return patchBranches.pop() || '';
  }

  // TODO: Handle pagination in case there are more than 100 results.
  /** Searches the repository using the provided query. */
  private async _search(query: string): Promise<{items: any[]}> {
    const scopedQuery = `repo:${this._owner}/${this._name} ${query}`;
    const result = await this._api.search.issuesAndPullRequests({per_page: 100, q: scopedQuery});
    return result.data;
  }
}
