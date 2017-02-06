// Imports
import {GithubApi} from './github-api';

// Interfaces - Types
interface PullRequest  {
  number: number;
}

export type PullRequestState = 'all' | 'closed' | 'open';

// Classes
export class GithubPullRequests extends GithubApi {
  // Methods - Public
  public addComment(pr: number, body: string): Promise<void> {
    if (!(pr > 0)) {
      throw new Error(`Invalid PR number: ${pr}`);
    } else if (!body) {
      throw new Error(`Invalid or empty comment body: ${body}`);
    }

    return this.post<void>(`/repos/${this.repoSlug}/issues/${pr}/comments`, null, {body});
  }

  public fetchAll(state: PullRequestState = 'all'): Promise<PullRequest[]> {
    process.stdout.write(`Fetching ${state} pull requests...`);
    return this.fetchUntilDone(state, 0);
  }

  // Methods - Protected
  protected fetchUntilDone(state: PullRequestState, currentPage: number): Promise<PullRequest[]> {
    process.stdout.write('.');

    const perPage = 100;
    const pathname = `/repos/${this.repoSlug}/pulls`;
    const params = {
      page: currentPage,
      per_page: perPage,
      state,
    };

    return this.get<PullRequest[]>(pathname, params).then(pullRequests => {
      if (pullRequests.length < perPage) {
        console.log('done');
        return pullRequests;
      }

      return this.fetchUntilDone(state, currentPage + 1).
        then(morePullRequests => [...pullRequests, ...morePullRequests]);
    });
  }
}
