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
    console.log(`Fetching ${state} pull requests...`);

    const pathname = `/repos/${this.repoSlug}/pulls`;
    const params = {state};

    return this.getPaginated<PullRequest>(pathname, params);
  }
}
