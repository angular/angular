// Imports
import {assertNotMissingOrEmpty} from '../common/utils';
import {GithubApi} from './github-api';

// Interfaces - Types
export interface PullRequest  {
  number: number;
  user: {login: string};
  labels: {name: string}[];
}

export type PullRequestState = 'all' | 'closed' | 'open';

// Classes
export class GithubPullRequests extends GithubApi {
  // Constructor
  constructor(githubToken: string, protected repoSlug: string) {
    super(githubToken);
    assertNotMissingOrEmpty('repoSlug', repoSlug);
  }

  // Methods - Public
  public addComment(pr: number, body: string): Promise<void> {
    if (!(pr > 0)) {
      throw new Error(`Invalid PR number: ${pr}`);
    } else if (!body) {
      throw new Error(`Invalid or empty comment body: ${body}`);
    }

    return this.post<void>(`/repos/${this.repoSlug}/issues/${pr}/comments`, null, {body});
  }

  public fetch(pr: number): Promise<PullRequest> {
    // Using the `/issues/` URL, because the `/pulls/` one does not provide labels.
    return this.get<PullRequest>(`/repos/${this.repoSlug}/issues/${pr}`);
  }

  public fetchAll(state: PullRequestState = 'all'): Promise<PullRequest[]> {
    console.log(`Fetching ${state} pull requests...`);

    const pathname = `/repos/${this.repoSlug}/pulls`;
    const params = {state};

    return this.getPaginated<PullRequest>(pathname, params);
  }
}
